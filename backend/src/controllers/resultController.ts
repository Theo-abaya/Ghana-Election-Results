import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { CandidateType } from "@prisma/client";
import { AuthRequest } from "../middlewares/authMiddleware";
import { broadcastNewResult } from "../websocket/sockets";
/**
 * Submit polling station results
 */
export const submitResult = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pollingStationId, candidateId, votes } = req.body;

    if (!pollingStationId || !candidateId || votes === undefined) {
      return res.status(400).json({
        message: "pollingStationId, candidateId, and votes are required",
      });
    }

    if (votes < 0) {
      return res.status(400).json({ message: "Votes cannot be negative" });
    }

    // Check if polling station exists
    const pollingStation = await prisma.pollingStation.findUnique({
      where: { id: pollingStationId },
    });
    if (!pollingStation) {
      return res.status(404).json({ message: "Polling station not found" });
    }

    // Check if candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    // Check if result already exists (prevent duplicates)
    const existingResult = await prisma.result.findFirst({
      where: {
        pollingStationId,
        candidateId,
      },
    });

    if (existingResult) {
      return res.status(409).json({
        message: "Result already submitted for this candidate at this station",
      });
    }

    const result = await prisma.result.create({
      data: {
        pollingStationId,
        candidateId,
        votes,
        userId: req.user!.id, // Fixed: was submittedById
      },
      include: {
        candidate: {
          include: { party: true },
        },
        pollingStation: {
          include: { constituency: true },
        },
      },
    });

    // Broadcast the new result via WebSocket
    await broadcastNewResult(result.id);

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Update existing result
 */
export const updateResult = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { votes } = req.body;

    if (votes === undefined) {
      return res.status(400).json({ message: "votes is required" });
    }

    if (votes < 0) {
      return res.status(400).json({ message: "Votes cannot be negative" });
    }

    const result = await prisma.result.findUnique({
      where: { id },
    });

    if (!result) {
      return res.status(404).json({ message: "Result not found" });
    }

    const updatedResult = await prisma.result.update({
      where: { id },
      data: { votes },
      include: {
        candidate: {
          include: { party: true },
        },
        pollingStation: {
          include: { constituency: true },
        },
      },
    });

    // Broadcast the updated result via WebSocket
    await broadcastNewResult(updatedResult.id);

    res.json(updatedResult);
  } catch (err) {
    next(err);
  }
};
/**
 * Get presidential results with national aggregation
 */
export const getPresidentialResults = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get all presidential candidates
    const candidates = await prisma.candidate.findMany({
      where: { type: CandidateType.PRESIDENTIAL },
      include: { party: true },
    });

    // Get vote totals for each candidate
    const results = await Promise.all(
      candidates.map(async (candidate) => {
        const totalVotes = await prisma.result.aggregate({
          where: { candidateId: candidate.id },
          _sum: { votes: true },
        });

        return {
          ...candidate,
          votes: totalVotes._sum.votes || 0,
        };
      })
    );

    // Calculate total votes cast
    const totalVotesCast = results.reduce((sum, r) => sum + r.votes, 0);

    // Calculate percentages and sort by votes
    const resultsWithPercentage = results
      .map((result) => ({
        ...result,
        percentage:
          totalVotesCast > 0 ? (result.votes / totalVotesCast) * 100 : 0,
      }))
      .sort((a, b) => b.votes - a.votes);

    // Get national statistics
    const totalPollingStations = await prisma.pollingStation.count();
    const reportingStations = await prisma.result.groupBy({
      by: ["pollingStationId"],
    });

    const nationalStats = {
      totalVotes: totalVotesCast,
      validVotes: totalVotesCast,
      rejectedVotes: 0, // Not tracked in current schema
      totalRegisteredVoters: 0, // Not tracked in current schema
      turnout: 0, // Cannot calculate without registered voters
      reportingStations: reportingStations.length,
      totalStations: totalPollingStations,
    };

    res.json({
      candidates: resultsWithPercentage,
      nationalStats,
      lastUpdated: new Date(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get parliamentary results by constituency
 */
export const getParliamentaryResults = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { constituencyId } = req.params;

    // Get constituency details
    const constituency = await prisma.constituency.findUnique({
      where: { id: constituencyId },
      select: {
        id: true,
        name: true,
        region: true,
      },
    });

    if (!constituency) {
      return res.status(404).json({ message: "Constituency not found" });
    }

    // Get all parliamentary candidates for this constituency
    const candidates = await prisma.candidate.findMany({
      where: {
        type: CandidateType.PARLIAMENTARY,
        constituencyId: constituencyId,
      },
      include: { party: true },
    });

    // Get polling stations in this constituency
    const pollingStations = await prisma.pollingStation.findMany({
      where: { constituencyId: constituencyId },
    });

    // Get vote totals for each candidate
    const results = await Promise.all(
      candidates.map(async (candidate) => {
        const totalVotes = await prisma.result.aggregate({
          where: {
            candidateId: candidate.id,
            pollingStation: { constituencyId: constituencyId },
          },
          _sum: { votes: true },
        });

        return {
          ...candidate,
          votes: totalVotes._sum.votes || 0,
        };
      })
    );

    // Calculate totals
    const totalVotesCast = results.reduce((sum, r) => sum + r.votes, 0);

    // Calculate percentages and determine winner
    const resultsWithPercentage = results
      .map((result) => ({
        ...result,
        percentage:
          totalVotesCast > 0 ? (result.votes / totalVotesCast) * 100 : 0,
      }))
      .sort((a, b) => b.votes - a.votes);

    const winner = resultsWithPercentage[0];

    // Get reporting status
    const reportingStations = await prisma.result.groupBy({
      by: ["pollingStationId"],
      where: {
        pollingStation: { constituencyId: constituencyId },
      },
    });

    res.json({
      constituency: {
        id: constituency.id,
        name: constituency.name,
        region: constituency.region,
      },
      candidates: resultsWithPercentage,
      winner: winner
        ? {
            name: winner.name,
            party: winner.party.abbreviation,
            votes: winner.votes,
            percentage: winner.percentage,
          }
        : null,
      stats: {
        totalVotes: totalVotesCast,
        registeredVoters: 0, // Not tracked in schema
        rejectedVotes: 0, // Not tracked in schema
        turnout: 0, // Cannot calculate
        reportingStations: reportingStations.length,
        totalStations: pollingStations.length,
      },
      lastUpdated: new Date(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get results by region (both presidential and parliamentary)
 */
export const getResultsByRegion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { region } = req.params;

    // Validate region enum
    const validRegions = [
      "GREATER_ACCRA",
      "ASHANTI",
      "NORTHERN",
      "WESTERN",
      "EASTERN",
      "CENTRAL",
      "VOLTA",
      "UPPER_EAST",
      "UPPER_WEST",
      "SAVANNAH",
      "BONO",
      "BONO_EAST",
      "AHAFO",
      "WESTERN_NORTH",
      "OTI",
      "NORTH_EAST",
    ];

    if (!validRegions.includes(region.toUpperCase())) {
      return res.status(400).json({ message: "Invalid region" });
    }

    // Get all constituencies in this region
    const constituencies = await prisma.constituency.findMany({
      where: { region: region as any },
      include: {
        pollingStations: true,
      },
    });

    if (constituencies.length === 0) {
      return res
        .status(404)
        .json({ message: "No constituencies found for this region" });
    }

    // Get all polling stations in this region
    const pollingStationIds = constituencies.flatMap((c) =>
      c.pollingStations.map((ps) => ps.id)
    );

    // Get presidential results for this region
    const presidentialCandidates = await prisma.candidate.findMany({
      where: { type: CandidateType.PRESIDENTIAL },
      include: { party: true },
    });

    const presidentialResults = await Promise.all(
      presidentialCandidates.map(async (candidate) => {
        const totalVotes = await prisma.result.aggregate({
          where: {
            candidateId: candidate.id,
            pollingStationId: { in: pollingStationIds },
          },
          _sum: { votes: true },
        });

        return {
          ...candidate,
          votes: totalVotes._sum.votes || 0,
        };
      })
    );

    const totalPresidentialVotes = presidentialResults.reduce(
      (sum, r) => sum + r.votes,
      0
    );

    const presidentialResultsWithPercentage = presidentialResults
      .map((result) => ({
        ...result,
        percentage:
          totalPresidentialVotes > 0
            ? (result.votes / totalPresidentialVotes) * 100
            : 0,
      }))
      .sort((a, b) => b.votes - a.votes);

    // Get parliamentary results for each constituency
    const constituencyResults = await Promise.all(
      constituencies.map(async (constituency) => {
        const candidates = await prisma.candidate.findMany({
          where: {
            type: CandidateType.PARLIAMENTARY,
            constituencyId: constituency.id,
          },
          include: { party: true },
        });

        const results = await Promise.all(
          candidates.map(async (candidate) => {
            const totalVotes = await prisma.result.aggregate({
              where: {
                candidateId: candidate.id,
                pollingStation: { constituencyId: constituency.id },
              },
              _sum: { votes: true },
            });

            return {
              ...candidate,
              votes: totalVotes._sum.votes || 0,
            };
          })
        );

        const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);
        const winner = results.sort((a, b) => b.votes - a.votes)[0];

        return {
          constituencyName: constituency.name,
          winner: winner
            ? {
                name: winner.name,
                party: winner.party.abbreviation,
                votes: winner.votes,
              }
            : null,
          totalVotes,
        };
      })
    );

    res.json({
      region: {
        name: region,
        constituencies: constituencies.length,
      },
      presidential: {
        candidates: presidentialResultsWithPercentage,
        totalVotes: totalPresidentialVotes,
        leadingParty:
          presidentialResultsWithPercentage[0]?.party.abbreviation || null,
      },
      parliamentary: {
        constituencies: constituencyResults,
        totalSeats: constituencies.length,
      },
      stats: {
        registeredVoters: 0, // Not tracked in schema
        totalVotesCast: totalPresidentialVotes,
        rejectedVotes: 0, // Not tracked in schema
        turnout: 0, // Cannot calculate
        totalPollingStations: pollingStationIds.length,
      },
      lastUpdated: new Date(),
    });
  } catch (err) {
    next(err);
  }
};

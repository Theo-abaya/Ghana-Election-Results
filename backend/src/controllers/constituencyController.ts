import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { Region } from "@prisma/client";

/**
 * Get all constituencies (all 275)
 */
export const getAllConstituencies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { region } = req.query;

    // Build where clause based on query params
    const where = region ? { region: region as Region } : {};

    const constituencies = await prisma.constituency.findMany({
      where,
      include: {
        _count: {
          select: {
            pollingStations: true,
            candidates: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    // Format response with summary data
    const formattedConstituencies = constituencies.map((c) => ({
      id: c.id,
      name: c.name,
      region: c.region,
      pollingStations: c._count.pollingStations,
      candidates: c._count.candidates,
    }));

    res.json({
      total: formattedConstituencies.length,
      constituencies: formattedConstituencies,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single constituency by ID with full details
 */
export const getConstituencyById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const constituency = await prisma.constituency.findUnique({
      where: { id },
      include: {
        pollingStations: {
          select: {
            id: true,
            name: true,
            code: true,
            location: true,
          },
        },
        candidates: {
          include: {
            party: {
              select: {
                id: true,
                name: true,
                abbreviation: true,
                color: true,
              },
            },
          },
        },
      },
    });

    if (!constituency) {
      return res.status(404).json({ message: "Constituency not found" });
    }

    // Get vote statistics for this constituency
    const totalVotes = await prisma.result.aggregate({
      where: {
        pollingStation: {
          constituencyId: id,
        },
      },
      _sum: {
        votes: true,
      },
    });

    // Get reporting status
    const reportingStations = await prisma.result.groupBy({
      by: ["pollingStationId"],
      where: {
        pollingStation: {
          constituencyId: id,
        },
      },
    });

    res.json({
      ...constituency,
      stats: {
        totalVotes: totalVotes._sum.votes || 0,
        totalPollingStations: constituency.pollingStations.length,
        reportingStations: reportingStations.length,
        reportingPercentage:
          constituency.pollingStations.length > 0
            ? (reportingStations.length / constituency.pollingStations.length) *
              100
            : 0,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get constituencies by region
 */
export const getConstituenciesByRegion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { region } = req.params;

    // Validate region is a valid enum value
    const validRegions = Object.values(Region);
    if (!validRegions.includes(region as Region)) {
      return res.status(400).json({
        message: `Invalid region. Must be one of: ${validRegions.join(", ")}`,
      });
    }

    const constituencies = await prisma.constituency.findMany({
      where: { region: region as Region },
      include: {
        _count: {
          select: {
            pollingStations: true,
            candidates: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json({
      region,
      total: constituencies.length,
      constituencies: constituencies.map((c) => ({
        id: c.id,
        name: c.name,
        region: c.region,
        pollingStations: c._count.pollingStations,
        candidates: c._count.candidates,
      })),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new constituency (Admin only)
 */
export const createConstituency = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, region } = req.body;

    if (!name || !region) {
      return res.status(400).json({ message: "Name and region are required" });
    }

    // Validate region is a valid enum value
    const validRegions = Object.values(Region);
    if (!validRegions.includes(region)) {
      return res.status(400).json({
        message: `Invalid region. Must be one of: ${validRegions.join(", ")}`,
      });
    }

    const constituency = await prisma.constituency.create({
      data: {
        name,
        region: region as Region,
      },
    });

    res.status(201).json(constituency);
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Constituency already exists" });
    }
    next(err);
  }
};

/**
 * Update constituency (Admin only)
 */
export const updateConstituency = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, region } = req.body;

    const constituency = await prisma.constituency.findUnique({
      where: { id },
    });

    if (!constituency) {
      return res.status(404).json({ message: "Constituency not found" });
    }

    // Validate region if provided
    if (region) {
      const validRegions = Object.values(Region);
      if (!validRegions.includes(region)) {
        return res.status(400).json({
          message: `Invalid region. Must be one of: ${validRegions.join(", ")}`,
        });
      }
    }

    const updatedConstituency = await prisma.constituency.update({
      where: { id },
      data: {
        name: name || constituency.name,
        region: region || constituency.region,
      },
    });

    res.json(updatedConstituency);
  } catch (err: any) {
    if (err.code === "P2002") {
      return res
        .status(409)
        .json({ message: "Constituency name already exists" });
    }
    next(err);
  }
};

/**
 * Delete constituency (Admin only)
 */
export const deleteConstituency = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const constituency = await prisma.constituency.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            pollingStations: true,
            candidates: true,
          },
        },
      },
    });

    if (!constituency) {
      return res.status(404).json({ message: "Constituency not found" });
    }

    // Prevent deletion if constituency has associated data
    if (
      constituency._count.pollingStations > 0 ||
      constituency._count.candidates > 0
    ) {
      return res.status(400).json({
        message:
          "Cannot delete constituency with associated polling stations or candidates",
      });
    }

    await prisma.constituency.delete({
      where: { id },
    });

    res.json({ message: "Constituency deleted successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * Get constituency results (parliamentary)
 */
export const getConstituencyResults = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const constituency = await prisma.constituency.findUnique({
      where: { id },
    });

    if (!constituency) {
      return res.status(404).json({ message: "Constituency not found" });
    }

    // Get all parliamentary candidates for this constituency
    const candidates = await prisma.candidate.findMany({
      where: {
        type: "PARLIAMENTARY",
        constituencyId: id,
      },
      include: {
        party: true,
      },
    });

    // Get vote totals for each candidate
    const results = await Promise.all(
      candidates.map(async (candidate) => {
        const totalVotes = await prisma.result.aggregate({
          where: {
            candidateId: candidate.id,
            pollingStation: { constituencyId: id },
          },
          _sum: { votes: true },
        });

        return {
          candidate: {
            id: candidate.id,
            name: candidate.name,
            party: {
              name: candidate.party.name,
              abbreviation: candidate.party.abbreviation,
              color: candidate.party.color,
            },
          },
          votes: totalVotes._sum.votes || 0,
        };
      })
    );

    // Calculate totals and percentages
    const totalVotes = results.reduce((sum, r) => sum + r.votes, 0);

    const resultsWithPercentage = results
      .map((r) => ({
        ...r,
        percentage: totalVotes > 0 ? (r.votes / totalVotes) * 100 : 0,
      }))
      .sort((a, b) => b.votes - a.votes);

    const winner = resultsWithPercentage[0];

    // Get polling station reporting status
    const pollingStations = await prisma.pollingStation.count({
      where: { constituencyId: id },
    });

    const reportingStations = await prisma.result.groupBy({
      by: ["pollingStationId"],
      where: {
        pollingStation: { constituencyId: id },
      },
    });

    res.json({
      constituency: {
        id: constituency.id,
        name: constituency.name,
        region: constituency.region,
      },
      results: resultsWithPercentage,
      winner: winner
        ? {
            candidateName: winner.candidate.name,
            party: winner.candidate.party.abbreviation,
            votes: winner.votes,
            percentage: winner.percentage,
          }
        : null,
      stats: {
        totalVotes,
        totalPollingStations: pollingStations,
        reportingStations: reportingStations.length,
        reportingPercentage:
          pollingStations > 0
            ? (reportingStations.length / pollingStations) * 100
            : 0,
      },
      lastUpdated: new Date(),
    });
  } catch (err) {
    next(err);
  }
};

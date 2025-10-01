// src/controllers/resultController.ts
import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { CandidateType, Region } from "@prisma/client";
import { AuthRequest } from "../middlewares/authMiddleware";

/**
 * Submit a result (Polling Officer only)
 */
export const submitResult = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { candidateId, pollingStationId, votes } = req.body;
    const userId = req.user?.id;

    if (!candidateId || !pollingStationId || votes == null) {
      return res.status(400).json({
        message: "candidateId, pollingStationId, and votes are required",
      });
    }

    // Ensure candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
    });
    if (!candidate)
      return res.status(404).json({ message: "Candidate not found" });

    // Ensure polling station exists
    const pollingStation = await prisma.pollingStation.findUnique({
      where: { id: pollingStationId },
    });
    if (!pollingStation)
      return res.status(404).json({ message: "Polling station not found" });

    // Create result
    const result = await prisma.result.create({
      data: { candidateId, pollingStationId, votes, userId: userId! },
      include: { candidate: true, pollingStation: true },
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Update a result (Polling Officer only)
 */
export const updateResult = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { votes } = req.body;

    if (votes == null) {
      return res.status(400).json({ message: "Votes value is required" });
    }

    const existing = await prisma.result.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Result not found" });

    const updated = await prisma.result.update({
      where: { id },
      data: { votes },
      include: { candidate: true, pollingStation: true },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * Get aggregated presidential results
 */
export const getPresidentialResults = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const results = await prisma.result.groupBy({
      by: ["candidateId"],
      where: { candidate: { type: CandidateType.PRESIDENTIAL } },
      _sum: { votes: true },
    });

    const detailedResults = await Promise.all(
      results.map(async (r) => {
        const candidate = await prisma.candidate.findUnique({
          where: { id: r.candidateId },
          include: { party: true },
        });
        return { candidate, totalVotes: r._sum.votes };
      })
    );

    res.json(detailedResults);
  } catch (err) {
    next(err);
  }
};

/**
 * Get parliamentary results for a constituency
 */
export const getParliamentaryResults = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { constituencyId } = req.params;
    if (!constituencyId)
      return res.status(400).json({ message: "constituencyId is required" });

    const results = await prisma.result.findMany({
      where: {
        candidate: { constituencyId, type: CandidateType.PARLIAMENTARY },
      },
      include: { candidate: true, pollingStation: true },
    });

    res.json(results);
  } catch (err) {
    next(err);
  }
};

/**
 * Get results by region
 */
export const getResultsByRegion = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { region } = req.params;

    // Validate region
    if (!region || !Object.values(Region).includes(region as Region)) {
      return res.status(400).json({ message: "Invalid or missing region" });
    }

    const results = await prisma.result.findMany({
      where: {
        candidate: {
          constituency: { region: region as Region },
        },
      },
      include: { candidate: true, pollingStation: true },
    });

    res.json(results);
  } catch (err) {
    next(err);
  }
};

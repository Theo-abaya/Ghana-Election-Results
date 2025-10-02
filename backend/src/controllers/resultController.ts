import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { Region } from "@prisma/client";
import { AuthRequest } from "../middlewares/authMiddleware";
import { aggregateResults } from "../utils/aggregateResults";

/**
 * Submit a result
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
    if (!userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Validate foreign keys
    const [candidate, station] = await Promise.all([
      prisma.candidate.findUnique({ where: { id: candidateId } }),
      prisma.pollingStation.findUnique({ where: { id: pollingStationId } }),
    ]);
    if (!candidate)
      return res.status(404).json({ message: "Candidate not found" });
    if (!station)
      return res.status(404).json({ message: "Polling station not found" });

    const result = await prisma.$transaction(async (tx) => {
      const created = await tx.result.create({
        data: { candidateId, pollingStationId, votes, userId },
        include: { candidate: true, pollingStation: true },
      });

      await tx.auditLog.create({
        data: {
          action: "RESULT_CREATED",
          entity: "Result",
          entityId: created.id,
          oldValue: 0,
          newValue: { votes },
          userId,
        },
      });

      return created;
    });

    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
};

/**
 * Update a result
 */
export const updateResult = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { votes } = req.body;
    const userId = req.user?.id;

    if (votes == null)
      return res.status(400).json({ message: "Votes value is required" });
    if (!userId) return res.status(403).json({ message: "Unauthorized" });

    const existing = await prisma.result.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Result not found" });

    // Authorization: only creator or ADMIN may update
    if (existing.userId !== userId && req.user?.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Forbidden: cannot update this result" });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const upd = await tx.result.update({
        where: { id },
        data: { votes },
        include: { candidate: true, pollingStation: true },
      });

      await tx.auditLog.create({
        data: {
          action: "RESULT_UPDATED",
          entity: "Result",
          entityId: id,
          oldValue: { votes: existing.votes },
          newValue: { votes },
          userId,
        },
      });

      return upd;
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

/**
 * Delete a result
 */
export const deleteResult = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) return res.status(403).json({ message: "Unauthorized" });

    const existing = await prisma.result.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ message: "Result not found" });

    // Authorization: only creator or ADMIN may delete
    if (existing.userId !== userId && req.user?.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Forbidden: cannot delete this result" });
    }

    await prisma.$transaction(async (tx) => {
      await tx.result.delete({ where: { id } });

      await tx.auditLog.create({
        data: {
          action: "RESULT_DELETED",
          entity: "Result",
          entityId: id,
          oldValue: { votes: existing.votes },
          newValue: 0,
          userId,
        },
      });
    });

    res.json({ message: "Result deleted successfully" });
  } catch (err) {
    next(err);
  }
};

/**
 * Aggregated presidential results
 */
export const getPresidentialResults = async (_req: Request, res: Response) => {
  const data = await aggregateResults({ scope: "presidential" });
  res.json(data);
};

/**
 * Parliamentary results by constituency
 */
export const getParliamentaryResults = async (req: Request, res: Response) => {
  const { constituencyId } = req.params;
  if (!constituencyId)
    return res.status(400).json({ message: "constituencyId is required" });

  const data = await aggregateResults({
    scope: "parliamentary",
    constituencyId,
  });
  res.json({ constituencyId, ...data });
};

/**
 * Regional results
 */
export const getResultsByRegion = async (req: Request, res: Response) => {
  const { region } = req.params;

  if (!region || !Object.values(Region).includes(region as Region)) {
    return res.status(400).json({ message: "Invalid or missing region" });
  }

  const data = await aggregateResults({
    scope: "region",
    region: region as Region,
  });
  res.json({ region, ...data });
};

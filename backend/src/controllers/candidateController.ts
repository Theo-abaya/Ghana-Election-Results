// src/controllers/candidateController.ts
import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { CandidateType } from "@prisma/client";

/**
 * Get all presidential candidates
 */
export const getPresidentialCandidates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const candidates = await prisma.candidate.findMany({
      where: { type: CandidateType.PRESIDENTIAL },
      include: { party: true },
    });
    res.json(candidates);
  } catch (err) {
    next(err);
  }
};

/**
 * Get parliamentary candidates by constituency
 */
export const getParliamentaryCandidates = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { constituencyId } = req.params;

    if (!constituencyId) {
      return res.status(400).json({ message: "constituencyId is required" });
    }

    const candidates = await prisma.candidate.findMany({
      where: { type: CandidateType.PARLIAMENTARY, constituencyId },
      include: { party: true, constituency: true },
    });

    res.json(candidates);
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new candidate
 */
export const createCandidate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, type, partyId, constituencyId } = req.body;

    if (!name || !type || !partyId) {
      return res
        .status(400)
        .json({ message: "Name, type, and partyId are required" });
    }

    if (!["PRESIDENTIAL", "PARLIAMENTARY"].includes(type)) {
      return res.status(400).json({ message: "Invalid candidate type" });
    }

    const partyExists = await prisma.party.findUnique({
      where: { id: partyId },
    });
    if (!partyExists)
      return res.status(404).json({ message: "Party not found" });

    if (type === "PARLIAMENTARY" && !constituencyId) {
      return res
        .status(400)
        .json({
          message: "constituencyId is required for parliamentary candidates",
        });
    }

    if (constituencyId) {
      const constituencyExists = await prisma.constituency.findUnique({
        where: { id: constituencyId },
      });
      if (!constituencyExists)
        return res.status(404).json({ message: "Constituency not found" });
    }

    const candidate = await prisma.candidate.create({
      data: { name, type: type as CandidateType, partyId, constituencyId },
      include: { party: true, constituency: true },
    });

    res.status(201).json(candidate);
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({ message: "Candidate already exists" });
    }
    next(err);
  }
};

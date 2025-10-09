import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";
import { Role, CandidateType } from "@prisma/client";

/**
 * Check if user is admin
 */
const requireAdmin = (req: AuthRequest, res: Response): boolean => {
  if (!req.user || req.user.role !== Role.ADMIN) {
    res.status(403).json({ message: "Admin access required" });
    return false;
  }
  return true;
};

/**
 * Get all candidates (Admin only)
 */
export const getAllCandidates = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const type = req.query.type as CandidateType | undefined;
    const constituencyId = req.query.constituencyId as string | undefined;

    const candidates = await prisma.candidate.findMany({
      where: {
        ...(type && { type }),
        ...(constituencyId && { constituencyId }),
      },
      include: {
        party: true,
        constituency: true,
      },
      orderBy: { name: "asc" },
    });

    return res.json(candidates);
  } catch (error) {
    console.error("Get all candidates error:", error);
    return res.status(500).json({ message: "Failed to fetch candidates" });
  }
};

/**
 * ✅ Get Presidential Candidates
 */
export const getPresidentialCandidates = async (
  req: Request,
  res: Response
) => {
  try {
    const candidates = await prisma.candidate.findMany({
      where: { type: CandidateType.PRESIDENTIAL },
      include: { party: true },
      orderBy: { name: "asc" },
    });
    return res.json(candidates);
  } catch (error) {
    console.error("Error fetching presidential candidates:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * ✅ Get Parliamentary Candidates by Constituency
 */
export const getParliamentaryCandidates = async (
  req: Request,
  res: Response
) => {
  try {
    const { constituencyId } = req.params;
    const candidates = await prisma.candidate.findMany({
      where: { type: CandidateType.PARLIAMENTARY, constituencyId },
      include: { party: true },
    });
    return res.json(candidates);
  } catch (error) {
    console.error("Error fetching parliamentary candidates:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Create candidate (Admin only)
 */
export const createCandidate = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { name, type, partyId, constituencyId } = req.body;

    if (!name || !type || !partyId) {
      return res.status(400).json({
        message: "Name, type, and party are required",
      });
    }

    if (type === CandidateType.PARLIAMENTARY && !constituencyId) {
      return res.status(400).json({
        message: "Constituency is required for parliamentary candidates",
      });
    }

    const candidate = await prisma.candidate.create({
      data: {
        name,
        type,
        partyId,
        ...(constituencyId && { constituencyId }),
      },
      include: {
        party: true,
        constituency: true,
      },
    });

    return res.status(201).json({
      message: "Candidate created successfully",
      candidate,
    });
  } catch (error) {
    console.error("Create candidate error:", error);
    return res.status(500).json({ message: "Failed to create candidate" });
  }
};

/**
 * Update candidate (Admin only)
 */
export const updateCandidate = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { id } = req.params;
    const { name, partyId, constituencyId } = req.body;

    const candidate = await prisma.candidate.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(partyId && { partyId }),
        ...(constituencyId !== undefined && { constituencyId }),
      },
      include: {
        party: true,
        constituency: true,
      },
    });

    return res.json({
      message: "Candidate updated successfully",
      candidate,
    });
  } catch (error: any) {
    console.error("Update candidate error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Candidate not found" });
    }
    return res.status(500).json({ message: "Failed to update candidate" });
  }
};

/**
 * Delete candidate (Admin only)
 */
export const deleteCandidate = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { id } = req.params;

    await prisma.candidate.delete({ where: { id } });

    return res.json({ message: "Candidate deleted successfully" });
  } catch (error: any) {
    console.error("Delete candidate error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Candidate not found" });
    }
    return res.status(500).json({ message: "Failed to delete candidate" });
  }
};

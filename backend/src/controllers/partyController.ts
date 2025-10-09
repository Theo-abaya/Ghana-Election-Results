import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";

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
 * Get all political parties
 */
export const getAllParties = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parties = await prisma.party.findMany({
      include: {
        _count: {
          select: {
            candidates: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json(parties);
  } catch (err) {
    next(err);
  }
};

/**
 * Get single party
 */
export const getPartyById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const party = await prisma.party.findUnique({
      where: { id },
      include: {
        candidates: {
          include: {
            constituency: true,
          },
        },
      },
    });

    if (!party) {
      return res.status(404).json({ message: "Party not found" });
    }

    res.json(party);
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new party (Admin only)
 */
export const createParty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, abbreviation, color, logoUrl } = req.body;

    if (!name || !abbreviation || !color) {
      return res.status(400).json({
        message: "name, abbreviation, and color are required",
      });
    }

    const party = await prisma.party.create({
      data: {
        name,
        abbreviation,
        color,
        logoUrl: logoUrl || null,
      },
    });

    res.status(201).json(party);
  } catch (err: any) {
    if (err.code === "P2002") {
      return res.status(409).json({
        message: "Party with this name or abbreviation already exists",
      });
    }
    next(err);
  }
};

/**
 * Update party (Admin only)
 */
export const updateParty = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { id } = req.params;
    const { name, abbreviation, color, logoUrl } = req.body;

    const party = await prisma.party.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(abbreviation && { abbreviation }),
        ...(color && { color }),
        ...(logoUrl !== undefined && { logoUrl }),
      },
    });

    return res.json({
      message: "Party updated successfully",
      party,
    });
  } catch (error: any) {
    console.error("Update party error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Party not found" });
    }
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Party with this name or abbreviation already exists",
      });
    }
    return res.status(500).json({ message: "Failed to update party" });
  }
};

/**
 * Delete party (Admin only)
 */
export const deleteParty = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const { id } = req.params;

    // Check if party has candidates
    const candidatesCount = await prisma.candidate.count({
      where: { partyId: id },
    });

    if (candidatesCount > 0) {
      return res.status(400).json({
        message: `Cannot delete party with ${candidatesCount} candidate(s). Remove candidates first.`,
      });
    }

    await prisma.party.delete({
      where: { id },
    });

    return res.json({ message: "Party deleted successfully" });
  } catch (error: any) {
    console.error("Delete party error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "Party not found" });
    }
    return res.status(500).json({ message: "Failed to delete party" });
  }
};

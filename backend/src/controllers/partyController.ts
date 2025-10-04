import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";

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

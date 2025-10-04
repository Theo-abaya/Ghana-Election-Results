import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";

/**
 * Get all polling stations
 */
export const getAllPollingStations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { constituencyId } = req.query;

    const where = constituencyId
      ? { constituencyId: constituencyId as string }
      : {};

    const pollingStations = await prisma.pollingStation.findMany({
      where,
      include: {
        constituency: {
          select: {
            id: true,
            name: true,
            region: true,
          },
        },
      },
      orderBy: {
        code: "asc",
      },
    });

    res.json(pollingStations);
  } catch (err) {
    next(err);
  }
};

/**
 * Get single polling station
 */
export const getPollingStationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const pollingStation = await prisma.pollingStation.findUnique({
      where: { id },
      include: {
        constituency: {
          select: {
            id: true,
            name: true,
            region: true,
          },
        },
        results: {
          include: {
            candidate: {
              include: {
                party: true,
              },
            },
          },
        },
      },
    });

    if (!pollingStation) {
      return res.status(404).json({ message: "Polling station not found" });
    }

    res.json(pollingStation);
  } catch (err) {
    next(err);
  }
};

/**
 * Create a new polling station (Admin only)
 */
export const createPollingStation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { code, name, constituencyId, location } = req.body;

    if (!code || !name || !constituencyId) {
      return res.status(400).json({
        message: "code, name, and constituencyId are required",
      });
    }

    // Check if constituency exists
    const constituency = await prisma.constituency.findUnique({
      where: { id: constituencyId },
    });

    if (!constituency) {
      return res.status(404).json({ message: "Constituency not found" });
    }

    const pollingStation = await prisma.pollingStation.create({
      data: {
        code,
        name,
        constituencyId,
        location: location || null,
      },
      include: {
        constituency: true,
      },
    });

    res.status(201).json(pollingStation);
  } catch (err: any) {
    if (err.code === "P2002") {
      return res
        .status(409)
        .json({ message: "Polling station code already exists" });
    }
    next(err);
  }
};

import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import { Region } from "@prisma/client";

/**
 * Get all regions with stats
 */
export const getAllRegions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const allRegions = Object.values(Region);

    const regionsWithStats = await Promise.all(
      allRegions.map(async (region) => {
        // Get constituencies in this region
        const constituencies = await prisma.constituency.count({
          where: { region },
        });

        // Get total polling stations
        const pollingStations = await prisma.pollingStation.count({
          where: {
            constituency: { region },
          },
        });

        // Get total votes cast
        const votesCast = await prisma.result.aggregate({
          where: {
            pollingStation: {
              constituency: { region },
            },
          },
          _sum: { votes: true },
        });

        return {
          name: region,
          constituencies,
          pollingStations,
          totalVotes: votesCast._sum.votes || 0,
        };
      })
    );

    res.json(regionsWithStats);
  } catch (err) {
    next(err);
  }
};

/**
 * Get single region details by name
 */
export const getRegionByName = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.params;

    // Validate region enum
    if (!Object.values(Region).includes(name as Region)) {
      return res.status(400).json({ message: "Invalid region" });
    }

    const constituencies = await prisma.constituency.findMany({
      where: { region: name as Region },
      include: {
        _count: {
          select: { pollingStations: true },
        },
      },
    });

    res.json({
      name,
      constituencies,
      totalConstituencies: constituencies.length,
    });
  } catch (err) {
    next(err);
  }
};

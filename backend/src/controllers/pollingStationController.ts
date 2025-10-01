// src/controllers/pollingStationController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Create a polling station (Admin only)
 */
export const createPollingStation = async (req: Request, res: Response) => {
  try {
    const { name, code, location, constituencyId } = req.body;

    if (!name || !code || !constituencyId) {
      return res
        .status(400)
        .json({ message: "Name, code and constituencyId are required" });
    }

    const existing = await prisma.pollingStation.findUnique({
      where: { code },
    });
    if (existing) {
      return res
        .status(409)
        .json({ message: "Polling station code already exists" });
    }

    const station = await prisma.pollingStation.create({
      data: { name, code, location, constituencyId },
    });

    res.status(201).json(station);
  } catch (error) {
    res.status(500).json({ message: "Error creating polling station", error });
  }
};

/**
 * Get polling stations for a constituency
 */
export const getPollingStations = async (req: Request, res: Response) => {
  try {
    const { constituencyId } = req.params;

    const stations = await prisma.pollingStation.findMany({
      where: { constituencyId },
    });

    res.json(stations);
  } catch (error) {
    res.status(500).json({ message: "Error fetching polling stations", error });
  }
};

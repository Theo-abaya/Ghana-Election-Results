import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";

// Get all polling stations OR by constituency
export const getPollingStations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { constituencyId } = req.params;

    // If constituencyId is provided, filter by constituency
    if (constituencyId) {
      const stations = await prisma.pollingStation.findMany({
        where: { constituencyId },
        include: {
          constituency: true,
          results: true,
        },
      });
      return res.json(stations);
    }

    // Otherwise, get all polling stations
    const stations = await prisma.pollingStation.findMany({
      include: {
        constituency: true,
        results: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    res.json(stations);
  } catch (err) {
    next(err);
  }
};

// Create a polling station (Admin only)
export const createPollingStation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, code, location, constituencyId } = req.body;

    console.log("📦 Creating polling station with data:", req.body);

    // Validate required fields
    if (!name || !code || !constituencyId) {
      return res.status(400).json({
        message: "Name, code, and constituencyId are required",
      });
    }

    // Check if constituency exists
    const constituency = await prisma.constituency.findUnique({
      where: { id: constituencyId },
    });

    if (!constituency) {
      return res.status(400).json({
        message: "Constituency not found",
      });
    }

    // Check if code already exists
    const existingStation = await prisma.pollingStation.findUnique({
      where: { code },
    });

    if (existingStation) {
      return res.status(400).json({
        message: "Polling station code already exists",
      });
    }

    const station = await prisma.pollingStation.create({
      data: {
        name,
        code,
        location,
        constituencyId,
      },
      include: {
        constituency: true,
      },
    });

    res.status(201).json(station);
  } catch (err: any) {
    console.error("❌ Error creating polling station:", err);

    if (err.code === "P2002") {
      return res.status(400).json({
        message: "Polling station code already exists",
      });
    }

    next(err);
  }
};

// Update a polling station (Admin only)
export const updatePollingStation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, code, location, constituencyId } = req.body;

    if (!name || !code || !constituencyId) {
      return res.status(400).json({
        message: "Name, code, and constituencyId are required for update",
      });
    }

    const updated = await prisma.pollingStation.update({
      where: { id },
      data: { name, code, location, constituencyId },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// Delete a polling station (Admin only)
export const deletePollingStation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    await prisma.pollingStation.delete({ where: { id } });
    res.json({ message: "Polling station deleted successfully" });
  } catch (err) {
    next(err);
  }
};

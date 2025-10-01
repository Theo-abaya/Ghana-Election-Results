import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";

// Get all polling stations
export const getPollingStations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stations = await prisma.pollingStation.findMany({
      include: { constituency: true, results: true },
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

    if (!name || !code || !constituencyId) {
      return res.status(400).json({
        message: "Name, code, and constituencyId are required",
      });
    }

    const station = await prisma.pollingStation.create({
      data: { name, code, location, constituencyId },
    });

    res.status(201).json(station);
  } catch (err) {
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

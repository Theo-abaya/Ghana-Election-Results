import { Request, Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";

// Helper for admin access
const requireAdmin = (req: AuthRequest, res: Response): boolean => {
  if (!req.user || req.user.role !== Role.ADMIN) {
    res.status(403).json({ message: "Admin access required" });
    return false;
  }
  return true;
};

// ===============================
// GET all polling stations
// ===============================
export const getAllPollingStations = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const stations = await prisma.pollingStation.findMany({
      include: { constituency: true },
      orderBy: { code: "asc" },
    });
    res.json(stations);
  } catch (error) {
    console.error("Error fetching polling stations:", error);
    res.status(500).json({ message: "Failed to fetch polling stations" });
  }
};
// ===============================
// GET polling station by ID
// ===============================
export const getPollingStationById = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const station = await prisma.pollingStation.findUnique({
      where: { id },
      include: { constituency: true },
    });

    if (!station) {
      return res.status(404).json({ message: "Polling station not found" });
    }

    res.json(station);
  } catch (error) {
    console.error("Error fetching polling station:", error);
    res.status(500).json({ message: "Failed to fetch polling station" });
  }
};

// ===============================
// CREATE polling station
// ===============================
export const createPollingStation = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;

    const {
      name,
      code,
      location,
      registeredVoters,
      rejectedVotes,
      constituencyId,
    } = req.body;

    if (!name || !code || !constituencyId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const station = await prisma.pollingStation.create({
      data: {
        name,
        code,
        location,
        registeredVoters: Number(registeredVoters) || 0,
        rejectedVotes: Number(rejectedVotes) || 0,
        constituencyId,
      },
    });

    res.status(201).json({ message: "Polling station created", station });
  } catch (error) {
    console.error("Error creating polling station:", error);
    res.status(500).json({ message: "Failed to create polling station" });
  }
};

// ===============================
// UPDATE polling station
// ===============================
export const updatePollingStation = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { id } = req.params;
    const {
      name,
      code,
      location,
      registeredVoters,
      rejectedVotes,
      constituencyId,
    } = req.body;

    const updated = await prisma.pollingStation.update({
      where: { id },
      data: {
        name,
        code,
        location,
        registeredVoters,
        rejectedVotes,
        constituencyId,
      },
    });

    res.json({ message: "Polling station updated", updated });
  } catch (error: any) {
    console.error("Error updating polling station:", error);
    if (error.code === "P2025") {
      res.status(404).json({ message: "Polling station not found" });
    } else {
      res.status(500).json({ message: "Failed to update polling station" });
    }
  }
};

// ===============================
// DELETE polling station
// ===============================
export const deletePollingStation = async (req: AuthRequest, res: Response) => {
  try {
    if (!requireAdmin(req, res)) return;
    const { id } = req.params;

    await prisma.pollingStation.delete({ where: { id } });
    res.json({ message: "Polling station deleted" });
  } catch (error: any) {
    console.error("Error deleting polling station:", error);
    if (error.code === "P2025") {
      res.status(404).json({ message: "Polling station not found" });
    } else {
      res.status(500).json({ message: "Failed to delete polling station" });
    }
  }
};

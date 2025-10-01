// src/controllers/constituencyController.ts
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Create a new constituency (Admin only)
 */
export const createConstituency = async (req: Request, res: Response) => {
  try {
    const { name, region } = req.body;

    if (!name || !region) {
      return res.status(400).json({ message: "Name and region are required" });
    }

    const existing = await prisma.constituency.findUnique({ where: { name } });
    if (existing) {
      return res.status(409).json({ message: "Constituency already exists" });
    }

    const constituency = await prisma.constituency.create({
      data: { name, region },
    });

    res.status(201).json(constituency);
  } catch (error) {
    res.status(500).json({ message: "Error creating constituency", error });
  }
};

/**
 * Get all constituencies
 */
export const getConstituencies = async (_req: Request, res: Response) => {
  try {
    const constituencies = await prisma.constituency.findMany({
      include: { pollingStations: true, candidates: true },
    });

    res.json(constituencies);
  } catch (error) {
    res.status(500).json({ message: "Error fetching constituencies", error });
  }
};

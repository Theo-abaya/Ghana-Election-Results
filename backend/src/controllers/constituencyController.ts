import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";

// Get all constituencies (Admin or Viewer)
export const getConstituencies = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const constituencies = await prisma.constituency.findMany({
      include: { pollingStations: true, candidates: true },
    });
    res.json(constituencies);
  } catch (err) {
    next(err);
  }
};

// Create a constituency (Admin only)
export const createConstituency = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, region } = req.body;

    if (!name || !region) {
      return res.status(400).json({ message: "Name and region are required" });
    }

    const constituency = await prisma.constituency.create({
      data: { name, region },
    });

    res.status(201).json(constituency);
  } catch (err) {
    next(err);
  }
};

// Update a constituency (Admin only)
export const updateConstituency = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { name, region } = req.body;

    const updated = await prisma.constituency.update({
      where: { id },
      data: { name, region },
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// Delete a constituency (Admin only)
export const deleteConstituency = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    await prisma.constituency.delete({ where: { id } });
    res.json({ message: "Constituency deleted successfully" });
  } catch (err) {
    next(err);
  }
};

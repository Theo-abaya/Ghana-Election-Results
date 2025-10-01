import { Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";

// ✅ Get all parties
export const getParties = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parties = await prisma.party.findMany();
    res.json(parties);
  } catch (err) {
    next(err);
  }
};

// ✅ Create a new party
export const createParty = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, abbreviation, color, logoUrl } = req.body;

    if (!name || !abbreviation || !color) {
      return res
        .status(400)
        .json({ message: "Name, abbreviation, and color are required" });
    }

    const party = await prisma.party.create({
      data: { name, abbreviation, color, logoUrl },
    });

    res.status(201).json(party);
  } catch (err) {
    next(err);
  }
};

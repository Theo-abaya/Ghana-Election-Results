import { Router } from "express";
import {
  createCandidate,
  getPresidentialCandidates,
  getParliamentaryCandidates,
} from "../controllers/candidateController";
import { authenticateJWT, authorizeRole } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";

const router = Router();

// Public routes (anyone can view candidates)
router.get("/presidential", async (req, res) => {
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const candidates = await prisma.candidate.findMany({
      where: { type: "PRESIDENTIAL" },
      include: {
        party: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    await prisma.$disconnect();
    res.json(candidates);
  } catch (error) {
    console.error("Error fetching presidential candidates:", error);
    res.status(500).json({ message: "Failed to fetch candidates" });
  }
});

router.get("/parliamentary/:constituencyId", async (req, res) => {
  try {
    const { constituencyId } = req.params;
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();

    const candidates = await prisma.candidate.findMany({
      where: {
        type: "PARLIAMENTARY",
        constituencyId: constituencyId,
      },
      include: {
        party: true,
        constituency: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    await prisma.$disconnect();
    res.json(candidates);
  } catch (error) {
    console.error("Error fetching parliamentary candidates:", error);
    res.status(500).json({ message: "Failed to fetch candidates" });
  }
});

// POST /api/candidates - Create candidate (Admin only)
router.post("/", authenticateJWT, authorizeRole([Role.ADMIN]), createCandidate);

export default router;

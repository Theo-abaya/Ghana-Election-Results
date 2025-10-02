import { Router } from "express";
import {
  createCandidate,
  getPresidentialCandidates,
  getParliamentaryCandidates,
} from "../controllers/candidateController";
import { authenticateJWT, authorizeRole } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";

const router = Router();

// POST /api/candidates - Create candidate (Admin only)
router.post("/", authenticateJWT, authorizeRole([Role.ADMIN]), createCandidate);

// GET /api/candidates/presidential - Get all presidential candidates
router.get("/presidential", getPresidentialCandidates);

// GET /api/candidates/parliamentary/:constituencyId - Get parliamentary candidates by constituency
router.get("/parliamentary/:constituencyId", getParliamentaryCandidates);

export default router;

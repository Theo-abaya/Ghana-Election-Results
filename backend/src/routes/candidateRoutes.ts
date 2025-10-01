import { Router } from "express";
import {
  createCandidate,
  getPresidentialCandidates,
  getParliamentaryCandidates,
} from "../controllers/candidateController";
import { authenticateJWT, authorizeRole } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";

const router = Router();

// Admin-only
router.post("/", authenticateJWT, authorizeRole([Role.ADMIN]), createCandidate);

// Public
router.get("/presidential", getPresidentialCandidates);
router.get("/parliamentary/:constituencyId", getParliamentaryCandidates);

export default router;

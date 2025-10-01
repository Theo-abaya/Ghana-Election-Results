import { Router } from "express";
import {
  createCandidate,
  getPresidentialCandidates,
  getParliamentaryCandidates,
} from "../controllers/candidateController";
import { authenticateJWT, authorize } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";

const router = Router();

// Admin-only
router.post("/", authenticateJWT, authorize([Role.ADMIN]), createCandidate);

// Public
router.get("/presidential", getPresidentialCandidates);
router.get("/parliamentary/:constituencyId", getParliamentaryCandidates);

export default router;

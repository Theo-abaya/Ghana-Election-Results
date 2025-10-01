import { Router } from "express";
import {
  createConstituency,
  getConstituencies,
} from "../controllers/constituencyController";
import { authenticateJWT, authorize } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";

const router = Router();

// Admin-only
router.post("/", authenticateJWT, authorize([Role.ADMIN]), createConstituency);

// Public
router.get("/", getConstituencies);

export default router;

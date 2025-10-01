import { Router } from "express";
import {
  createConstituency,
  getConstituencies,
  updateConstituency,
  deleteConstituency,
} from "../controllers/constituencyController";
import {
  authenticateJWT,
  authorizeRole,
  AuthRequest,
} from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";

const router = Router();

// Public: Get all constituencies
router.get(
  "/",
  authenticateJWT,
  authorizeRole([Role.ADMIN, Role.POLLING_OFFICER, Role.VIEWER]),
  getConstituencies
);

// Admin-only
router.post(
  "/",
  authenticateJWT,
  authorizeRole([Role.ADMIN]),
  createConstituency
);
router.put(
  "/:id",
  authenticateJWT,
  authorizeRole([Role.ADMIN]),
  updateConstituency
);
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRole([Role.ADMIN]),
  deleteConstituency
);

export default router;

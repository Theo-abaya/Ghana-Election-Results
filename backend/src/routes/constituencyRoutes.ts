import { Router } from "express";
import {
  createConstituency,
  getAllConstituencies,
  getConstituencyById,
  getConstituenciesByRegion,
  updateConstituency,
  deleteConstituency,
  getConstituencyResults,
} from "../controllers/constituencyController"; // Add all the functions you need
import { authenticateJWT, authorizeRole } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";

const router = Router();

// GET routes
router.get("/", getAllConstituencies);
router.get("/region/:region", getConstituenciesByRegion);
router.get("/:id", getConstituencyById);
router.get("/:id/results", getConstituencyResults);

// POST routes (Admin only)
router.post(
  "/",
  authenticateJWT,
  authorizeRole([Role.ADMIN]),
  createConstituency
);

// PUT routes (Admin only)
router.put(
  "/:id",
  authenticateJWT,
  authorizeRole([Role.ADMIN]),
  updateConstituency
);

// DELETE routes (Admin only)
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRole([Role.ADMIN]),
  deleteConstituency
);

export default router;

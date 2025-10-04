import { Router } from "express";
import {
  getAllPollingStations,
  getPollingStationById,
  createPollingStation,
} from "../controllers/pollingStationController";
import { authenticateJWT, authorizeRole } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";

const router = Router();

// GET /api/polling-stations - Get all polling stations (Public)
router.get("/", getAllPollingStations);

// GET /api/polling-stations/:id - Get single polling station (Public)
router.get("/:id", getPollingStationById);

// POST /api/polling-stations - Create polling station (Admin only)
router.post(
  "/",
  authenticateJWT,
  authorizeRole([Role.ADMIN]),
  createPollingStation
);

export default router;

import { Router } from "express";
import {
  createPollingStation,
  getPollingStations,
  updatePollingStation,
  deletePollingStation,
} from "../controllers/pollingStationController";
import { authenticateJWT, authorizeRole } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";

const router = Router();

// GET /api/polling-stations - Get all polling stations (Authenticated users)
router.get("/", authenticateJWT, getPollingStations);

// GET /api/polling-stations/:constituencyId - Get polling stations by constituency
router.get("/:constituencyId", authenticateJWT, getPollingStations);

// POST /api/polling-stations - Create polling station (Admin only)
router.post(
  "/",
  authenticateJWT,
  authorizeRole([Role.ADMIN]),
  createPollingStation
);

// PUT /api/polling-stations/:id - Update polling station (Admin only)
router.put(
  "/:id",
  authenticateJWT,
  authorizeRole([Role.ADMIN]),
  updatePollingStation
);

// DELETE /api/polling-stations/:id - Delete polling station (Admin only)
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRole([Role.ADMIN]),
  deletePollingStation
);

export default router;

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

// Public: get all polling stations
router.get(
  "/",
  authenticateJWT,
  authorizeRole([Role.ADMIN, Role.POLLING_OFFICER, Role.VIEWER]),
  getPollingStations
);

// Admin-only
router.post(
  "/",
  authenticateJWT,
  authorizeRole([Role.ADMIN]),
  createPollingStation
);
router.put(
  "/:id",
  authenticateJWT,
  authorizeRole([Role.ADMIN]),
  updatePollingStation
);
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRole([Role.ADMIN]),
  deletePollingStation
);

export default router;

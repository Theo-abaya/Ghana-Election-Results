import { Router } from "express";
import {
  createPollingStation,
  getPollingStations,
} from "../controllers/pollingStationController";
import { authenticateJWT, authorize } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";

const router = Router();

// Admin-only
router.post(
  "/",
  authenticateJWT,
  authorize([Role.ADMIN]),
  createPollingStation
);

// Public
router.get("/:constituencyId", getPollingStations);

export default router;

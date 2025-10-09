// routes/pollingStationRoutes.ts
import { Router } from "express";
import {
  getAllPollingStations,
  getPollingStationById,
  createPollingStation,
  updatePollingStation,
  deletePollingStation,
} from "../controllers/pollingStationController";
import { authenticateJWT, authorizeRole } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";

const router = Router();

router.get("/", authenticateJWT, getAllPollingStations);
router.get("/:id", authenticateJWT, getPollingStationById);
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

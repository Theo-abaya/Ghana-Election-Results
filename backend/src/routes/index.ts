import { Router } from "express";
import candidateRoutes from "./candidateRoutes";
import constituencyRoutes from "./constituencyRoutes";
import pollingStationRoutes from "./pollingStationRoutes";
import resultRoutes from "./resultRoutes";
import partyRoutes from "./partyRoutes";
import regionRoutes from "./regionRoutes";
import adminRoutes from "./adminRoutes";

const router = Router();

// Health check / root endpoint
router.get("/", (_req, res) => {
  res.json({ message: "Welcome to Ghana Elections API 🚀" });
});

// API routes
router.use("/candidates", candidateRoutes);
router.use("/results", resultRoutes);
router.use("/regions", regionRoutes);
router.use("/constituencies", constituencyRoutes);
router.use("/polling-stations", pollingStationRoutes);
router.use("/parties", partyRoutes);
router.use("/admin", adminRoutes);

// 404 handler for undefined routes - FIXED
router.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

export default router;

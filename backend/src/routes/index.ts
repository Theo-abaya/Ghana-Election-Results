import { Router } from "express";
import candidateRoutes from "./candidateRoutes";
import constituencyRoutes from "./constituencyRoutes";
import pollingStationRoutes from "./pollingStationRoutes";
import resultRoutes from "./resultRoutes";
import partyRoutes from "./partyRoutes";
import {
  createUser,
  getUsers,
  updateUser,
  deleteUser,
} from "../controllers/userController";
import { authenticateJWT, authorizeRole } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";

const router = Router();

// Health check / root endpoint
router.get("/", (_req, res) => {
  res.json({ message: "Welcome to Ghana Elections API 🚀" });
});

// USERS (Admin only)
router.post("/users", authenticateJWT, authorizeRole([Role.ADMIN]), createUser);
router.get("/users", authenticateJWT, authorizeRole([Role.ADMIN]), getUsers);
router.put(
  "/users/:id",
  authenticateJWT,
  authorizeRole([Role.ADMIN]),
  updateUser
);
router.delete(
  "/users/:id",
  authenticateJWT,
  authorizeRole([Role.ADMIN]),
  deleteUser
);

// Mount feature routers
router.use("/candidates", candidateRoutes);
router.use("/constituencies", constituencyRoutes);
router.use("/polling-stations", pollingStationRoutes);
router.use("/results", resultRoutes);
router.use("/parties", partyRoutes);

export default router;

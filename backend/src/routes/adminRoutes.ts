// adminRoutes.ts
import { Router } from "express";
import { authenticateJWT, authorizeRole } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";
import {
  getAllUsers,
  deleteUser,
  getSystemSettings,
  updateSystemSettings,
  getAuditLogs,
  exportData,
  getDashboardStats,
  updateUser,
} from "../controllers/adminController";
import {
  getAllCandidates,
  createCandidate,
  updateCandidate,
  deleteCandidate,
} from "../controllers/candidateController";
import {
  getAllParties,
  updateParty,
  deleteParty,
  createParty,
} from "../controllers/partyController";

const router = Router();

// Apply authentication and authorization middleware to ALL routes in this router
router.use(authenticateJWT, authorizeRole([Role.ADMIN]));

// User Management
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.put("/users/:id", updateUser);

// Candidate Management
router.get("/candidates", getAllCandidates);
router.post("/candidates", createCandidate);
router.put("/candidates/:id", updateCandidate);
router.delete("/candidates/:id", deleteCandidate);

// Party Management
router.get("/parties", getAllParties);
router.put("/parties/:id", updateParty);
router.delete("/parties/:id", deleteParty);
router.post("/parties", createParty);

// System Settings
router.get("/settings", getSystemSettings);
router.put("/settings", updateSystemSettings);

// Audit Logs
router.get("/audit-logs", getAuditLogs);

// Data Export
router.post("/export", exportData);

// Dashboard Statistics
router.get("/stats", getDashboardStats);

export default router;

import { Router } from "express";
import {
  getAllParties,
  getPartyById,
  createParty,
} from "../controllers/partyController";
import { authenticateJWT, authorizeRole } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";

const router = Router();

// GET /api/parties - Get all parties (Public)
router.get("/", getAllParties);

// GET /api/parties/:id - Get single party (Public)
router.get("/:id", getPartyById);

// POST /api/parties - Create party (Admin only)
router.post("/", authenticateJWT, authorizeRole([Role.ADMIN]), createParty);

export default router;

import { Router } from "express";
import { getParties, createParty } from "../controllers/partyController";
import { authenticateJWT, authorizeRole } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";

const router = Router();

router.get("/", getParties);
router.post("/", authenticateJWT, authorizeRole([Role.ADMIN]), createParty);

export default router;

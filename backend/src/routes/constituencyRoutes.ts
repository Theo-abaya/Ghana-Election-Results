import { Router } from "express";
import {
  createConstituency,
  getConstituencies,
} from "../controllers/constituencyController";
import { authenticateJWT, authorizeRole } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";

const router = Router();

router.post(
  "/",
  authenticateJWT,
  authorizeRole([Role.ADMIN]),
  createConstituency
);
router.get("/", getConstituencies);

export default router;

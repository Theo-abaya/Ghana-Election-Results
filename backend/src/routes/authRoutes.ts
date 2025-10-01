// src/routes/authRoutes.ts
import { Router } from "express";
import { login, register, me } from "../controllers/authController";
import { authenticateJWT, authorizeRole } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";

const router = Router();

// 🔓 Public routes
router.post("/login", login);

// ⚠️ Restrict register endpoint to Admins only
router.post(
  "/register",
  authenticateJWT,
  authorizeRole([Role.ADMIN]),
  register
);

// 🔒 Protected routes
router.get("/me", authenticateJWT, me);

export default router;

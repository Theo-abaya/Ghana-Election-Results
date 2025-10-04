// src/routes/authRoutes.ts
import { Router } from "express";
import {
  login,
  register,
  me,
  changePassword,
} from "../controllers/authController";
import { authenticateJWT, authorizeRole } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";

const router = Router();

// 🔓 Public routes
router.post("/login", login);

// 🔐 Admin-only routes
router.post(
  "/register",
  authenticateJWT,
  authorizeRole([Role.ADMIN]),
  register
);

// 🔒 Authenticated user routes
router.put("/change-password", authenticateJWT, changePassword);
router.get("/me", authenticateJWT, me);

export default router;

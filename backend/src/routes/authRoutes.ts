// src/routes/authRoutes.ts
import { Router } from "express";
import { login, register, me } from "../controllers/authController";
import { authenticateJWT } from "../middlewares/authMiddleware";

const router = Router();

// Public routes
router.post("/login", login);
router.post("/register", register); // Restrict to Admin in production

// Protected routes
router.get("/me", authenticateJWT, me);

export default router;

import { Router } from "express";
import {
  createUser,
  getUsers,
  deleteUser,
} from "../controllers/userController";
import { authenticateJWT, authorizeRole } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";
import { updateUser } from "../controllers/userController";

const router = Router();

// Admin-only routes
router.post("/", authenticateJWT, authorizeRole([Role.ADMIN]), createUser);
router.get("/", authenticateJWT, authorizeRole([Role.ADMIN]), getUsers);
router.delete("/:id", authenticateJWT, authorizeRole([Role.ADMIN]), deleteUser);
router.put("/:id", authenticateJWT, authorizeRole([Role.ADMIN]), updateUser);

export default router;

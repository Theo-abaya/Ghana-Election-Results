import { Router } from "express";
import {
  createUser,
  getUsers,
  deleteUser,
} from "../controllers/userController";
import { authenticateJWT, authorize } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";
import { updateUser } from "../controllers/userController";

const router = Router();

// Admin-only routes
router.post("/", authenticateJWT, authorize([Role.ADMIN]), createUser);
router.get("/", authenticateJWT, authorize([Role.ADMIN]), getUsers);
router.delete("/:id", authenticateJWT, authorize([Role.ADMIN]), deleteUser);
router.put("/:id", authenticateJWT, authorize([Role.ADMIN]), updateUser);

export default router;

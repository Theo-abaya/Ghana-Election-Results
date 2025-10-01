// src/controllers/authController.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../utils/prisma"; // Prisma client export
import { generateToken } from "../utils/jwt";
import { Role } from "@prisma/client";
import { AuthRequest } from "../middlewares/authMiddleware";

/**
 * Register new user (Admin only in production)
 */
export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const emailLower = email.toLowerCase();

    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower },
    });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Default role: POLLING_OFFICER, cannot be set by client
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: emailLower,
        password: hashedPassword,
        role: Role.POLLING_OFFICER,
      },
    });

    const token = generateToken(user.id, user.email, user.role);

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Login
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const emailLower = email.toLowerCase();

    const user = await prisma.user.findUnique({ where: { email: emailLower } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user.id, user.email, user.role);

    // Optional: send token in Authorization header
    res.setHeader("Authorization", `Bearer ${token}`);

    return res.json({
      message: "Login successful",
      token,
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get current logged-in user
 */
export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    return res.json(user);
  } catch (error) {
    console.error("Me error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

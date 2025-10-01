// src/controllers/userController.ts
import { Request, Response } from "express";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Create a new user (Admin only)
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || Role.POLLING_OFFICER, // default role
      },
    });

    res.status(201).json({ id: user.id, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: "Error creating user", error });
  }
};

/**
 * Get all users (Admin only)
 */
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

/**
 * Update user (Admin only)
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { email, password, role } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email: email || user.email,
        role: role || user.role,
        password: password ? await bcrypt.hash(password, 10) : user.password,
      },
      select: { id: true, email: true, role: true, updatedAt: true },
    });

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating user", error });
  }
};

/**
 * Delete user (Admin only)
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ message: "User not found" });

    await prisma.user.delete({ where: { id } });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};

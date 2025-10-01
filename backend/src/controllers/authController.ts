// src/controllers/authController.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import prisma from "../utils/prisma";
import { generateToken } from "../utils/jwt";
import { Role } from "@prisma/client";
import { AuthRequest } from "../middlewares/authMiddleware";

/**
 * Validate email format
 */
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
const validatePassword = (
  password: string
): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return {
      valid: false,
      message: "Password must be at least 8 characters long",
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one uppercase letter",
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one lowercase letter",
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      valid: false,
      message: "Password must contain at least one number",
    };
  }
  return { valid: true };
};

/**
 * Register new user
 * - In production: Only admins can register users
 * - In development: Open registration (for testing)
 */
export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, role } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Email format validation
    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // Password strength validation
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
      return res.status(400).json({
        message: passwordCheck.message,
      });
    }

    // In production, only admins can create new users
    const isProduction = process.env.NODE_ENV === "production";
    if (isProduction && (!req.user || req.user.role !== Role.ADMIN)) {
      return res.status(403).json({
        message: "Only administrators can register new users",
      });
    }

    const emailLower = email.toLowerCase();

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User with this email already exists",
      });
    }

    // Determine user role
    // Only admins can set roles, otherwise default to POLLING_OFFICER
    let userRole = Role.POLLING_OFFICER;
    if (req.user?.role === Role.ADMIN && role) {
      // Validate role value
      if (!Object.values(Role).includes(role)) {
        return res.status(400).json({
          message: "Invalid role specified",
        });
      }
      userRole = role;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: emailLower,
        password: hashedPassword,
        role: userRole,
      },
    });

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register error:", {
      error: error instanceof Error ? error.message : error,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      message: "Server error during registration",
    });
  }
};

/**
 * Login user
 */
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Email format validation
    if (!validateEmail(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    const emailLower = email.toLowerCase();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user.id, user.email, user.role);

    // Set authorization header
    res.setHeader("Authorization", `Bearer ${token}`);

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", {
      error: error instanceof Error ? error.message : error,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      message: "Server error during login",
    });
  }
};

/**
 * Get current logged-in user profile
 */
export const me = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized - No user found",
      });
    }

    // Fetch fresh user data from database
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.json(user);
  } catch (error) {
    console.error("Me error:", {
      error: error instanceof Error ? error.message : error,
      userId: req.user?.id,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      message: "Server error fetching user profile",
    });
  }
};

/**
 * Logout user (optional: implement token blacklist)
 */
export const logout = async (req: AuthRequest, res: Response) => {
  try {
    // TODO: Implement token blacklist if needed
    // Example:
    // if (req.token) {
    //   await prisma.tokenBlacklist.create({
    //     data: {
    //       token: req.token,
    //       expiresAt: new Date(req.user.exp * 1000)
    //     }
    //   });
    // }

    return res.json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", {
      error: error instanceof Error ? error.message : error,
      userId: req.user?.id,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      message: "Server error during logout",
    });
  }
};

/**
 * Change password for current user
 */
export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Input validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
      });
    }

    // Validate new password strength
    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) {
      return res.status(400).json({
        message: passwordCheck.message,
      });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    return res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", {
      error: error instanceof Error ? error.message : error,
      userId: req.user?.id,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({
      message: "Server error changing password",
    });
  }
};

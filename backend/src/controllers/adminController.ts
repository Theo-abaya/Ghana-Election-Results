// src/controllers/adminController.ts
import { Response } from "express";
import prisma from "../utils/prisma";
import { AuthRequest } from "../middlewares/authMiddleware";
import { Role } from "@prisma/client";

/**
 * Check if user is admin
 */
const requireAdmin = (req: AuthRequest, res: Response): boolean => {
  if (!req.user || req.user.role !== Role.ADMIN) {
    res.status(403).json({ message: "Admin access required" });
    return false;
  }
  return true;
};

/**
 * Get all users (Admin only)
 */
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json(users);
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
};

/**
 * Delete user (Admin only)
 */
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user!.id) {
      return res
        .status(400)
        .json({ message: "Cannot delete your own account" });
    }

    await prisma.user.delete({
      where: { id },
    });

    return res.json({ message: "User deleted successfully" });
  } catch (error: any) {
    console.error("Delete user error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(500).json({ message: "Failed to delete user" });
  }
};

/**
 * Update user (Admin only)
 */
export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;

    // Validate required fields
    if (!email && !role) {
      return res.status(400).json({
        message: "At least one field (email or role) is required for update",
      });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent admin from updating their own role
    if (id === req.user!.id && role && role !== existingUser.role) {
      return res.status(400).json({
        message: "Cannot change your own role",
      });
    }

    // Check if email already exists (if email is being updated)
    if (email && email !== existingUser.email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });

      if (existingEmail) {
        return res.status(400).json({
          message: "Email already exists",
        });
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(email && { email }),
        ...(role && { role }),
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return res.json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Update user error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(500).json({ message: "Failed to update user" });
  }
};

/**
 * Get system settings (Admin only)
 */
export const getSystemSettings = async (req: AuthRequest, res: Response) => {
  try {
    let settings = await prisma.systemSettings.findFirst();

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          allowResultSubmission: true,
          requireApproval: false,
          enableNotifications: true,
          maintenanceMode: false,
        },
      });
    }

    return res.json(settings);
  } catch (error) {
    console.error("Get system settings error:", error);
    return res.status(500).json({ message: "Failed to fetch system settings" });
  }
};

/**
 * Update system settings (Admin only)
 */
export const updateSystemSettings = async (req: AuthRequest, res: Response) => {
  try {
    const {
      allowResultSubmission,
      requireApproval,
      enableNotifications,
      maintenanceMode,
    } = req.body;

    let settings = await prisma.systemSettings.findFirst();

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          allowResultSubmission: allowResultSubmission ?? true,
          requireApproval: requireApproval ?? false,
          enableNotifications: enableNotifications ?? true,
          maintenanceMode: maintenanceMode ?? false,
        },
      });
    } else {
      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: {
          ...(typeof allowResultSubmission === "boolean" && {
            allowResultSubmission,
          }),
          ...(typeof requireApproval === "boolean" && { requireApproval }),
          ...(typeof enableNotifications === "boolean" && {
            enableNotifications,
          }),
          ...(typeof maintenanceMode === "boolean" && { maintenanceMode }),
        },
      });
    }

    return res.json({
      message: "System settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Update system settings error:", error);
    return res
      .status(500)
      .json({ message: "Failed to update system settings" });
  }
};

/**
 * Get audit logs (Admin only)
 */
export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    const logs = await prisma.auditLog.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    const total = await prisma.auditLog.count();

    return res.json({
      logs,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Get audit logs error:", error);
    return res.status(500).json({ message: "Failed to fetch audit logs" });
  }
};

/**
 * Export data (Admin only)
 */
export const exportData = async (req: AuthRequest, res: Response) => {
  try {
    const { format, dataTypes } = req.body;

    if (!format || !dataTypes || !Array.isArray(dataTypes)) {
      return res.status(400).json({
        message: "Format and dataTypes array are required",
      });
    }

    let data: any = {};

    if (dataTypes.includes("presidential")) {
      data.presidential = await prisma.result.findMany({
        where: {
          candidate: {
            type: "PRESIDENTIAL",
          },
        },
        include: {
          candidate: {
            include: {
              party: true,
            },
          },
          pollingStation: {
            include: {
              constituency: true,
            },
          },
        },
      });
    }

    if (dataTypes.includes("parliamentary")) {
      data.parliamentary = await prisma.result.findMany({
        where: {
          candidate: {
            type: "PARLIAMENTARY",
          },
        },
        include: {
          candidate: {
            include: {
              party: true,
            },
          },
          pollingStation: {
            include: {
              constituency: true,
            },
          },
        },
      });
    }

    if (format === "json") {
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=election-data-${Date.now()}.json`
      );
      return res.json(data);
    } else if (format === "csv") {
      const csv = JSON.stringify(data);
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=election-data-${Date.now()}.csv`
      );
      return res.send(csv);
    } else {
      return res.status(400).json({
        message: "Unsupported format. Use 'json' or 'csv'",
      });
    }
  } catch (error) {
    console.error("Export data error:", error);
    return res.status(500).json({ message: "Failed to export data" });
  }
};

/**
 * Get dashboard statistics (Admin only)
 */
export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, pollingOfficers, resultsCount, settings] =
      await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: Role.POLLING_OFFICER } }),
        prisma.result.count(),
        prisma.systemSettings.findFirst(),
      ]);

    return res.json({
      totalUsers,
      pollingOfficers,
      resultsSubmitted: resultsCount,
      systemStatus: settings?.maintenanceMode ? "Maintenance" : "Active",
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch dashboard statistics" });
  }
};

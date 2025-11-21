// src/controllers/adminDashboard.ts
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import Order from "../models/Order.js";
import AdminActionLog from "../models/AdminActionLog.js";

/**
 * GET /v1/admin/dashboard
 * Get dashboard statistics and recent activity
 */
export async function getDashboard(req: AuthRequest, res: Response) {
  try {
    // Get counts in parallel
    const [
      usersCount,
      rolesCount,
      permissionsCount,
      ordersCount,
      recentActions,
    ] = await Promise.all([
      (User as any).countDocuments(),
      (Role as any).countDocuments(),
      (Permission as any).countDocuments(),
      (Order as any).countDocuments(),
      (AdminActionLog as any)
        .find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select("actorEmail action targetType targetId metadata createdAt")
        .lean(),
    ]);

    return res.json({
      stats: {
        usersCount,
        rolesCount,
        permissionsCount,
        ordersCount,
      },
      recentActions,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return res.status(500).json({ error: "Failed to load dashboard" });
  }
}

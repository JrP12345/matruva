// src/helpers/auditLog.ts
import type { Request } from "express";
import AdminActionLog from "../models/AdminActionLog.js";
import User from "../models/User.js";

export interface LogActionOptions {
  actorId: string;
  action: string;
  targetType?: string;
  targetId?: any;
  metadata?: any;
  ip?: string;
  userAgent?: string;
}

/**
 * Helper to create an audit log entry with all required fields
 */
export async function logAdminAction(
  req: Request,
  options: Omit<LogActionOptions, "ip" | "userAgent">
) {
  try {
    // Fetch actor email from database
    const actor = await (User as any).findById(options.actorId).select("email");
    const actorEmail = actor?.email;

    await (AdminActionLog as any).create({
      ...options,
      actorEmail,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
    // Don't throw - logging failure shouldn't break the main operation
  }
}

// src/controllers/adminAudit.ts
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import AdminActionLog from "../models/AdminActionLog.js";

/**
 * GET /v1/admin/audit
 * Query audit logs with filtering and pagination
 */
export async function queryAuditLogs(req: AuthRequest, res: Response) {
  try {
    const {
      action,
      actorEmail,
      targetType,
      page = 1,
      limit = 50,
      startDate,
      endDate,
    } = req.query;

    // Build filter
    const filter: any = {};

    if (action && typeof action === "string") {
      filter.action = action;
    }

    if (actorEmail && typeof actorEmail === "string") {
      filter.actorEmail = { $regex: actorEmail, $options: "i" };
    }

    if (targetType && typeof targetType === "string") {
      filter.targetType = targetType;
    }

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate && typeof startDate === "string") {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate && typeof endDate === "string") {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    // Parse pagination
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = Math.min(parseInt(limit as string, 10) || 50, 100); // Max 100
    const skip = (pageNum - 1) * limitNum;

    // Query logs
    const [logs, total] = await Promise.all([
      (AdminActionLog as any)
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("actorId", "name email")
        .lean(),
      (AdminActionLog as any).countDocuments(filter),
    ]);

    return res.json({
      logs,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Audit query error:", error);
    return res.status(500).json({ error: "Failed to query audit logs" });
  }
}

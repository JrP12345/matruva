// src/controllers/adminPermissions.ts
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import Permission from "../models/Permission.js";
import AdminActionLog from "../models/AdminActionLog.js";

/**
 * GET /v1/admin/permissions - List all permissions
 */
export async function listPermissions(req: AuthRequest, res: Response) {
  try {
    const permissions = await (Permission as any).find().sort({ key: 1 });
    res.json({ permissions });
  } catch (error) {
    console.error("List permissions error:", error);
    res.status(500).json({ error: "Failed to list permissions" });
  }
}

/**
 * POST /v1/admin/permissions - Create new permission
 */
export async function createPermission(req: AuthRequest, res: Response) {
  try {
    const { key, description, category } = req.body;

    if (!key) {
      return res.status(400).json({ error: "key is required" });
    }

    // Check if permission already exists
    const existing = await (Permission as any).findOne({ key });
    if (existing) {
      return res.status(409).json({ error: "Permission already exists" });
    }

    const permission = await (Permission as any).create({
      key,
      description: description || "",
      category: category || "",
      protected: false,
    });

    // Log action
    await (AdminActionLog as any).create({
      actorId: req.userId,
      action: "permission.create",
      targetType: "Permission",
      targetId: permission._id,
      metadata: { key, description, category },
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(201).json({ permission });
  } catch (error) {
    console.error("Create permission error:", error);
    res.status(500).json({ error: "Failed to create permission" });
  }
}

/**
 * DELETE /v1/admin/permissions/:key - Delete permission
 */
export async function deletePermission(req: AuthRequest, res: Response) {
  try {
    const { key } = req.params;

    const permission = await (Permission as any).findOne({ key });
    if (!permission) {
      return res.status(404).json({ error: "Permission not found" });
    }

    // Prevent deletion of protected permissions
    if (permission.protected) {
      return res
        .status(403)
        .json({ error: "Cannot delete protected permission" });
    }

    await (Permission as any).deleteOne({ key });

    // Log action
    await (AdminActionLog as any).create({
      actorId: req.userId,
      action: "permission.delete",
      targetType: "Permission",
      targetId: permission._id,
      metadata: { key },
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.json({ message: "Permission deleted successfully" });
  } catch (error) {
    console.error("Delete permission error:", error);
    res.status(500).json({ error: "Failed to delete permission" });
  }
}

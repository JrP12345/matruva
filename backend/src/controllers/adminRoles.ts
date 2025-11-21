// src/controllers/adminRoles.ts
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import Role from "../models/Role.js";
import AdminActionLog from "../models/AdminActionLog.js";

/**
 * GET /v1/admin/roles - List all roles
 */
export async function listRoles(req: AuthRequest, res: Response) {
  try {
    const roles = await (Role as any).find().sort({ createdAt: -1 });
    res.json({ roles });
  } catch (error) {
    console.error("List roles error:", error);
    res.status(500).json({ error: "Failed to list roles" });
  }
}

/**
 * GET /v1/admin/roles/:name - Get role details
 */
export async function getRole(req: AuthRequest, res: Response) {
  try {
    const { name } = req.params;
    const role = await (Role as any).findOne({ name });

    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    res.json({ role });
  } catch (error) {
    console.error("Get role error:", error);
    res.status(500).json({ error: "Failed to get role" });
  }
}

/**
 * POST /v1/admin/roles - Create new role
 */
export async function createRole(req: AuthRequest, res: Response) {
  try {
    const { name, label, description, permissions } = req.body;

    if (!name || !label) {
      return res.status(400).json({ error: "name and label are required" });
    }

    // Check if role already exists
    const existing = await (Role as any).findOne({ name });
    if (existing) {
      return res.status(409).json({ error: "Role already exists" });
    }

    const role = await (Role as any).create({
      name,
      label,
      description: description || "",
      permissions: permissions || [],
      protected: false,
    });

    // Log action
    await (AdminActionLog as any).create({
      actorId: req.userId,
      action: "role.create",
      targetType: "Role",
      targetId: role._id,
      metadata: { name, label, permissions },
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(201).json({ role });
  } catch (error) {
    console.error("Create role error:", error);
    res.status(500).json({ error: "Failed to create role" });
  }
}

/**
 * PATCH /v1/admin/roles/:name - Update role
 */
export async function updateRole(req: AuthRequest, res: Response) {
  try {
    const { name } = req.params;
    const { label, description, permissions } = req.body;

    const role = await (Role as any).findOne({ name });
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    // Prevent modification of protected roles
    if (role.protected) {
      return res.status(403).json({ error: "Cannot modify protected role" });
    }

    const updates: any = {};
    if (label !== undefined) updates.label = label;
    if (description !== undefined) updates.description = description;
    if (permissions !== undefined) updates.permissions = permissions;

    const updatedRole = await (Role as any).findOneAndUpdate(
      { name },
      { $set: updates },
      { new: true }
    );

    // Log action
    await (AdminActionLog as any).create({
      actorId: req.userId,
      action: "role.update",
      targetType: "Role",
      targetId: role._id,
      metadata: { name, updates },
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.json({ role: updatedRole });
  } catch (error) {
    console.error("Update role error:", error);
    res.status(500).json({ error: "Failed to update role" });
  }
}

/**
 * DELETE /v1/admin/roles/:name - Delete role
 */
export async function deleteRole(req: AuthRequest, res: Response) {
  try {
    const { name } = req.params;

    const role = await (Role as any).findOne({ name });
    if (!role) {
      return res.status(404).json({ error: "Role not found" });
    }

    // Prevent deletion of protected roles
    if (role.protected) {
      return res.status(403).json({ error: "Cannot delete protected role" });
    }

    await (Role as any).deleteOne({ name });

    // Log action
    await (AdminActionLog as any).create({
      actorId: req.userId,
      action: "role.delete",
      targetType: "Role",
      targetId: role._id,
      metadata: { name },
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    console.error("Delete role error:", error);
    res.status(500).json({ error: "Failed to delete role" });
  }
}

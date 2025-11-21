// src/controllers/adminUsers.ts
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import User from "../models/User.js";
import Role from "../models/Role.js";
import AdminActionLog from "../models/AdminActionLog.js";
import { getUserPermissions } from "../helpers/permissions.js";
import { logAdminAction } from "../helpers/auditLog.js";

/**
 * GET /v1/admin/users - List all users
 */
export async function listUsers(req: AuthRequest, res: Response) {
  try {
    const { page = 1, limit = 20, role } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);

    const filter: any = {};
    if (role) filter.role = role;

    const users = await (User as any)
      .find(filter)
      .select("-passwordHash -refreshSessions")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await (User as any).countDocuments(filter);

    res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("List users error:", error);
    res.status(500).json({ error: "Failed to list users" });
  }
}

/**
 * GET /v1/admin/users/:id - Get user details
 */
export async function getUser(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const user = await (User as any)
      .findById(id)
      .select("-passwordHash -refreshSessions");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get user's permissions
    const permissions = await getUserPermissions(user._id.toString());

    res.json({
      user,
      permissions,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to get user" });
  }
}

/**
 * PATCH /v1/admin/users/:id/role - Assign role to user
 */
export async function assignRole(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ error: "role is required" });
    }

    // Verify role exists
    const roleDoc = await (Role as any).findOne({ name: role });
    if (!roleDoc) {
      return res.status(404).json({ error: "Role not found" });
    }

    const user = await (User as any).findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    // Log action
    await logAdminAction(req, {
      actorId: req.userId!,
      action: "user.assign_role",
      targetType: "User",
      targetId: user._id,
      metadata: { oldRole, newRole: role },
    });

    res.json({
      message: "Role assigned successfully",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Assign role error:", error);
    res.status(500).json({ error: "Failed to assign role" });
  }
}

/**
 * PATCH /v1/admin/users/:id/permissions - Add extra permissions
 */
export async function addPermissions(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({ error: "permissions array is required" });
    }

    const user = await (User as any).findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const extraPerms = new Set(user.extraPermissions || []);
    permissions.forEach((perm) => extraPerms.add(perm));
    user.extraPermissions = Array.from(extraPerms);
    await user.save();

    // Log action
    await (AdminActionLog as any).create({
      actorId: req.userId,
      action: "user.add_permissions",
      targetType: "User",
      targetId: user._id,
      metadata: { addedPermissions: permissions },
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.json({
      message: "Permissions added successfully",
      extraPermissions: user.extraPermissions,
    });
  } catch (error) {
    console.error("Add permissions error:", error);
    res.status(500).json({ error: "Failed to add permissions" });
  }
}

/**
 * GET /v1/admin/users/:id/sessions - View user sessions
 */
export async function getUserSessions(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const user = await (User as any).findById(id).select("refreshSessions");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const sessions = user.refreshSessions.map((session: any) => ({
      jti: session.jti,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      ip: session.ip,
      userAgent: session.userAgent,
      isExpired: session.expiresAt < new Date(),
    }));

    res.json({ sessions });
  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({ error: "Failed to get sessions" });
  }
}

/**
 * DELETE /v1/admin/users/:id/sessions/:jti - Revoke specific session
 */
export async function revokeSession(req: AuthRequest, res: Response) {
  try {
    const { id, jti } = req.params;

    const user = await (User as any).findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const sessionIndex = user.refreshSessions.findIndex(
      (s: any) => s.jti === jti
    );
    if (sessionIndex === -1) {
      return res.status(404).json({ error: "Session not found" });
    }

    user.refreshSessions.splice(sessionIndex, 1);
    await user.save();

    // Log action
    await (AdminActionLog as any).create({
      actorId: req.userId,
      action: "user.revoke_session",
      targetType: "User",
      targetId: user._id,
      metadata: { jti },
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.json({ message: "Session revoked successfully" });
  } catch (error) {
    console.error("Revoke session error:", error);
    res.status(500).json({ error: "Failed to revoke session" });
  }
}

/**
 * DELETE /v1/admin/users/:id/sessions - Revoke all sessions for user
 */
export async function revokeAllSessions(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const user = await (User as any).findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const sessionCount = user.refreshSessions.length;
    user.refreshSessions = [];
    await user.save();

    // Log action
    await (AdminActionLog as any).create({
      actorId: req.userId,
      action: "user.revoke_all_sessions",
      targetType: "User",
      targetId: user._id,
      metadata: { sessionCount },
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.json({
      message: "All sessions revoked successfully",
      revokedCount: sessionCount,
    });
  } catch (error) {
    console.error("Revoke all sessions error:", error);
    res.status(500).json({ error: "Failed to revoke sessions" });
  }
}

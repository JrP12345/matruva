// src/middleware/auth.ts
import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../helpers/jwt.js";
import User from "../models/User.js";
import Role from "../models/Role.js";

export interface AuthRequest extends Request {
  user?: any;
  userId?: string;
  userRole?: string;
}

/**
 * Middleware to verify JWT access token from cookies
 */
export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  // Try to get access token from cookie first, then fall back to Authorization header
  let token = req.cookies?.access_token;

  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  const payload = verifyAccessToken(token);

  if (!payload || !payload.sub) {
    return res.status(401).json({ error: "Invalid token" });
  }

  req.userId = payload.sub;
  req.userRole = payload.role;
  req.user = payload;
  next();
}

/**
 * Middleware to check if user has required permission
 */
export function requirePermission(permission: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userId || !req.userRole) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    try {
      const role = await (Role as any).findOne({ name: req.userRole });
      if (!role) {
        return res.status(403).json({ error: "Role not found" });
      }

      // Check if role has wildcard or specific permission
      if (
        role.permissions.includes("*") ||
        role.permissions.includes(permission)
      ) {
        return next();
      }

      // Check user extra permissions
      const user = await (User as any).findById(req.userId);
      if (user?.extraPermissions?.includes(permission)) {
        return next();
      }

      return res.status(403).json({ error: "Insufficient permissions" });
    } catch (error) {
      console.error("Permission check error:", error);
      return res.status(500).json({ error: "Permission check failed" });
    }
  };
}

/**
 * Middleware to check if user has SUPER_ADMIN role
 */
export function requireSuperAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  if (req.userRole !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Super admin access required" });
  }
  next();
}

// src/helpers/permissions.ts
import User from "../models/User.js";
import Role from "../models/Role.js";

/**
 * Check if a user has a specific permission
 */
export async function userHasPermission(
  userId: string,
  permission: string
): Promise<boolean> {
  try {
    const user = await (User as any).findById(userId);
    if (!user) return false;

    // Check user's extra permissions first
    if (user.extraPermissions?.includes(permission)) {
      return true;
    }

    // Check role permissions
    const role = await (Role as any).findOne({ name: user.role });
    if (!role) return false;

    // Wildcard permission grants everything
    if (role.permissions.includes("*")) {
      return true;
    }

    // Check specific permission
    return role.permissions.includes(permission);
  } catch (error) {
    console.error("Permission check error:", error);
    return false;
  }
}

/**
 * Check if user has any of the specified permissions
 */
export async function userHasAnyPermission(
  userId: string,
  permissions: string[]
): Promise<boolean> {
  for (const permission of permissions) {
    if (await userHasPermission(userId, permission)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if user has all of the specified permissions
 */
export async function userHasAllPermissions(
  userId: string,
  permissions: string[]
): Promise<boolean> {
  for (const permission of permissions) {
    if (!(await userHasPermission(userId, permission))) {
      return false;
    }
  }
  return true;
}

/**
 * Get all permissions for a user (from role + extra permissions)
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  try {
    const user = await (User as any).findById(userId);
    if (!user) return [];

    const permissions = new Set<string>(user.extraPermissions || []);

    const role = await (Role as any).findOne({ name: user.role });
    if (role) {
      role.permissions.forEach((perm: string) => permissions.add(perm));
    }

    return Array.from(permissions);
  } catch (error) {
    console.error("Get permissions error:", error);
    return [];
  }
}

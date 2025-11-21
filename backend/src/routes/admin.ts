// src/routes/admin.ts
import { Router } from "express";
import { requireAuth, requireSuperAdmin } from "../middleware/auth.js";
import {
  listRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
} from "../controllers/adminRoles.js";
import {
  listPermissions,
  createPermission,
  deletePermission,
} from "../controllers/adminPermissions.js";
import {
  listUsers,
  getUser,
  assignRole,
  addPermissions,
  getUserSessions,
  revokeSession,
  revokeAllSessions,
} from "../controllers/adminUsers.js";
import { getDashboard } from "../controllers/adminDashboard.js";
import { queryAuditLogs } from "../controllers/adminAudit.js";

// Import admin keys routes
import adminKeysRouter from "./adminKeys.js";

const router = Router();

// All admin routes require authentication and SUPER_ADMIN role
router.use(requireAuth, requireSuperAdmin);

// Dashboard
router.get("/dashboard", getDashboard);

// Audit logs
router.get("/audit", queryAuditLogs);

// Role management
router.get("/roles", listRoles);
router.get("/roles/:name", getRole);
router.post("/roles", createRole);
router.patch("/roles/:name", updateRole);
router.delete("/roles/:name", deleteRole);

// Permission management
router.get("/permissions", listPermissions);
router.post("/permissions", createPermission);
router.delete("/permissions/:key", deletePermission);

// User management
router.get("/users", listUsers);
router.get("/users/:id", getUser);
router.patch("/users/:id/role", assignRole);
router.patch("/users/:id/permissions", addPermissions);
router.get("/users/:id/sessions", getUserSessions);
router.delete("/users/:id/sessions/:jti", revokeSession);
router.delete("/users/:id/sessions", revokeAllSessions);

// Key management (already has auth middleware)
router.use("/keys", adminKeysRouter);

export default router;

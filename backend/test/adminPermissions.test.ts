// test/adminPermissions.test.ts
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "@jest/globals";
import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import adminRoutes from "../src/routes/admin.js";
import authRoutes from "../src/routes/auth.js";
import {
  setupDatabase,
  teardownDatabase,
  clearDatabase,
  seedBasicData,
  createSuperAdmin,
  extractCookie,
} from "./setup.js";
import Permission from "../src/models/Permission.js";
import AdminActionLog from "../src/models/AdminActionLog.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/v1/auth", authRoutes);
app.use("/v1/admin", adminRoutes);

describe("Admin Permissions Management Tests", () => {
  let superAdminToken: string;

  beforeAll(async () => {
    await setupDatabase();
  });

  afterAll(async () => {
    await teardownDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
    await seedBasicData();

    await createSuperAdmin("superadmin@test.com", "SuperPass123!");
    const loginResponse = await request(app).post("/v1/auth/login").send({
      email: "superadmin@test.com",
      password: "SuperPass123!",
    });
    superAdminToken = extractCookie(loginResponse.headers, "access_token")!;
  });

  describe("List Permissions", () => {
    it("should list all permissions", async () => {
      const response = await request(app)
        .get("/v1/admin/permissions")
        .set("Cookie", `access_token=${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.permissions).toBeDefined();
      expect(response.body.permissions.length).toBeGreaterThan(0);

      const permissionKeys = response.body.permissions.map((p: any) => p.key);
      expect(permissionKeys).toContain("users:view");
      expect(permissionKeys).toContain("orders:view");
    });

    it("should sort permissions by key", async () => {
      const response = await request(app)
        .get("/v1/admin/permissions")
        .set("Cookie", `access_token=${superAdminToken}`);

      const keys = response.body.permissions.map((p: any) => p.key);
      const sortedKeys = [...keys].sort();
      expect(keys).toEqual(sortedKeys);
    });
  });

  describe("Create Permission", () => {
    it("should create a new permission successfully", async () => {
      const response = await request(app)
        .post("/v1/admin/permissions")
        .set("Cookie", `access_token=${superAdminToken}`)
        .send({
          key: "products.manage",
          description: "Manage products",
          category: "products",
        });

      expect(response.status).toBe(201);
      expect(response.body.permission).toBeDefined();
      expect(response.body.permission.key).toBe("products.manage");
      expect(response.body.permission.protected).toBe(false);

      // Verify permission created in database
      const permission = await (Permission as any).findOne({
        key: "products.manage",
      });
      expect(permission).not.toBeNull();
    });

    it("should log permission creation to audit log", async () => {
      await request(app)
        .post("/v1/admin/permissions")
        .set("Cookie", `access_token=${superAdminToken}`)
        .send({
          key: "audit.test",
          description: "Audit test permission",
        });

      const logs = await (AdminActionLog as any).find({
        action: "permission.create",
      });
      expect(logs.length).toBeGreaterThan(0);

      const log = logs[logs.length - 1];
      expect(log.targetType).toBe("Permission");
      expect(log.metadata.key).toBe("audit.test");
    });

    it("should reject duplicate permission keys", async () => {
      await request(app)
        .post("/v1/admin/permissions")
        .set("Cookie", `access_token=${superAdminToken}`)
        .send({
          key: "duplicate.perm",
          description: "First",
        });

      const response = await request(app)
        .post("/v1/admin/permissions")
        .set("Cookie", `access_token=${superAdminToken}`)
        .send({
          key: "duplicate.perm",
          description: "Second",
        });

      expect(response.status).toBe(409);
    });

    it("should reject permission creation without key", async () => {
      const response = await request(app)
        .post("/v1/admin/permissions")
        .set("Cookie", `access_token=${superAdminToken}`)
        .send({
          description: "No key provided",
        });

      expect(response.status).toBe(400);
    });
  });

  describe("Delete Permission", () => {
    beforeEach(async () => {
      await (Permission as any).create({
        key: "deletable.perm",
        description: "Deletable permission",
        category: "test",
        protected: false,
      });
    });

    it("should delete permission successfully", async () => {
      const response = await request(app)
        .delete("/v1/admin/permissions/deletable.perm")
        .set("Cookie", `access_token=${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("deleted");

      // Verify permission deleted from database
      const permission = await (Permission as any).findOne({
        key: "deletable.perm",
      });
      expect(permission).toBeNull();
    });

    it("should log permission deletion to audit log", async () => {
      await request(app)
        .delete("/v1/admin/permissions/deletable.perm")
        .set("Cookie", `access_token=${superAdminToken}`);

      const logs = await (AdminActionLog as any).find({
        action: "permission.delete",
      });
      expect(logs.length).toBeGreaterThan(0);

      const log = logs[logs.length - 1];
      expect(log.metadata.key).toBe("deletable.perm");
    });

    it("should reject deletion of protected permissions", async () => {
      // Mark a permission as protected
      await (Permission as any).updateOne(
        { key: "users:view" },
        { protected: true }
      );

      const response = await request(app)
        .delete("/v1/admin/permissions/users:view")
        .set("Cookie", `access_token=${superAdminToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain("protected");

      // Verify permission still exists
      const permission = await (Permission as any).findOne({
        key: "users:view",
      });
      expect(permission).not.toBeNull();
    });

    it("should return 404 for non-existent permission", async () => {
      const response = await request(app)
        .delete("/v1/admin/permissions/nonexistent.perm")
        .set("Cookie", `access_token=${superAdminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe("Permission Usage Checks", () => {
    it("should verify permission can be safely deleted when not in use", async () => {
      await (Permission as any).create({
        key: "unused.permission",
        description: "Not used by any role",
        protected: false,
      });

      const response = await request(app)
        .delete("/v1/admin/permissions/unused.permission")
        .set("Cookie", `access_token=${superAdminToken}`);

      expect(response.status).toBe(200);
    });
  });
});

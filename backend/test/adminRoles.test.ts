// test/adminRoles.test.ts
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
import {
  setupDatabase,
  teardownDatabase,
  clearDatabase,
  seedBasicData,
  createSuperAdmin,
  createTestUser,
  extractCookie,
} from "./setup.js";
import Role from "../src/models/Role.js";
import AdminActionLog from "../src/models/AdminActionLog.js";
import authRoutes from "../src/routes/auth.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/v1/auth", authRoutes);
app.use("/v1/admin", adminRoutes);

describe("Admin Roles Management Tests", () => {
  let superAdminToken: string;
  let regularUserToken: string;

  beforeAll(async () => {
    await setupDatabase();
  });

  afterAll(async () => {
    await teardownDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
    await seedBasicData();

    // Create super admin and login
    await createSuperAdmin("superadmin@test.com", "SuperPass123!");
    const superAdminLogin = await request(app).post("/v1/auth/login").send({
      email: "superadmin@test.com",
      password: "SuperPass123!",
    });
    superAdminToken = extractCookie(superAdminLogin.headers, "access_token")!;

    // Create regular user and login
    await createTestUser("user@test.com", "UserPass123!", "USER");
    const userLogin = await request(app).post("/v1/auth/login").send({
      email: "user@test.com",
      password: "UserPass123!",
    });
    regularUserToken = extractCookie(userLogin.headers, "access_token")!;
  });

  describe("List Roles", () => {
    it("should list all roles for super admin", async () => {
      const response = await request(app)
        .get("/v1/admin/roles")
        .set("Cookie", `access_token=${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.roles).toBeDefined();
      expect(response.body.roles.length).toBeGreaterThanOrEqual(3); // SUPER_ADMIN, ADMIN, USER

      const roleNames = response.body.roles.map((r: any) => r.name);
      expect(roleNames).toContain("SUPER_ADMIN");
      expect(roleNames).toContain("ADMIN");
      expect(roleNames).toContain("USER");
    });

    it("should reject non-super-admin users", async () => {
      const response = await request(app)
        .get("/v1/admin/roles")
        .set("Cookie", `access_token=${regularUserToken}`);

      expect(response.status).toBe(403);
    });

    it("should reject unauthenticated requests", async () => {
      const response = await request(app).get("/v1/admin/roles");

      expect(response.status).toBe(401);
    });
  });

  describe("Get Role Details", () => {
    it("should get role details by name", async () => {
      const response = await request(app)
        .get("/v1/admin/roles/ADMIN")
        .set("Cookie", `access_token=${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.role).toBeDefined();
      expect(response.body.role.name).toBe("ADMIN");
      expect(response.body.role.label).toBeDefined();
      expect(response.body.role.permissions).toBeDefined();
    });

    it("should return 404 for non-existent role", async () => {
      const response = await request(app)
        .get("/v1/admin/roles/NONEXISTENT")
        .set("Cookie", `access_token=${superAdminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe("Create Role", () => {
    it("should create a new role successfully", async () => {
      const response = await request(app)
        .post("/v1/admin/roles")
        .set("Cookie", `access_token=${superAdminToken}`)
        .send({
          name: "MANAGER",
          label: "Store Manager",
          description: "Manages store operations",
          permissions: ["users.view", "orders.view"],
        });

      expect(response.status).toBe(201);
      expect(response.body.role).toBeDefined();
      expect(response.body.role.name).toBe("MANAGER");
      expect(response.body.role.protected).toBe(false);

      // Verify role created in database
      const role = await (Role as any).findOne({ name: "MANAGER" });
      expect(role).not.toBeNull();
      expect(role.label).toBe("Store Manager");
    });

    it("should log role creation to audit log", async () => {
      await request(app)
        .post("/v1/admin/roles")
        .set("Cookie", `access_token=${superAdminToken}`)
        .send({
          name: "AUDITOR",
          label: "Auditor",
          permissions: ["orders.view"],
        });

      const logs = await (AdminActionLog as any).find({
        action: "role.create",
      });
      expect(logs.length).toBeGreaterThan(0);

      const log = logs[logs.length - 1];
      expect(log.actorId).toBeDefined();
      expect(log.targetType).toBe("Role");
      expect(log.metadata.name).toBe("AUDITOR");
    });

    it("should reject duplicate role names", async () => {
      await request(app)
        .post("/v1/admin/roles")
        .set("Cookie", `access_token=${superAdminToken}`)
        .send({
          name: "DUPLICATE",
          label: "First",
        });

      const response = await request(app)
        .post("/v1/admin/roles")
        .set("Cookie", `access_token=${superAdminToken}`)
        .send({
          name: "DUPLICATE",
          label: "Second",
        });

      expect(response.status).toBe(409);
    });

    it("should reject role creation without required fields", async () => {
      const response = await request(app)
        .post("/v1/admin/roles")
        .set("Cookie", `access_token=${superAdminToken}`)
        .send({
          name: "INCOMPLETE",
          // Missing label
        });

      expect(response.status).toBe(400);
    });
  });

  describe("Update Role", () => {
    beforeEach(async () => {
      await (Role as any).create({
        name: "UPDATABLE",
        label: "Original Label",
        description: "Original description",
        permissions: ["users.view"],
        protected: false,
      });
    });

    it("should update role successfully", async () => {
      const response = await request(app)
        .patch("/v1/admin/roles/UPDATABLE")
        .set("Cookie", `access_token=${superAdminToken}`)
        .send({
          label: "Updated Label",
          permissions: ["users.view", "orders.view"],
        });

      expect(response.status).toBe(200);
      expect(response.body.role.label).toBe("Updated Label");
      expect(response.body.role.permissions).toContain("orders.view");
    });

    it("should log role updates to audit log", async () => {
      await request(app)
        .patch("/v1/admin/roles/UPDATABLE")
        .set("Cookie", `access_token=${superAdminToken}`)
        .send({
          label: "Audit Test",
        });

      const logs = await (AdminActionLog as any).find({
        action: "role.update",
      });
      expect(logs.length).toBeGreaterThan(0);

      const log = logs[logs.length - 1];
      expect(log.metadata.name).toBe("UPDATABLE");
      expect(log.metadata.updates).toBeDefined();
    });

    it("should reject updates to protected roles", async () => {
      const response = await request(app)
        .patch("/v1/admin/roles/SUPER_ADMIN")
        .set("Cookie", `access_token=${superAdminToken}`)
        .send({
          label: "Hacked Super Admin",
        });

      expect(response.status).toBe(403);
      expect(response.body.error).toContain("protected");

      // Verify role unchanged
      const role = await (Role as any).findOne({ name: "SUPER_ADMIN" });
      expect(role.label).not.toBe("Hacked Super Admin");
    });

    it("should return 404 for non-existent role", async () => {
      const response = await request(app)
        .patch("/v1/admin/roles/NONEXISTENT")
        .set("Cookie", `access_token=${superAdminToken}`)
        .send({
          label: "Does Not Exist",
        });

      expect(response.status).toBe(404);
    });
  });

  describe("Delete Role", () => {
    beforeEach(async () => {
      await (Role as any).create({
        name: "DELETABLE",
        label: "Deletable Role",
        permissions: [],
        protected: false,
      });
    });

    it("should delete role successfully", async () => {
      const response = await request(app)
        .delete("/v1/admin/roles/DELETABLE")
        .set("Cookie", `access_token=${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("deleted");

      // Verify role deleted from database
      const role = await (Role as any).findOne({ name: "DELETABLE" });
      expect(role).toBeNull();
    });

    it("should log role deletion to audit log", async () => {
      await request(app)
        .delete("/v1/admin/roles/DELETABLE")
        .set("Cookie", `access_token=${superAdminToken}`);

      const logs = await (AdminActionLog as any).find({
        action: "role.delete",
      });
      expect(logs.length).toBeGreaterThan(0);

      const log = logs[logs.length - 1];
      expect(log.metadata.name).toBe("DELETABLE");
    });

    it("should reject deletion of protected roles", async () => {
      const response = await request(app)
        .delete("/v1/admin/roles/SUPER_ADMIN")
        .set("Cookie", `access_token=${superAdminToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error).toContain("protected");

      // Verify role still exists
      const role = await (Role as any).findOne({ name: "SUPER_ADMIN" });
      expect(role).not.toBeNull();
    });

    it("should reject deletion of ADMIN role", async () => {
      const response = await request(app)
        .delete("/v1/admin/roles/ADMIN")
        .set("Cookie", `access_token=${superAdminToken}`);

      expect(response.status).toBe(403);
    });

    it("should reject deletion of USER role", async () => {
      const response = await request(app)
        .delete("/v1/admin/roles/USER")
        .set("Cookie", `access_token=${superAdminToken}`);

      expect(response.status).toBe(403);
    });

    it("should return 404 for non-existent role", async () => {
      const response = await request(app)
        .delete("/v1/admin/roles/NONEXISTENT")
        .set("Cookie", `access_token=${superAdminToken}`);

      expect(response.status).toBe(404);
    });
  });
});

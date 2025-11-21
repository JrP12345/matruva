// test/adminUsers.test.ts
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
  createTestUser,
  extractCookie,
} from "./setup.js";
import User from "../src/models/User.js";
import Role from "../src/models/Role.js";
import AdminActionLog from "../src/models/AdminActionLog.js";
import { hashPassword } from "../src/helpers/authHelpers.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/v1/auth", authRoutes);
app.use("/v1/admin", adminRoutes);

describe("Admin Users Management Tests", () => {
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

  describe("List Users", () => {
    beforeEach(async () => {
      for (let i = 1; i <= 25; i++) {
        await createTestUser(`user${i}@test.com`, "Pass123!", "USER");
      }
    });

    it("should list users with default pagination", async () => {
      const response = await request(app)
        .get("/v1/admin/users")
        .set("Cookie", `access_token=${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.users).toBeDefined();
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(20);
      expect(response.body.users.length).toBeLessThanOrEqual(20);
    });

    it("should support custom pagination", async () => {
      const response = await request(app)
        .get("/v1/admin/users?page=2&limit=10")
        .set("Cookie", `access_token=${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.pagination.page).toBe(2);
      expect(response.body.pagination.limit).toBe(10);
      expect(response.body.users.length).toBeLessThanOrEqual(10);
    });

    it("should filter users by role", async () => {
      await createTestUser("admin1@test.com", "Pass123!", "ADMIN");
      await createTestUser("admin2@test.com", "Pass123!", "ADMIN");

      const response = await request(app)
        .get("/v1/admin/users?role=ADMIN")
        .set("Cookie", `access_token=${superAdminToken}`);

      expect(response.status).toBe(200);
      const allAdmin = response.body.users.every(
        (u: any) => u.role === "ADMIN"
      );
      expect(allAdmin).toBe(true);
    });

    it("should not include sensitive fields", async () => {
      const response = await request(app)
        .get("/v1/admin/users")
        .set("Cookie", `access_token=${superAdminToken}`);

      expect(response.status).toBe(200);
      const firstUser = response.body.users[0];
      expect(firstUser.passwordHash).toBeUndefined();
      expect(firstUser.refreshSessions).toBeUndefined();
    });
  });

  describe("Get User Details", () => {
    let testUserId: string;

    beforeEach(async () => {
      const user = await createTestUser("details@test.com", "Pass123!", "USER");
      testUserId = user._id.toString();
    });

    it("should get user details with permissions", async () => {
      const response = await request(app)
        .get(`/v1/admin/users/${testUserId}`)
        .set("Cookie", `access_token=${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.permissions).toBeDefined();
      expect(response.body.user.email).toBe("details@test.com");
    });

    it("should return 404 for non-existent user", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const response = await request(app)
        .get(`/v1/admin/users/${fakeId}`)
        .set("Cookie", `access_token=${superAdminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe("Assign Role", () => {
    let testUserId: string;

    beforeEach(async () => {
      const user = await createTestUser(
        "roletest@test.com",
        "Pass123!",
        "USER"
      );
      testUserId = user._id.toString();
    });

    it("should assign role to user successfully", async () => {
      const response = await request(app)
        .patch(`/v1/admin/users/${testUserId}/role`)
        .set("Cookie", `access_token=${superAdminToken}`)
        .send({ role: "ADMIN" });

      expect(response.status).toBe(200);
      expect(response.body.user.role).toBe("ADMIN");

      // Verify in database
      const user = await (User as any).findById(testUserId);
      expect(user.role).toBe("ADMIN");
    });

    it("should log role assignment to audit log", async () => {
      await request(app)
        .patch(`/v1/admin/users/${testUserId}/role`)
        .set("Cookie", `access_token=${superAdminToken}`)
        .send({ role: "ADMIN" });

      const logs = await (AdminActionLog as any).find({
        action: "user.assign_role",
      });
      expect(logs.length).toBeGreaterThan(0);

      const log = logs[logs.length - 1];
      expect(log.metadata.oldRole).toBe("USER");
      expect(log.metadata.newRole).toBe("ADMIN");
    });

    it("should reject non-existent role", async () => {
      const response = await request(app)
        .patch(`/v1/admin/users/${testUserId}/role`)
        .set("Cookie", `access_token=${superAdminToken}`)
        .send({ role: "INVALID_ROLE" });

      expect(response.status).toBe(404);
    });

    it("should reject assignment without role", async () => {
      const response = await request(app)
        .patch(`/v1/admin/users/${testUserId}/role`)
        .set("Cookie", `access_token=${superAdminToken}`)
        .send({});

      expect(response.status).toBe(400);
    });
  });

  describe("Add Extra Permissions", () => {
    let testUserId: string;

    beforeEach(async () => {
      const user = await createTestUser(
        "permstest@test.com",
        "Pass123!",
        "USER"
      );
      testUserId = user._id.toString();
    });

    it("should add extra permissions to user", async () => {
      const response = await request(app)
        .patch(`/v1/admin/users/${testUserId}/permissions`)
        .set("Cookie", `access_token=${superAdminToken}`)
        .send({ permissions: ["orders.view", "users.view"] });

      expect(response.status).toBe(200);
      expect(response.body.extraPermissions).toContain("orders.view");
      expect(response.body.extraPermissions).toContain("users.view");

      // Verify in database
      const user = await (User as any).findById(testUserId);
      expect(user.extraPermissions).toContain("orders.view");
    });

    it("should log permission addition to audit log", async () => {
      await request(app)
        .patch(`/v1/admin/users/${testUserId}/permissions`)
        .set("Cookie", `access_token=${superAdminToken}`)
        .send({ permissions: ["orders.view"] });

      const logs = await (AdminActionLog as any).find({
        action: "user.add_permissions",
      });
      expect(logs.length).toBeGreaterThan(0);

      const log = logs[logs.length - 1];
      expect(log.metadata.addedPermissions).toContain("orders.view");
    });

    it("should not duplicate existing permissions", async () => {
      // Add first time
      await request(app)
        .patch(`/v1/admin/users/${testUserId}/permissions`)
        .set("Cookie", `access_token=${superAdminToken}`)
        .send({ permissions: ["orders.view"] });

      // Add again
      const response = await request(app)
        .patch(`/v1/admin/users/${testUserId}/permissions`)
        .set("Cookie", `access_token=${superAdminToken}`)
        .send({ permissions: ["orders.view", "users.view"] });

      expect(response.status).toBe(200);

      const user = await (User as any).findById(testUserId);
      const orderViewCount = user.extraPermissions.filter(
        (p: string) => p === "orders.view"
      ).length;
      expect(orderViewCount).toBe(1);
    });
  });

  describe("Session Management", () => {
    let testUserId: string;
    let userToken: string;

    beforeEach(async () => {
      await createTestUser("session@test.com", "Pass123!", "USER");
      const loginResponse = await request(app).post("/v1/auth/login").send({
        email: "session@test.com",
        password: "Pass123!",
      });
      userToken = extractCookie(loginResponse.headers, "access_token")!;

      const user = await (User as any).findOne({ email: "session@test.com" });
      testUserId = user._id.toString();
    });

    it("should view user sessions", async () => {
      const response = await request(app)
        .get(`/v1/admin/users/${testUserId}/sessions`)
        .set("Cookie", `access_token=${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.sessions).toBeDefined();
      expect(response.body.sessions.length).toBeGreaterThan(0);

      const session = response.body.sessions[0];
      expect(session.jti).toBeDefined();
      expect(session.createdAt).toBeDefined();
      expect(session.expiresAt).toBeDefined();
    });

    it("should revoke specific session", async () => {
      const user = await (User as any).findById(testUserId);
      const jti = user.refreshSessions[0].jti;

      const response = await request(app)
        .delete(`/v1/admin/users/${testUserId}/sessions/${jti}`)
        .set("Cookie", `access_token=${superAdminToken}`);

      expect(response.status).toBe(200);

      // Verify session removed
      const updatedUser = await (User as any).findById(testUserId);
      expect(updatedUser.refreshSessions).toHaveLength(0);
    });

    it("should log session revocation", async () => {
      const user = await (User as any).findById(testUserId);
      const jti = user.refreshSessions[0].jti;

      await request(app)
        .delete(`/v1/admin/users/${testUserId}/sessions/${jti}`)
        .set("Cookie", `access_token=${superAdminToken}`);

      const logs = await (AdminActionLog as any).find({
        action: "user.revoke_session",
      });
      expect(logs.length).toBeGreaterThan(0);
    });

    it("should revoke all sessions", async () => {
      // Create multiple sessions
      await request(app).post("/v1/auth/login").send({
        email: "session@test.com",
        password: "Pass123!",
      });

      const response = await request(app)
        .delete(`/v1/admin/users/${testUserId}/sessions`)
        .set("Cookie", `access_token=${superAdminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.revokedCount).toBeGreaterThan(0);

      // Verify all sessions removed
      const user = await (User as any).findById(testUserId);
      expect(user.refreshSessions).toHaveLength(0);
    });

    it("should log revocation of all sessions", async () => {
      await request(app)
        .delete(`/v1/admin/users/${testUserId}/sessions`)
        .set("Cookie", `access_token=${superAdminToken}`);

      const logs = await (AdminActionLog as any).find({
        action: "user.revoke_all_sessions",
      });
      expect(logs.length).toBeGreaterThan(0);
    });
  });
});

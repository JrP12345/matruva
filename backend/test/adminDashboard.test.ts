// test/adminDashboard.test.ts
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
} from "./setup.js";
import User from "../src/models/User.js";
import Order from "../src/models/Order.js";
import AdminActionLog from "../src/models/AdminActionLog.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/v1/auth", authRoutes);
app.use("/v1/admin", adminRoutes);

let superAdminToken: string;

beforeAll(async () => {
  await setupDatabase();
  await seedBasicData();
});

afterAll(async () => {
  await teardownDatabase();
});

beforeEach(async () => {
  await clearDatabase();
  await seedBasicData();

  // Create super admin and login
  await createSuperAdmin();
  const loginRes = await request(app).post("/v1/auth/login").send({
    email: "superadmin@test.com",
    password: "SuperPass123!",
  });
  superAdminToken = loginRes.body.accessToken;
});

describe("Admin Dashboard", () => {
  describe("GET /v1/admin/dashboard", () => {
    it("should return dashboard statistics for super admin", async () => {
      // Create some test data
      await createTestUser("user1@test.com", "pass123", "USER");
      await createTestUser("user2@test.com", "pass123", "ADMIN");

      const res = await request(app)
        .get("/v1/admin/dashboard")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("stats");
      expect(res.body).toHaveProperty("recentActions");

      // Check stats
      expect(res.body.stats).toHaveProperty("usersCount");
      expect(res.body.stats).toHaveProperty("rolesCount");
      expect(res.body.stats).toHaveProperty("permissionsCount");
      expect(res.body.stats).toHaveProperty("ordersCount");

      // Should have at least 3 users (superadmin + 2 test users)
      expect(res.body.stats.usersCount).toBeGreaterThanOrEqual(3);

      // Should have 3 default roles
      expect(res.body.stats.rolesCount).toBe(3);

      // Recent actions should be an array
      expect(Array.isArray(res.body.recentActions)).toBe(true);
    });

    it("should limit recent actions to 10 items", async () => {
      // Create 15 audit log entries
      const superAdmin = await User.findOne({
        email: "superadmin@test.com",
      });

      for (let i = 0; i < 15; i++) {
        await (AdminActionLog as any).create({
          actorId: superAdmin._id,
          actorEmail: superAdmin.email,
          action: `test.action.${i}`,
          targetType: "Test",
          targetId: `test-${i}`,
        });
      }

      const res = await request(app)
        .get("/v1/admin/dashboard")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.recentActions.length).toBeLessThanOrEqual(10);
    });

    it("should return recent actions in descending order", async () => {
      const superAdmin = await User.findOne({
        email: "superadmin@test.com",
      });

      // Create actions with delays to ensure order
      for (let i = 0; i < 5; i++) {
        await (AdminActionLog as any).create({
          actorId: superAdmin._id,
          actorEmail: superAdmin.email,
          action: `test.action.${i}`,
          createdAt: new Date(Date.now() + i * 1000),
        });
      }

      const res = await request(app)
        .get("/v1/admin/dashboard")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      const actions = res.body.recentActions;

      // Check that actions are in descending order (most recent first)
      for (let i = 0; i < actions.length - 1; i++) {
        const current = new Date(actions[i].createdAt).getTime();
        const next = new Date(actions[i + 1].createdAt).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });

    it("should include action details in recent actions", async () => {
      const superAdmin = await User.findOne({
        email: "superadmin@test.com",
      });

      await (AdminActionLog as any).create({
        actorId: superAdmin._id,
        actorEmail: superAdmin.email,
        action: "user.create",
        targetType: "User",
        targetId: "test-user-id",
        metadata: { role: "ADMIN" },
      });

      const res = await request(app)
        .get("/v1/admin/dashboard")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.recentActions.length).toBeGreaterThan(0);

      const action = res.body.recentActions.find(
        (a: any) => a.action === "user.create"
      );
      expect(action).toBeDefined();
      expect(action.actorEmail).toBe("superadmin@test.com");
      expect(action.targetType).toBe("User");
      expect(action.targetId).toBe("test-user-id");
    });

    it("should reject request without authentication", async () => {
      const res = await request(app).get("/v1/admin/dashboard");

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

    it("should reject request from non-super-admin", async () => {
      // Create regular user
      await createTestUser("user@test.com", "pass123", "USER");

      const loginRes = await request(app).post("/v1/auth/login").send({
        email: "user@test.com",
        password: "pass123",
      });

      const userToken = loginRes.body.accessToken;

      const res = await request(app)
        .get("/v1/admin/dashboard")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");
    });

    it("should return zero counts for empty collections", async () => {
      // Clear all data except roles and permissions (seeded)
      await User.deleteMany({});
      await Order.deleteMany({});
      await AdminActionLog.deleteMany({});

      // Re-create super admin for auth
      await createSuperAdmin();
      const loginRes = await request(app).post("/v1/auth/login").send({
        email: "superadmin@test.com",
        password: "SuperPass123!",
      });
      const token = loginRes.body.accessToken;

      const res = await request(app)
        .get("/v1/admin/dashboard")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.stats.ordersCount).toBe(0);
      expect(res.body.recentActions.length).toBe(0);
    });
  });
});

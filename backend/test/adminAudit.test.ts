// test/adminAudit.test.ts
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
import AdminActionLog from "../src/models/AdminActionLog.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/v1/auth", authRoutes);
app.use("/v1/admin", adminRoutes);

let superAdminToken: string;
let superAdminId: string;

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
  const superAdmin = await createSuperAdmin();
  superAdminId = superAdmin._id.toString();

  const loginRes = await request(app).post("/v1/auth/login").send({
    email: "superadmin@test.com",
    password: "SuperPass123!",
  });
  superAdminToken = loginRes.body.accessToken;
});

describe("Admin Audit Logs", () => {
  describe("GET /v1/admin/audit", () => {
    it("should return audit logs with default pagination", async () => {
      // Create some audit entries
      for (let i = 0; i < 5; i++) {
        await (AdminActionLog as any).create({
          actorId: superAdminId,
          actorEmail: "superadmin@test.com",
          action: `test.action.${i}`,
          targetType: "Test",
          targetId: `test-${i}`,
          ip: "127.0.0.1",
          userAgent: "Test Agent",
        });
      }

      const res = await request(app)
        .get("/v1/admin/audit")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("logs");
      expect(res.body).toHaveProperty("pagination");
      expect(Array.isArray(res.body.logs)).toBe(true);
      expect(res.body.logs.length).toBeGreaterThan(0);

      // Check pagination
      expect(res.body.pagination).toHaveProperty("total");
      expect(res.body.pagination).toHaveProperty("page");
      expect(res.body.pagination).toHaveProperty("limit");
      expect(res.body.pagination).toHaveProperty("pages");
    });

    it("should filter logs by action", async () => {
      await (AdminActionLog as any).create({
        actorId: superAdminId,
        actorEmail: "superadmin@test.com",
        action: "user.create",
        targetType: "User",
        targetId: "user-1",
      });

      await (AdminActionLog as any).create({
        actorId: superAdminId,
        actorEmail: "superadmin@test.com",
        action: "role.create",
        targetType: "Role",
        targetId: "role-1",
      });

      const res = await request(app)
        .get("/v1/admin/audit?action=user.create")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.logs.length).toBeGreaterThan(0);

      // All returned logs should have action 'user.create'
      res.body.logs.forEach((log: any) => {
        expect(log.action).toBe("user.create");
      });
    });

    it("should filter logs by actorEmail", async () => {
      const user1 = await createTestUser("user1@test.com", "pass123", "ADMIN");
      const user2 = await createTestUser("user2@test.com", "pass123", "ADMIN");

      await (AdminActionLog as any).create({
        actorId: user1._id,
        actorEmail: "user1@test.com",
        action: "test.action",
      });

      await (AdminActionLog as any).create({
        actorId: user2._id,
        actorEmail: "user2@test.com",
        action: "test.action",
      });

      const res = await request(app)
        .get("/v1/admin/audit?actorEmail=user1")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      res.body.logs.forEach((log: any) => {
        expect(log.actorEmail).toContain("user1");
      });
    });

    it("should filter logs by targetType", async () => {
      await (AdminActionLog as any).create({
        actorId: superAdminId,
        actorEmail: "superadmin@test.com",
        action: "user.create",
        targetType: "User",
        targetId: "user-1",
      });

      await (AdminActionLog as any).create({
        actorId: superAdminId,
        actorEmail: "superadmin@test.com",
        action: "role.create",
        targetType: "Role",
        targetId: "role-1",
      });

      const res = await request(app)
        .get("/v1/admin/audit?targetType=User")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      res.body.logs.forEach((log: any) => {
        expect(log.targetType).toBe("User");
      });
    });

    it("should support pagination", async () => {
      // Create 15 audit entries
      for (let i = 0; i < 15; i++) {
        await (AdminActionLog as any).create({
          actorId: superAdminId,
          actorEmail: "superadmin@test.com",
          action: `test.action.${i}`,
        });
      }

      // Get first page
      const page1 = await request(app)
        .get("/v1/admin/audit?page=1&limit=5")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(page1.status).toBe(200);
      expect(page1.body.logs.length).toBeLessThanOrEqual(5);
      expect(page1.body.pagination.page).toBe(1);
      expect(page1.body.pagination.limit).toBe(5);

      // Get second page
      const page2 = await request(app)
        .get("/v1/admin/audit?page=2&limit=5")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(page2.status).toBe(200);
      expect(page2.body.pagination.page).toBe(2);

      // Logs should be different
      const page1Ids = page1.body.logs.map((l: any) => l._id);
      const page2Ids = page2.body.logs.map((l: any) => l._id);
      expect(page1Ids).not.toEqual(page2Ids);
    });

    it("should enforce maximum limit of 100", async () => {
      const res = await request(app)
        .get("/v1/admin/audit?limit=999")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.pagination.limit).toBeLessThanOrEqual(100);
    });

    it("should filter logs by date range", async () => {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      await (AdminActionLog as any).create({
        actorId: superAdminId,
        actorEmail: "superadmin@test.com",
        action: "old.action",
        createdAt: yesterday,
      });

      await (AdminActionLog as any).create({
        actorId: superAdminId,
        actorEmail: "superadmin@test.com",
        action: "new.action",
        createdAt: now,
      });

      const res = await request(app)
        .get(`/v1/admin/audit?startDate=${now.toISOString()}`)
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      res.body.logs.forEach((log: any) => {
        const logDate = new Date(log.createdAt);
        expect(logDate.getTime()).toBeGreaterThanOrEqual(now.getTime() - 1000); // Allow 1s tolerance
      });
    });

    it("should return logs in descending order (most recent first)", async () => {
      for (let i = 0; i < 5; i++) {
        await (AdminActionLog as any).create({
          actorId: superAdminId,
          actorEmail: "superadmin@test.com",
          action: `test.action.${i}`,
          createdAt: new Date(Date.now() + i * 1000),
        });
      }

      const res = await request(app)
        .get("/v1/admin/audit")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      const logs = res.body.logs;

      for (let i = 0; i < logs.length - 1; i++) {
        const current = new Date(logs[i].createdAt).getTime();
        const next = new Date(logs[i + 1].createdAt).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });

    it("should include IP and userAgent in logs", async () => {
      await (AdminActionLog as any).create({
        actorId: superAdminId,
        actorEmail: "superadmin@test.com",
        action: "test.action",
        ip: "192.168.1.100",
        userAgent: "Mozilla/5.0...",
      });

      const res = await request(app)
        .get("/v1/admin/audit")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      const log = res.body.logs.find((l: any) => l.action === "test.action");
      expect(log).toBeDefined();
      expect(log.ip).toBe("192.168.1.100");
      expect(log.userAgent).toBe("Mozilla/5.0...");
    });

    it("should populate actor information", async () => {
      await (AdminActionLog as any).create({
        actorId: superAdminId,
        actorEmail: "superadmin@test.com",
        action: "test.action",
      });

      const res = await request(app)
        .get("/v1/admin/audit")
        .set("Authorization", `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      const log = res.body.logs[0];
      expect(log).toHaveProperty("actorId");

      // Should populate actor details if available
      if (log.actorId && typeof log.actorId === "object") {
        expect(log.actorId).toHaveProperty("email");
      }
    });

    it("should reject unauthorized requests", async () => {
      const res = await request(app).get("/v1/admin/audit");

      expect(res.status).toBe(401);
    });

    it("should reject non-super-admin users", async () => {
      await createTestUser("user@test.com", "pass123", "USER");

      const loginRes = await request(app).post("/v1/auth/login").send({
        email: "user@test.com",
        password: "pass123",
      });

      const userToken = loginRes.body.accessToken;

      const res = await request(app)
        .get("/v1/admin/audit")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });
});

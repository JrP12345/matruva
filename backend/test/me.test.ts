// test/me.test.ts
import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
} from "@jest/globals";
import request from "supertest";
import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "../src/routes/auth.js";
import { setupDatabase, teardownDatabase, clearDatabase } from "./setup.js";
import User from "../src/models/User.js";
import Role from "../src/models/Role.js";
import { hashPassword } from "../src/helpers/authHelpers.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/v1/auth", authRoutes);

async function seedRoles() {
  await Role.create({
    name: "USER",
    label: "User",
    permissions: ["read:own_profile", "update:own_profile"],
  });

  await Role.create({
    name: "ADMIN",
    label: "Admin",
    permissions: [
      "read:own_profile",
      "update:own_profile",
      "read:users",
      "manage:users",
    ],
  });

  await Role.create({
    name: "SUPER_ADMIN",
    label: "Super Admin",
    permissions: ["*"],
  });
}

beforeAll(async () => {
  await setupDatabase();
  await seedRoles();
});

afterAll(async () => {
  await teardownDatabase();
});

afterEach(async () => {
  // Clear only users, keep roles
  await User.deleteMany({});
});

describe("GET /v1/auth/me", () => {
  it("should return 401 if no token provided", async () => {
    const res = await request(app).get("/v1/auth/me");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  it("should return 401 if invalid token provided", async () => {
    const res = await request(app)
      .get("/v1/auth/me")
      .set("Authorization", "Bearer invalid-token");
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  it("should return user info and permissions for authenticated user", async () => {
    // Register and login
    const registerRes = await request(app).post("/v1/auth/register").send({
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
    });
    expect(registerRes.status).toBe(201);

    const loginRes = await request(app).post("/v1/auth/login").send({
      email: "john@example.com",
      password: "password123",
    });
    expect(loginRes.status).toBe(200);
    const accessToken = loginRes.body.accessToken;

    // Call /me endpoint
    const meRes = await request(app)
      .get("/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body).toHaveProperty("user");
    expect(meRes.body).toHaveProperty("permissions");

    // Check user object
    expect(meRes.body.user).toMatchObject({
      name: "John Doe",
      email: "john@example.com",
      role: "USER",
      twoFactorEnabled: false,
    });
    expect(meRes.body.user).toHaveProperty("_id");
    expect(meRes.body.user).not.toHaveProperty("passwordHash");
    expect(meRes.body.user).not.toHaveProperty("refreshSessions");

    // Check permissions
    expect(meRes.body.permissions).toBeInstanceOf(Array);
    expect(meRes.body.permissions).toContain("read:own_profile");
    expect(meRes.body.permissions).toContain("update:own_profile");
  });

  it("should return admin permissions for admin user", async () => {
    // Create admin user directly
    const passwordHash = await hashPassword("admin123");
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      passwordHash,
      role: "ADMIN",
      refreshSessions: [],
    });

    // Login as admin
    const loginRes = await request(app).post("/v1/auth/login").send({
      email: "admin@example.com",
      password: "admin123",
    });
    expect(loginRes.status).toBe(200);
    const accessToken = loginRes.body.accessToken;

    // Call /me endpoint
    const meRes = await request(app)
      .get("/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.role).toBe("ADMIN");
    expect(meRes.body.permissions).toContain("read:users");
    expect(meRes.body.permissions).toContain("manage:users");
  });

  it("should merge role permissions with user extraPermissions", async () => {
    // Create user with extra permissions
    const passwordHash = await hashPassword("password123");
    await User.create({
      name: "Special User",
      email: "special@example.com",
      passwordHash,
      role: "USER",
      extraPermissions: ["special:feature", "beta:access"],
      refreshSessions: [],
    });

    // Login
    const loginRes = await request(app).post("/v1/auth/login").send({
      email: "special@example.com",
      password: "password123",
    });
    expect(loginRes.status).toBe(200);
    const accessToken = loginRes.body.accessToken;

    // Call /me endpoint
    const meRes = await request(app)
      .get("/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(meRes.status).toBe(200);

    // Should have role permissions
    expect(meRes.body.permissions).toContain("read:own_profile");
    expect(meRes.body.permissions).toContain("update:own_profile");

    // Should have extra permissions
    expect(meRes.body.permissions).toContain("special:feature");
    expect(meRes.body.permissions).toContain("beta:access");

    // Should be deduplicated (no duplicates)
    const uniquePerms = [...new Set(meRes.body.permissions)];
    expect(meRes.body.permissions.length).toBe(uniquePerms.length);
  });

  it("should reflect role changes after cache TTL", async () => {
    // Create user
    const passwordHash = await hashPassword("password123");
    const user = await User.create({
      name: "Test User",
      email: "test@example.com",
      passwordHash,
      role: "USER",
      refreshSessions: [],
    });

    // Login
    const loginRes = await request(app).post("/v1/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });
    expect(loginRes.status).toBe(200);
    const accessToken = loginRes.body.accessToken;

    // Call /me endpoint - should have USER permissions
    const meRes1 = await request(app)
      .get("/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(meRes1.status).toBe(200);
    expect(meRes1.body.user.role).toBe("USER");

    // Update user role to ADMIN
    await User.findByIdAndUpdate(user._id, { role: "ADMIN" });

    // Note: Since we don't have caching yet, this should reflect immediately
    // In production with caching, there would be a TTL delay
    const meRes2 = await request(app)
      .get("/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(meRes2.status).toBe(200);
    expect(meRes2.body.user.role).toBe("ADMIN");
    expect(meRes2.body.permissions).toContain("read:users");
  });

  it("should return 404 if user is deleted after token issued", async () => {
    // Register and login
    const registerRes = await request(app).post("/v1/auth/register").send({
      name: "Temp User",
      email: "temp@example.com",
      password: "password123",
    });
    expect(registerRes.status).toBe(201);

    const loginRes = await request(app).post("/v1/auth/login").send({
      email: "temp@example.com",
      password: "password123",
    });
    expect(loginRes.status).toBe(200);
    const accessToken = loginRes.body.accessToken;

    // Delete user
    await User.deleteOne({ email: "temp@example.com" });

    // Call /me endpoint - should fail
    const meRes = await request(app)
      .get("/v1/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(meRes.status).toBe(404);
    expect(meRes.body).toHaveProperty("error", "User not found");
  });

  it("should work with token from cookie", async () => {
    // Register and login
    await request(app).post("/v1/auth/register").send({
      name: "Cookie User",
      email: "cookie@example.com",
      password: "password123",
    });

    const loginRes = await request(app).post("/v1/auth/login").send({
      email: "cookie@example.com",
      password: "password123",
    });
    expect(loginRes.status).toBe(200);

    // Extract cookie from login response
    const cookies = loginRes.headers["set-cookie"];
    expect(cookies).toBeDefined();

    // Call /me endpoint with cookie
    const meRes = await request(app).get("/v1/auth/me").set("Cookie", cookies);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe("cookie@example.com");
  });
});

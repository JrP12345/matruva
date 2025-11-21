// test/auth.test.ts
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
import jwt from "jsonwebtoken";
import authRoutes from "../src/routes/auth.js";
import {
  setupDatabase,
  teardownDatabase,
  clearDatabase,
  seedBasicData,
  extractCookie,
  wait,
  testKeys,
} from "./setup.js";
import { verifyAccessToken, verifyRefreshToken } from "../src/helpers/jwt.js";
import User from "../src/models/User.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/v1/auth", authRoutes);

describe("Authentication E2E Tests", () => {
  beforeAll(async () => {
    await setupDatabase();
  });

  afterAll(async () => {
    await teardownDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
    await seedBasicData();
  });

  describe("User Registration", () => {
    it("should register a new user successfully", async () => {
      const response = await request(app).post("/v1/auth/register").send({
        email: "newuser@test.com",
        password: "SecurePass123!",
        name: "New User",
      });

      expect(response.status).toBe(201);
      expect(response.body.email).toBe("newuser@test.com");
      expect(response.body.name).toBe("New User");

      // Verify user created in database
      const user = await (User as any).findOne({ email: "newuser@test.com" });
      expect(user).not.toBeNull();
      expect(user.name).toBe("New User");
      expect(user.role).toBe("USER");
    });

    it("should reject duplicate email registration", async () => {
      await request(app).post("/v1/auth/register").send({
        email: "duplicate@test.com",
        password: "Pass123!",
        name: "First User",
      });

      const response = await request(app).post("/v1/auth/register").send({
        email: "duplicate@test.com",
        password: "Pass123!",
        name: "Second User",
      });

      expect(response.status).toBe(409);
      expect(response.body.error).toContain("already registered");
    });

    it("should require all fields", async () => {
      const response = await request(app).post("/v1/auth/register").send({
        email: "incomplete@test.com",
        // Missing password and name
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain("Missing");
    });
  });

  describe("User Login", () => {
    beforeEach(async () => {
      await request(app).post("/v1/auth/register").send({
        email: "logintest@test.com",
        password: "LoginPass123!",
        name: "Login Test User",
      });
    });

    it("should login successfully and set cookies", async () => {
      const response = await request(app).post("/v1/auth/login").send({
        email: "logintest@test.com",
        password: "LoginPass123!",
      });

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();
      expect(response.body.user).toBeDefined();

      // Check cookies
      const accessToken = extractCookie(response.headers, "access_token");
      const refreshToken = extractCookie(response.headers, "refresh_token");

      expect(accessToken).not.toBeNull();
      expect(refreshToken).not.toBeNull();

      // Verify access token structure
      const decoded: any = jwt.decode(accessToken!, { complete: true });
      expect(decoded.header.kid).toBeDefined();
      expect(decoded.header.alg).toBe("RS256");
      expect(decoded.payload.sub).toBeDefined(); // JWT standard uses 'sub' for user ID
      expect(decoded.payload.role).toBe("USER");
    });

    it("should reject invalid credentials", async () => {
      const response = await request(app).post("/v1/auth/login").send({
        email: "logintest@test.com",
        password: "WrongPassword!",
      });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain("Invalid");
    });

    it("should reject login for non-existent user", async () => {
      const response = await request(app).post("/v1/auth/login").send({
        email: "nonexistent@test.com",
        password: "AnyPassword123!",
      });

      expect(response.status).toBe(401);
    });
  });

  describe("Token Refresh", () => {
    let refreshToken: string;
    let userId: string;

    beforeEach(async () => {
      await request(app).post("/v1/auth/register").send({
        email: "refreshtest@test.com",
        password: "RefreshPass123!",
        name: "Refresh Test User",
      });

      const loginResponse = await request(app).post("/v1/auth/login").send({
        email: "refreshtest@test.com",
        password: "RefreshPass123!",
      });

      refreshToken = extractCookie(loginResponse.headers, "refresh_token")!;

      const decoded: any = jwt.decode(refreshToken);
      userId = decoded.userId;
    });

    it("should refresh access token with valid refresh token", async () => {
      const response = await request(app)
        .post("/v1/auth/refresh")
        .set("Cookie", `refresh_token=${refreshToken}`)
        .set("X-Auth-Refresh", "1");

      expect(response.status).toBe(200);
      expect(response.body.accessToken).toBeDefined();

      const newAccessToken = extractCookie(response.headers, "access_token");
      const newRefreshToken = extractCookie(response.headers, "refresh_token");

      expect(newAccessToken).not.toBeNull();
      expect(newRefreshToken).not.toBeNull();
      expect(newRefreshToken).not.toBe(refreshToken); // Token rotation
    });

    it("should detect and invalidate reused refresh tokens", async () => {
      // First refresh - should succeed
      const firstRefresh = await request(app)
        .post("/v1/auth/refresh")
        .set("Cookie", `refresh_token=${refreshToken}`)
        .set("X-Auth-Refresh", "1");

      expect(firstRefresh.status).toBe(200);

      // Try to reuse old refresh token - should fail (token is no longer in database)
      const reuseAttempt = await request(app)
        .post("/v1/auth/refresh")
        .set("Cookie", `refresh_token=${refreshToken}`)
        .set("X-Auth-Refresh", "1");

      expect(reuseAttempt.status).toBe(401);
      expect(reuseAttempt.body.error).toContain("Invalid session");
    });

    it("should reject tampered refresh token", async () => {
      const tamperedToken = refreshToken.slice(0, -5) + "XXXXX";

      const response = await request(app)
        .post("/v1/auth/refresh")
        .set("Cookie", `refresh_token=${tamperedToken}`)
        .set("X-Auth-Refresh", "1");

      expect(response.status).toBe(401);
    });
  });

  describe("Logout", () => {
    let accessToken: string;
    let refreshToken: string;

    beforeEach(async () => {
      await request(app).post("/v1/auth/register").send({
        email: "logouttest@test.com",
        password: "LogoutPass123!",
        name: "Logout Test User",
      });

      const loginResponse = await request(app).post("/v1/auth/login").send({
        email: "logouttest@test.com",
        password: "LogoutPass123!",
      });

      accessToken = extractCookie(loginResponse.headers, "access_token")!;
      refreshToken = extractCookie(loginResponse.headers, "refresh_token")!;
    });

    it("should logout successfully and clear cookies", async () => {
      const response = await request(app)
        .post("/v1/auth/logout")
        .set(
          "Cookie",
          `access_token=${accessToken}; refresh_token=${refreshToken}`
        );

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
    });

    it("should remove refresh session from database", async () => {
      const decoded: any = jwt.decode(refreshToken);
      const userId = decoded.sub; // JWT standard uses 'sub' for subject (user ID)

      await request(app)
        .post("/v1/auth/logout")
        .set(
          "Cookie",
          `access_token=${accessToken}; refresh_token=${refreshToken}`
        );

      const user = await (User as any).findById(userId);
      expect(user.refreshSessions).toHaveLength(0);
    });
  });

  describe("JWT Signature Verification with Kid", () => {
    let accessToken: string;

    beforeEach(async () => {
      await request(app).post("/v1/auth/register").send({
        email: "jwttest@test.com",
        password: "JwtPass123!",
        name: "JWT Test User",
      });

      const loginResponse = await request(app).post("/v1/auth/login").send({
        email: "jwttest@test.com",
        password: "JwtPass123!",
      });

      accessToken = extractCookie(loginResponse.headers, "access_token")!;
    });

    it("should verify token with correct kid and public key", async () => {
      const result = await verifyAccessToken(accessToken);

      expect(result).not.toBeNull();
      expect(result.sub).toBeDefined(); // JWT standard uses 'sub' for user ID
      expect(result.role).toBe("USER");
    });

    it("should include kid in token header", async () => {
      const decoded: any = jwt.decode(accessToken, { complete: true });

      expect(decoded.header.kid).toBeDefined();
      expect(decoded.header.alg).toBe("RS256");
      expect(decoded.header.typ).toBe("JWT");
    });

    it("should reject token with invalid signature", async () => {
      const tamperedToken = accessToken.slice(0, -10) + "XXXXXXXXXX";

      const result = await verifyAccessToken(tamperedToken);

      expect(result).toBeNull(); // Returns null on verification failure
    });
  });

  describe("Short Access Token TTL Behavior", () => {
    it("should accept valid non-expired access token", async () => {
      await request(app).post("/v1/auth/register").send({
        email: "ttltest@test.com",
        password: "TtlPass123!",
        name: "TTL Test User",
      });

      const loginResponse = await request(app).post("/v1/auth/login").send({
        email: "ttltest@test.com",
        password: "TtlPass123!",
      });

      const accessToken = extractCookie(loginResponse.headers, "access_token")!;

      // Verify token is valid immediately
      const result = await verifyAccessToken(accessToken);
      expect(result).not.toBeNull(); // Returns payload on success
    });

    it("should show token expiration time in payload", async () => {
      await request(app).post("/v1/auth/register").send({
        email: "exptest@test.com",
        password: "ExpPass123!",
        name: "Exp Test User",
      });

      const loginResponse = await request(app).post("/v1/auth/login").send({
        email: "exptest@test.com",
        password: "ExpPass123!",
      });

      const accessToken = extractCookie(loginResponse.headers, "access_token")!;
      const decoded: any = jwt.decode(accessToken);

      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();

      // Access token should expire after configured time (e.g., 15 minutes)
      const ttl = decoded.exp - decoded.iat;
      expect(ttl).toBeLessThanOrEqual(15 * 60); // 15 minutes max
    });
  });
});

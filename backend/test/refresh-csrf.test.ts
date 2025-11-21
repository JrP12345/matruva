// test/refresh-csrf.test.ts
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
import authRoutes from "../src/routes/auth.js";
import {
  setupDatabase,
  teardownDatabase,
  clearDatabase,
  seedBasicData,
  extractCookie,
} from "./setup.js";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use("/v1/auth", authRoutes);

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
});

describe("CSRF Protection on POST /v1/auth/refresh", () => {
  it("should reject refresh request without X-Auth-Refresh header", async () => {
    // Register and login to get tokens
    await request(app).post("/v1/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    const loginRes = await request(app).post("/v1/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    const refreshCookie = extractCookie(loginRes.headers, "refresh_token");
    expect(refreshCookie).toBeDefined();

    // Attempt refresh without X-Auth-Refresh header
    const refreshRes = await request(app)
      .post("/v1/auth/refresh")
      .set("Cookie", `refresh_token=${refreshCookie}`);

    expect(refreshRes.status).toBe(403);
    expect(refreshRes.body).toHaveProperty("error");
    expect(refreshRes.body.error).toContain("X-Auth-Refresh");
  });

  it("should reject refresh request with invalid X-Auth-Refresh header value", async () => {
    // Register and login to get tokens
    await request(app).post("/v1/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    const loginRes = await request(app).post("/v1/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    const refreshCookie = extractCookie(loginRes.headers, "refresh_token");

    // Attempt refresh with wrong header value
    const refreshRes = await request(app)
      .post("/v1/auth/refresh")
      .set("Cookie", `refresh_token=${refreshCookie}`)
      .set("X-Auth-Refresh", "wrong-value");

    expect(refreshRes.status).toBe(403);
    expect(refreshRes.body).toHaveProperty("error");
  });

  it("should accept refresh request with valid X-Auth-Refresh header", async () => {
    // Register and login to get tokens
    await request(app).post("/v1/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    const loginRes = await request(app).post("/v1/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    const refreshCookie = extractCookie(loginRes.headers, "refresh_token");

    // Attempt refresh with correct header
    const refreshRes = await request(app)
      .post("/v1/auth/refresh")
      .set("Cookie", `refresh_token=${refreshCookie}`)
      .set("X-Auth-Refresh", "1");

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body).toHaveProperty("accessToken");
  });

  it("should rotate tokens successfully with valid CSRF header", async () => {
    // Register and login
    await request(app).post("/v1/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    const loginRes = await request(app).post("/v1/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    const oldRefreshCookie = extractCookie(loginRes.headers, "refresh_token");
    const oldAccessToken = loginRes.body.accessToken;

    // Refresh tokens
    const refreshRes = await request(app)
      .post("/v1/auth/refresh")
      .set("Cookie", `refresh_token=${oldRefreshCookie}`)
      .set("X-Auth-Refresh", "1");

    expect(refreshRes.status).toBe(200);
    const newAccessToken = refreshRes.body.accessToken;
    const newRefreshCookie = extractCookie(refreshRes.headers, "refresh_token");

    // Verify new tokens are different
    expect(newAccessToken).toBeDefined();
    expect(newAccessToken).not.toBe(oldAccessToken);
    expect(newRefreshCookie).toBeDefined();
    expect(newRefreshCookie).not.toBe(oldRefreshCookie);

    // Old refresh token should no longer work (even with CSRF header)
    const replayRes = await request(app)
      .post("/v1/auth/refresh")
      .set("Cookie", `refresh_token=${oldRefreshCookie}`)
      .set("X-Auth-Refresh", "1");

    expect(replayRes.status).toBe(401);
  });

  it("should prevent CSRF attacks via simple form submission", async () => {
    // This test demonstrates that a simple form POST from a malicious site
    // would fail because it can't set custom headers

    await request(app).post("/v1/auth/register").send({
      name: "Victim",
      email: "victim@example.com",
      password: "password123",
    });

    const loginRes = await request(app).post("/v1/auth/login").send({
      email: "victim@example.com",
      password: "password123",
    });

    const refreshCookie = extractCookie(loginRes.headers, "refresh_token");

    // Simulate a CSRF attack: cookie is sent but no custom header
    // (browsers send cookies automatically but can't set custom headers via form)
    const csrfAttempt = await request(app)
      .post("/v1/auth/refresh")
      .set("Cookie", `refresh_token=${refreshCookie}`)
      .send({}); // Form data, but no X-Auth-Refresh header

    expect(csrfAttempt.status).toBe(403);
    expect(csrfAttempt.body.error).toContain("X-Auth-Refresh");
  });

  it("should still require valid refresh token even with CSRF header", async () => {
    // With correct CSRF header but invalid token
    const invalidRefreshRes = await request(app)
      .post("/v1/auth/refresh")
      .set("Cookie", "refresh_token=invalid-token")
      .set("X-Auth-Refresh", "1");

    expect(invalidRefreshRes.status).toBe(401);
  });

  it("should still require valid refresh token even with CSRF header (no cookie)", async () => {
    // With correct CSRF header but no cookie
    const noCookieRes = await request(app)
      .post("/v1/auth/refresh")
      .set("X-Auth-Refresh", "1");

    expect(noCookieRes.status).toBe(401);
    expect(noCookieRes.body.error).toContain("No refresh token");
  });
});

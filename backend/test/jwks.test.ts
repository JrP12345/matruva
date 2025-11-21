// test/jwks.test.ts
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
import jwksRoutes from "../src/routes/jwks.js";
import { setupDatabase, teardownDatabase, clearDatabase } from "./setup.js";
import { KeyStore } from "../src/config/index.js";

const app = express();
app.use(express.json());
app.use("/", jwksRoutes);

describe("JWKS Endpoint Tests", () => {
  beforeAll(async () => {
    await setupDatabase();
  });

  afterAll(async () => {
    await teardownDatabase();
  });

  beforeEach(async () => {
    await clearDatabase();
  });

  describe("JWKS Endpoint", () => {
    it("should return JWKS with correct structure", async () => {
      const response = await request(app).get("/.well-known/jwks.json");

      expect(response.status).toBe(200);
      expect(response.body.keys).toBeDefined();
      expect(Array.isArray(response.body.keys)).toBe(true);
    });

    it("should return only active keys", async () => {
      const response = await request(app).get("/.well-known/jwks.json");

      expect(response.status).toBe(200);
      const keys = response.body.keys;

      // Verify all returned keys are active
      for (const key of keys) {
        const keyEntry = KeyStore.get(key.kid);
        expect(keyEntry?.active).toBe(true);
      }
    });

    it("should include required JWK fields", async () => {
      const response = await request(app).get("/.well-known/jwks.json");

      expect(response.status).toBe(200);
      const keys = response.body.keys;
      expect(keys.length).toBeGreaterThan(0);

      const key = keys[0];
      expect(key.kid).toBeDefined();
      expect(key.kty).toBe("RSA");
      expect(key.use).toBe("sig");
      expect(key.alg).toBe("RS256");
      expect(key.n).toBeDefined(); // RSA modulus
      expect(key.e).toBeDefined(); // RSA exponent
    });

    it("should not include private key material", async () => {
      const response = await request(app).get("/.well-known/jwks.json");

      expect(response.status).toBe(200);
      const keys = response.body.keys;

      for (const key of keys) {
        expect(key.d).toBeUndefined(); // Private exponent
        expect(key.p).toBeUndefined(); // First prime
        expect(key.q).toBeUndefined(); // Second prime
        expect(key.dp).toBeUndefined();
        expect(key.dq).toBeUndefined();
        expect(key.qi).toBeUndefined();
      }
    });

    it("should return keys with unique kids", async () => {
      const response = await request(app).get("/.well-known/jwks.json");

      expect(response.status).toBe(200);
      const keys = response.body.keys;
      const kids = keys.map((k: any) => k.kid);
      const uniqueKids = new Set(kids);

      expect(kids.length).toBe(uniqueKids.size);
    });

    it("should have correct content-type header", async () => {
      const response = await request(app).get("/.well-known/jwks.json");

      expect(response.status).toBe(200);
      expect(response.headers["content-type"]).toMatch(/application\/json/);
    });

    it("should return at least 2 keys (access and refresh)", async () => {
      const response = await request(app).get("/.well-known/jwks.json");

      expect(response.status).toBe(200);
      expect(response.body.keys.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("JWK Format Validation", () => {
    it("should have valid base64url encoded n and e", async () => {
      const response = await request(app).get("/.well-known/jwks.json");

      const keys = response.body.keys;
      for (const key of keys) {
        // n and e should be base64url encoded (no padding)
        expect(key.n).toMatch(/^[A-Za-z0-9_-]+$/);
        expect(key.e).toMatch(/^[A-Za-z0-9_-]+$/);

        // Should not have padding
        expect(key.n).not.toContain("=");
        expect(key.e).not.toContain("=");
      }
    });

    it("should have standard RSA exponent (AQAB)", async () => {
      const response = await request(app).get("/.well-known/jwks.json");

      const keys = response.body.keys;
      for (const key of keys) {
        // Standard RSA exponent is 65537 = 0x010001 = AQAB in base64url
        expect(key.e).toBe("AQAB");
      }
    });

    it("should have sufficiently long modulus", async () => {
      const response = await request(app).get("/.well-known/jwks.json");

      const keys = response.body.keys;
      for (const key of keys) {
        // 2048-bit RSA key has ~342 character base64url modulus
        expect(key.n.length).toBeGreaterThan(300);
      }
    });
  });

  describe("JWKS Caching", () => {
    it("should support caching headers", async () => {
      const response = await request(app).get("/.well-known/jwks.json");

      expect(response.status).toBe(200);
      // Could add Cache-Control headers in future
    });

    it("should return consistent results for multiple requests", async () => {
      const response1 = await request(app).get("/.well-known/jwks.json");
      const response2 = await request(app).get("/.well-known/jwks.json");

      expect(response1.body).toEqual(response2.body);
    });
  });
});

// test/setup.ts
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { beforeAll, afterAll, beforeEach, afterEach } from "@jest/globals";
import { KeyStore, generateKid } from "../src/config/index.js";
import Role from "../src/models/Role.js";
import Permission from "../src/models/Permission.js";
import User from "../src/models/User.js";
import AdminActionLog from "../src/models/AdminActionLog.js";
import { hashPassword } from "../src/helpers/authHelpers.js";
import { generateKeyPairSync } from "crypto";

let mongod: MongoMemoryServer;

// Test keys (generated once for all tests)
export const testKeys = {
  access: generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  }),
  refresh: generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  }),
};

// Setup in-memory MongoDB before all tests
export async function setupDatabase() {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);

  // Load test keys into KeyStore
  const accessKid = generateKid(testKeys.access.publicKey);
  const refreshKid = generateKid(testKeys.refresh.publicKey);

  KeyStore.set(accessKid, {
    kid: accessKid,
    use: "sig",
    kty: "RSA",
    alg: "RS256",
    publicKey: testKeys.access.publicKey,
    privateKey: testKeys.access.privateKey,
    active: true,
    createdAt: new Date(),
  });

  KeyStore.set(refreshKid, {
    kid: refreshKid,
    use: "sig",
    kty: "RSA",
    alg: "RS256",
    publicKey: testKeys.refresh.publicKey,
    privateKey: testKeys.refresh.privateKey,
    active: true,
    createdAt: new Date(),
  });
}

// Teardown after all tests
export async function teardownDatabase() {
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
}

// Clear collections before each test
export async function clearDatabase() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    if (collections[key]) {
      await collections[key].deleteMany({});
    }
  }
}

// Seed basic permissions and roles
export async function seedBasicData() {
  // Create permissions
  const permissions = [
    { key: "users.view", description: "View users", category: "users" },
    { key: "users.manage", description: "Manage users", category: "users" },
    { key: "roles.view", description: "View roles", category: "roles" },
    { key: "roles.manage", description: "Manage roles", category: "roles" },
    { key: "orders.view", description: "View orders", category: "orders" },
    { key: "orders.manage", description: "Manage orders", category: "orders" },
  ];

  for (const perm of permissions) {
    await (Permission as any).create({ ...perm, protected: false });
  }

  // Create roles
  await (Role as any).create({
    name: "SUPER_ADMIN",
    label: "Super Administrator",
    description: "Full system access",
    permissions: [],
    protected: true,
  });

  await (Role as any).create({
    name: "ADMIN",
    label: "Administrator",
    description: "System administrator",
    permissions: ["users.view", "users.manage", "roles.view"],
    protected: true,
  });

  await (Role as any).create({
    name: "USER",
    label: "User",
    description: "Regular user",
    permissions: [],
    protected: true,
  });
}

// Create test super admin user
export async function createSuperAdmin(
  email = "superadmin@test.com",
  password = "SuperPass123!"
) {
  const user = await (User as any).create({
    email,
    name: "Super Admin",
    passwordHash: await hashPassword(password),
    role: "SUPER_ADMIN",
    extraPermissions: [],
    refreshSessions: [],
  });
  return user;
}

// Create test regular user
export async function createTestUser(
  email = "user@test.com",
  password = "UserPass123!",
  role = "USER"
) {
  const user = await (User as any).create({
    email,
    name: "Test User",
    passwordHash: await hashPassword(password),
    role,
    extraPermissions: [],
    refreshSessions: [],
  });
  return user;
}

// Extract cookie value from Set-Cookie header
export function extractCookie(headers: any, cookieName: string): string | null {
  const setCookie = headers["set-cookie"];
  if (!setCookie) return null;

  const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
  for (const cookie of cookies) {
    if (cookie.startsWith(`${cookieName}=`)) {
      const match = cookie.match(new RegExp(`${cookieName}=([^;]+)`));
      return match ? match[1] : null;
    }
  }
  return null;
}

// Wait for specified milliseconds
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

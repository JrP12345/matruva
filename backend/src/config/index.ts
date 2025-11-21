// src/config/index.ts
import { readFileSync } from "fs";
import { join } from "path";
import { createHash } from "crypto";

export const NODE_ENV = process.env.NODE_ENV || "development";
export const PORT = parseInt(process.env.PORT || "4000", 10);

export const DATABASE_URI = process.env.DATABASE_URI || "";

// RSA Keys for RS256 algorithm
function loadKey(envVar: string, defaultPath: string): string {
  const keyPath = process.env[envVar] || defaultPath;
  try {
    return readFileSync(join(process.cwd(), keyPath), "utf-8");
  } catch (error) {
    throw new Error(
      `Failed to load key from ${keyPath}. Make sure to generate keys first using 'npm run generate-keys'`
    );
  }
}

const accessPrivateKey = loadKey(
  "JWT_ACCESS_PRIVATE_KEY",
  "./keys/access-private.pem"
);
const accessPublicKey = loadKey(
  "JWT_ACCESS_PUBLIC_KEY",
  "./keys/access-public.pem"
);
const refreshPrivateKey = loadKey(
  "JWT_REFRESH_PRIVATE_KEY",
  "./keys/refresh-private.pem"
);
const refreshPublicKey = loadKey(
  "JWT_REFRESH_PUBLIC_KEY",
  "./keys/refresh-public.pem"
);

// Generate Key IDs (kid) from public key hash
export function generateKid(publicKey: string): string {
  return createHash("sha256").update(publicKey).digest("hex").slice(0, 16);
}

export const ACCESS_KID = generateKid(accessPublicKey);
export const REFRESH_KID = generateKid(refreshPublicKey);

export interface KeyEntry {
  kid: string;
  use: "sig" | "enc";
  kty: "RSA";
  alg: "RS256";
  publicKey: string;
  privateKey?: string;
  active: boolean;
  createdAt: Date;
}

// In-memory key store (can be replaced with database)
const keyStore = new Map<string, KeyEntry>();

// Initialize with current keys
keyStore.set(ACCESS_KID, {
  kid: ACCESS_KID,
  use: "sig",
  kty: "RSA",
  alg: "RS256",
  publicKey: accessPublicKey,
  privateKey: accessPrivateKey,
  active: true,
  createdAt: new Date(),
});

keyStore.set(REFRESH_KID, {
  kid: REFRESH_KID,
  use: "sig",
  kty: "RSA",
  alg: "RS256",
  publicKey: refreshPublicKey,
  privateKey: refreshPrivateKey,
  active: true,
  createdAt: new Date(),
});

export const KeyStore = {
  get: (kid: string) => keyStore.get(kid),
  set: (kid: string, entry: KeyEntry) => keyStore.set(kid, entry),
  getAll: () => Array.from(keyStore.values()),
  getActive: () => Array.from(keyStore.values()).filter((k) => k.active),
  has: (kid: string) => keyStore.has(kid),
};

export const JWT_ACCESS_PRIVATE_KEY = accessPrivateKey;
export const JWT_ACCESS_PUBLIC_KEY = accessPublicKey;
export const JWT_REFRESH_PRIVATE_KEY = refreshPrivateKey;
export const JWT_REFRESH_PUBLIC_KEY = refreshPublicKey;

export const JWT_ACCESS_EXPIRES = process.env.JWT_ACCESS_EXPIRES || "15m";
export const JWT_REFRESH_EXPIRES_DAYS = parseInt(
  process.env.JWT_REFRESH_EXPIRES_DAYS || "30",
  10
);

export const REFRESH_COOKIE_NAME =
  process.env.REFRESH_COOKIE_NAME || "refresh_token";
export const REFRESH_COOKIE_PATH =
  process.env.REFRESH_COOKIE_PATH || "/v1/auth";

export const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "12", 10);

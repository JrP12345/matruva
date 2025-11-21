// src/helpers/jwt.ts
import jwt from "jsonwebtoken";
import { generateJti } from "./authHelpers.js";
import {
  JWT_ACCESS_PRIVATE_KEY,
  JWT_REFRESH_PRIVATE_KEY,
  JWT_ACCESS_EXPIRES,
  JWT_REFRESH_EXPIRES_DAYS,
  ACCESS_KID,
  REFRESH_KID,
  KeyStore,
} from "../config/index.js";

/**
 * Sign an access token using RS256 with kid in header
 */
export function signAccessToken(payload: Record<string, any>) {
  const jti = generateJti();
  return jwt.sign({ ...payload, jti }, JWT_ACCESS_PRIVATE_KEY, {
    algorithm: "RS256",
    keyid: ACCESS_KID,
    expiresIn: JWT_ACCESS_EXPIRES as any,
  });
}

/**
 * Verify an access token by looking up the public key using kid from token header
 */
export function verifyAccessToken(token: string) {
  try {
    // Decode header to get kid
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded === "string") return null;

    const kid = decoded.header.kid;
    if (!kid) {
      // Fallback: try with current access key if no kid
      const keyEntry = KeyStore.get(ACCESS_KID);
      if (!keyEntry) return null;
      return jwt.verify(token, keyEntry.publicKey, {
        algorithms: ["RS256"],
      }) as any;
    }

    // Look up key by kid
    const keyEntry = KeyStore.get(kid);
    if (!keyEntry) return null;

    return jwt.verify(token, keyEntry.publicKey, {
      algorithms: ["RS256"],
    }) as any;
  } catch {
    return null;
  }
}

/**
 * Sign a refresh token using RS256 with kid in header
 */
export function signRefreshToken(payload: Record<string, any>) {
  const jti = generateJti();
  const token = jwt.sign({ ...payload, jti }, JWT_REFRESH_PRIVATE_KEY, {
    algorithm: "RS256",
    keyid: REFRESH_KID,
    expiresIn: `${JWT_REFRESH_EXPIRES_DAYS}d` as any,
  });
  return { token, jti };
}

/**
 * Verify a refresh token by looking up the public key using kid from token header
 */
export function verifyRefreshToken(token: string) {
  try {
    // Decode header to get kid
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded === "string") return null;

    const kid = decoded.header.kid;
    if (!kid) {
      // Fallback: try with current refresh key if no kid
      const keyEntry = KeyStore.get(REFRESH_KID);
      if (!keyEntry) return null;
      return jwt.verify(token, keyEntry.publicKey, {
        algorithms: ["RS256"],
      }) as any;
    }

    // Look up key by kid
    const keyEntry = KeyStore.get(kid);
    if (!keyEntry) return null;

    return jwt.verify(token, keyEntry.publicKey, {
      algorithms: ["RS256"],
    }) as any;
  } catch {
    return null;
  }
}

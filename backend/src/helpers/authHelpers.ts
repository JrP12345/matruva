// src/helpers/authHelpers.ts
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { SALT_ROUNDS } from "../config/index.js";

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(hash: string, plain: string) {
  return bcrypt.compare(plain, hash);
}

export function generateJti() {
  return uuidv4(); // uuid for jti
}

/** Hash the refresh token (or its jti). Storing hash protects DB leaks.
 * We hash the entire refresh JWT to prevent attackers using DB leaked jti directly.
 */
export async function hashRefreshToken(token: string) {
  return bcrypt.hash(token, SALT_ROUNDS);
}

export async function verifyRefreshTokenHash(hash: string, token: string) {
  return bcrypt.compare(token, hash);
}

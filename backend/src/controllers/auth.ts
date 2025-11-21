// src/controllers/auth.ts
import type { Request, Response } from "express";
import User, { type RefreshSession } from "../models/User.js";
import {
  hashPassword,
  hashRefreshToken,
  verifyRefreshTokenHash,
} from "../helpers/authHelpers.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../helpers/jwt.js";
import {
  REFRESH_COOKIE_NAME,
  REFRESH_COOKIE_PATH,
  JWT_REFRESH_EXPIRES_DAYS,
} from "../config/index.js";
import bcrypt from "bcrypt";
import Role from "../models/Role.js";

function setRefreshCookie(res: Response, token: string) {
  const secure = process.env.NODE_ENV === "production";
  const maxAge = JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000;
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: REFRESH_COOKIE_PATH,
    maxAge,
  });
}

function setAccessCookie(res: Response, token: string) {
  const secure = process.env.NODE_ENV === "production";
  // Access token expires in 15 minutes
  const maxAge = 15 * 60 * 1000;
  res.cookie("access_token", token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    maxAge,
  });
}

// REGISTER
export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Missing fields" });

  const existing = await (User as any).findOne({ email });
  if (existing)
    return res.status(409).json({ error: "Email already registered" });

  const passwordHash = await hashPassword(password);
  const user = await (User as any).create({
    name,
    email,
    passwordHash,
    role: "USER",
    refreshSessions: [],
  });
  return res
    .status(201)
    .json({ id: user._id, email: user.email, name: user.name });
}

// LOGIN
export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing" });

  const user = await (User as any).findOne({ email });
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const accessToken = signAccessToken({
    sub: user._id.toString(),
    role: user.role,
  });

  const { token: refreshToken, jti } = signRefreshToken({
    sub: user._id.toString(),
    role: user.role,
  });
  const tokenHash = await hashRefreshToken(refreshToken);
  const expiresAt = new Date(
    Date.now() + JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000
  );

  user.refreshSessions.push({
    jti,
    tokenHash,
    createdAt: new Date(),
    expiresAt,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });
  user.refreshSessions = user.refreshSessions.filter(
    (rs: RefreshSession) => rs.expiresAt > new Date()
  );
  await user.save();

  setAccessCookie(res, accessToken);
  setRefreshCookie(res, refreshToken);
  return res.json({
    accessToken,
    user: { id: user._id, email: user.email, name: user.name, role: user.role },
  });
}

// REFRESH
export async function refresh(req: Request, res: Response) {
  // CSRF-light protection: require custom header
  const csrfHeader = req.get("X-Auth-Refresh");
  if (!csrfHeader || csrfHeader !== "1") {
    return res
      .status(403)
      .json({ error: "Missing or invalid X-Auth-Refresh header" });
  }

  const token = req.cookies[REFRESH_COOKIE_NAME];
  if (!token) return res.status(401).json({ error: "No refresh token" });

  const payload = verifyRefreshToken(token);
  if (!payload || !payload.jti || !payload.sub)
    return res.status(401).json({ error: "Invalid refresh token" });

  const user = await (User as any).findOne({
    "refreshSessions.jti": payload.jti,
  });
  if (!user) return res.status(401).json({ error: "Invalid session" });

  const entry = user.refreshSessions.find(
    (rs: RefreshSession) => rs.jti === payload.jti
  );
  if (!entry) return res.status(401).json({ error: "Session not found" });

  const valid = await verifyRefreshTokenHash(entry.tokenHash, token);
  if (!valid) {
    // possible replay / compromise: remove this session and force login
    user.refreshSessions = user.refreshSessions.filter(
      (rs: RefreshSession) => rs.jti !== entry.jti
    );
    await user.save();
    return res.status(401).json({ error: "Invalid session (replay detected)" });
  }

  // rotate: remove old, add new
  user.refreshSessions = user.refreshSessions.filter(
    (rs: RefreshSession) => rs.jti !== entry.jti
  );

  const { token: newRefreshToken, jti: newJti } = signRefreshToken({
    sub: user._id.toString(),
    role: user.role,
  });
  const newHash = await hashRefreshToken(newRefreshToken);
  const expiresAt = new Date(
    Date.now() + JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000
  );
  user.refreshSessions.push({
    jti: newJti,
    tokenHash: newHash,
    createdAt: new Date(),
    expiresAt,
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });

  user.refreshSessions = user.refreshSessions.filter(
    (rs: RefreshSession) => rs.expiresAt > new Date()
  );
  await user.save();

  const accessToken = signAccessToken({
    sub: user._id.toString(),
    role: user.role,
  });
  setAccessCookie(res, accessToken);
  setRefreshCookie(res, newRefreshToken);
  return res.json({ accessToken });
}

// LOGOUT
export async function logout(req: Request, res: Response) {
  const token = req.cookies[REFRESH_COOKIE_NAME];
  if (token) {
    const payload = verifyRefreshToken(token);
    if (payload && payload.jti) {
      await (User as any).updateOne(
        { "refreshSessions.jti": payload.jti },
        { $pull: { refreshSessions: { jti: payload.jti } } }
      );
    }
  }

  res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
  res.clearCookie("access_token");
  return res.json({ ok: true });
}

// ME - Get current user info with effective permissions
export async function me(req: Request, res: Response) {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const user = await (User as any)
      .findById(userId)
      .select("-passwordHash -refreshSessions");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch role to get role permissions
    const role = await (Role as any).findOne({ name: user.role });
    const rolePermissions = role?.permissions || [];
    const extraPermissions = user.extraPermissions || [];

    // Merge and deduplicate permissions
    const allPermissions = [
      ...new Set([...rolePermissions, ...extraPermissions]),
    ];

    return res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        twoFactorEnabled: user.twoFactorEnabled || false,
      },
      permissions: allPermissions,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return res.status(500).json({ error: "Failed to get user info" });
  }
}

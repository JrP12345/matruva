// src/routes/adminKeys.ts
import express from "express";
import type { Request, Response } from "express";
import { KeyStore, type KeyEntry } from "../config/index.js";
import {
  requireAuth,
  requireSuperAdmin,
  type AuthRequest,
} from "../middleware/auth.js";
import AdminActionLog from "../models/AdminActionLog.js";
import { createHash } from "crypto";

const router = express.Router();

// All routes require authentication and super admin role
router.use(requireAuth as any);
router.use(requireSuperAdmin as any);

/**
 * GET /admin/keys - List all keys
 */
router.get("/", (req: AuthRequest, res: Response) => {
  try {
    const keys = KeyStore.getAll().map((k) => ({
      kid: k.kid,
      use: k.use,
      kty: k.kty,
      alg: k.alg,
      active: k.active,
      createdAt: k.createdAt,
      // Never expose private keys
      hasPrivateKey: !!k.privateKey,
    }));

    res.json({ keys });
  } catch (error) {
    console.error("List keys error:", error);
    res.status(500).json({ error: "Failed to list keys" });
  }
});

/**
 * POST /admin/keys - Add a new public key
 */
router.post("/", async (req: AuthRequest, res: Response) => {
  try {
    const { publicKey, use, alg = "RS256", privateKey } = req.body;

    if (!publicKey || !use) {
      return res.status(400).json({ error: "publicKey and use are required" });
    }

    if (!["sig", "enc"].includes(use)) {
      return res.status(400).json({ error: "use must be 'sig' or 'enc'" });
    }

    // Generate kid from public key
    const kid = createHash("sha256")
      .update(publicKey)
      .digest("hex")
      .slice(0, 16);

    // Check if key already exists
    if (KeyStore.has(kid)) {
      return res.status(409).json({ error: "Key already exists" });
    }

    const keyEntry: KeyEntry = {
      kid,
      use: use as "sig" | "enc",
      kty: "RSA",
      alg: alg as "RS256",
      publicKey,
      privateKey: privateKey || undefined,
      active: true,
      createdAt: new Date(),
    };

    KeyStore.set(kid, keyEntry);

    // Log the action
    await (AdminActionLog as any).create({
      actorId: req.userId,
      actorEmail: req.user?.email,
      action: "key.add",
      targetType: "Key",
      targetId: kid,
      metadata: { use, alg, hasPrivateKey: !!privateKey },
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.status(201).json({
      message: "Key added successfully",
      kid,
      use: keyEntry.use,
      active: keyEntry.active,
    });
  } catch (error) {
    console.error("Add key error:", error);
    res.status(500).json({ error: "Failed to add key" });
  }
});

/**
 * PATCH /admin/keys/:kid - Update key status (activate/deactivate)
 */
router.patch("/:kid", async (req: AuthRequest, res: Response) => {
  try {
    const { kid } = req.params;
    if (!kid) {
      return res.status(400).json({ error: "kid is required" });
    }

    const { active } = req.body;

    if (typeof active !== "boolean") {
      return res.status(400).json({ error: "active must be a boolean" });
    }

    const keyEntry = KeyStore.get(kid);
    if (!keyEntry) {
      return res.status(404).json({ error: "Key not found" });
    }

    keyEntry.active = active;
    KeyStore.set(kid, keyEntry);

    // Log the action
    await (AdminActionLog as any).create({
      actorId: req.userId,
      actorEmail: req.user?.email,
      action: active ? "key.activate" : "key.deactivate",
      targetType: "Key",
      targetId: kid,
      metadata: { active },
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.json({
      message: `Key ${active ? "activated" : "deactivated"} successfully`,
      kid,
      active: keyEntry.active,
    });
  } catch (error) {
    console.error("Update key error:", error);
    res.status(500).json({ error: "Failed to update key" });
  }
});

/**
 * DELETE /admin/keys/:kid - Remove a key (soft delete by deactivating)
 */
router.delete("/:kid", async (req: AuthRequest, res: Response) => {
  try {
    const { kid } = req.params;
    if (!kid) {
      return res.status(400).json({ error: "kid is required" });
    }

    const keyEntry = KeyStore.get(kid);
    if (!keyEntry) {
      return res.status(404).json({ error: "Key not found" });
    }

    // Deactivate instead of removing
    keyEntry.active = false;
    KeyStore.set(kid, keyEntry);

    // Log the action
    await (AdminActionLog as any).create({
      actorId: req.userId,
      actorEmail: req.user?.email,
      action: "key.delete",
      targetType: "Key",
      targetId: kid,
      metadata: { use: keyEntry.use },
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });

    res.json({ message: "Key deleted successfully", kid });
  } catch (error) {
    console.error("Delete key error:", error);
    res.status(500).json({ error: "Failed to delete key" });
  }
});

export default router;

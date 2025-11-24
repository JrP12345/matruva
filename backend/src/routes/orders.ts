// src/routes/orders.ts
import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrder,
  cancelOrder,
  getAllOrders,
  updateOrder,
} from "../controllers/orders.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { requirePermission } from "../helpers/permissions.js";

const router = express.Router();

// Public/User routes
// POST /v1/orders - Create order (optional auth - allows guest checkout)
router.post("/", optionalAuth, createOrder);

// GET /v1/orders - Get user's orders (requires auth)
router.get("/", requireAuth, getUserOrders);

// GET /v1/orders/:id - Get single order (requires auth or guest token)
router.get("/:id", optionalAuth, getOrder);

// PATCH /v1/orders/:id/cancel - Cancel order (requires auth)
router.patch("/:id/cancel", requireAuth, cancelOrder);

// Admin routes
// GET /v1/admin/orders - List all orders
router.get(
  "/admin/all",
  requireAuth,
  requirePermission("orders:view"),
  getAllOrders
);

// PATCH /v1/admin/orders/:id - Update order status
router.patch(
  "/admin/:id",
  requireAuth,
  requirePermission("orders:update"),
  updateOrder
);

export default router;

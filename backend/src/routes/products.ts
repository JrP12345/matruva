// src/routes/products.ts
import { Router } from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/products.js";
import {
  requireAuth,
  requirePermission,
  optionalAuth,
} from "../middleware/auth.js";

const router = Router();

/**
 * Public routes - no authentication required (but auth is checked optionally)
 * Mounted at: /v1/products
 */

// GET /v1/products - List products with filters
router.get("/", optionalAuth, getProducts);

// GET /v1/products/:id - Get single product
router.get("/:id", optionalAuth, getProduct);

/**
 * Admin routes - require authentication and specific permissions
 * Also mounted at: /v1/admin/products
 */

// POST /v1/admin/products - Create product
// Requires: products:create permission
router.post(
  "/",
  requireAuth,
  requirePermission("products:create"),
  createProduct
);

// PATCH /v1/admin/products/:id - Update product
// Requires: products:update permission
router.patch(
  "/:id",
  requireAuth,
  requirePermission("products:update"),
  updateProduct
);

// DELETE /v1/admin/products/:id - Delete product
// Requires: products:delete permission
router.delete(
  "/:id",
  requireAuth,
  requirePermission("products:delete"),
  deleteProduct
);

export default router;

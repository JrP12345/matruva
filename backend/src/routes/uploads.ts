// src/routes/uploads.ts
import { Router } from "express";
import {
  generateSignedUploadUrl,
  validateUpload,
} from "../controllers/uploads.js";
import { requireAuth, requirePermission } from "../middleware/auth.js";

const router = Router();

/**
 * All upload routes require authentication and admin permissions
 */

// POST /v1/admin/uploads/signed-url
// Generate presigned URL for file upload
// Requires: products:create OR products:update permission
router.post(
  "/signed-url",
  requireAuth,
  requirePermission("products:create"),
  generateSignedUploadUrl
);

// POST /v1/admin/uploads/validate
// Validate uploaded file
router.post(
  "/validate",
  requireAuth,
  requirePermission("products:create"),
  validateUpload
);

export default router;

// src/controllers/uploads.ts
import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import crypto from "crypto";
import path from "path";
import { logAdminAction } from "../helpers/auditLog.js";

/**
 * POST /v1/admin/uploads/signed-url
 * Admin endpoint - Generate signed URL for file upload
 *
 * In production, this would integrate with S3/CloudFlare/etc.
 * For development, returns a mock signed URL and public URL.
 *
 * Request body:
 * {
 *   fileName: string,
 *   fileType: string (e.g., 'image/png'),
 *   fileSize?: number
 * }
 *
 * Response:
 * {
 *   signedUrl: string,     // URL for PUT request
 *   publicUrl: string,     // URL to access uploaded file
 *   expiresIn: number,     // Seconds until signed URL expires
 *   uploadMethod: 'PUT'
 * }
 */
export async function generateSignedUploadUrl(req: AuthRequest, res: Response) {
  try {
    const { fileName, fileType, fileSize } = req.body;

    // Validation
    if (!fileName || !fileType) {
      return res.status(400).json({
        error: "Missing required fields: fileName, fileType",
      });
    }

    // Validate file type (only images for products)
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ];
    if (!allowedTypes.includes(fileType.toLowerCase())) {
      return res.status(400).json({
        error: "Invalid file type. Allowed: JPEG, PNG, WebP, GIF",
      });
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (fileSize && fileSize > maxSize) {
      return res.status(400).json({
        error: "File size exceeds maximum allowed size of 10MB",
      });
    }

    // Generate unique file name
    const ext = path.extname(fileName);
    const nameWithoutExt = path.basename(fileName, ext);
    const uniqueId = crypto.randomBytes(16).toString("hex");
    const timestamp = Date.now();
    const uniqueFileName = `${nameWithoutExt}-${timestamp}-${uniqueId}${ext}`;

    // In development: use local file storage
    // In production: generate S3/CloudFlare presigned URL
    const isDev = process.env.NODE_ENV !== "production";

    if (isDev) {
      // Development mode: mock signed URL
      const baseUrl = process.env.API_BASE_URL || "http://localhost:3001";
      const signedUrl = `${baseUrl}/uploads/temp/${uniqueFileName}?signature=${uniqueId}&expires=${
        Date.now() + 300000
      }`;
      const publicUrl = `${baseUrl}/uploads/images/${uniqueFileName}`;

      // Log admin action
      await logAdminAction(req, {
        actorId: req.userId!,
        action: "upload.generate_signed_url",
        targetType: "Upload",
        targetId: uniqueFileName,
        metadata: { fileName, fileType, fileSize, isDev: true },
      });

      return res.json({
        signedUrl,
        publicUrl,
        expiresIn: 300, // 5 minutes
        uploadMethod: "PUT",
        fields: {
          "Content-Type": fileType,
        },
      });
    }

    // Production mode: integrate with cloud storage
    // Example for S3:
    /*
    import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
    import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `products/${uniqueFileName}`,
      ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    const publicUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/products/${uniqueFileName}`;
    */

    // For now, return error in production without cloud config
    return res.status(501).json({
      error:
        "Cloud storage not configured. Please set up S3 or similar service.",
    });
  } catch (error: any) {
    console.error("Error generating signed URL:", error);
    res.status(500).json({ error: "Failed to generate signed URL" });
  }
}

/**
 * POST /v1/admin/uploads/validate
 * Admin endpoint - Validate uploaded file
 *
 * Called after successful upload to verify file
 *
 * Request body:
 * {
 *   publicUrl: string
 * }
 */
export async function validateUpload(req: AuthRequest, res: Response) {
  try {
    const { publicUrl } = req.body;

    if (!publicUrl) {
      return res
        .status(400)
        .json({ error: "Missing required field: publicUrl" });
    }

    // In production, you might:
    // 1. Check if file exists in S3
    // 2. Validate file size/type
    // 3. Run virus scan
    // 4. Generate thumbnails

    // For development, just validate URL format
    const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i;
    if (!urlPattern.test(publicUrl)) {
      return res.status(400).json({ error: "Invalid image URL format" });
    }

    // Log validation
    await logAdminAction(req, {
      actorId: req.userId!,
      action: "upload.validate",
      targetType: "Upload",
      metadata: { publicUrl },
    });

    res.json({
      valid: true,
      publicUrl,
      message: "Upload validated successfully",
    });
  } catch (error: any) {
    console.error("Error validating upload:", error);
    res.status(500).json({ error: "Failed to validate upload" });
  }
}

// src/routes/payments.ts
import express from "express";
import {
  createCheckoutSession,
  verifyPayment,
  razorpayWebhook,
} from "../controllers/payments.js";
import { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// POST /v1/payments/create-checkout-session
// Create Razorpay Order (optional auth - allows guest)
router.post("/create-checkout-session", optionalAuth, createCheckoutSession);

// POST /v1/payments/verify
// Verify Razorpay payment signature
router.post("/verify", verifyPayment);

// POST /v1/payments/webhook
// Razorpay webhook (no auth - verified by signature)
// Note: This route needs raw body, configured in app.ts
router.post("/webhook", razorpayWebhook);

export default router;

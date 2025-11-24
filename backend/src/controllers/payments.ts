// src/controllers/payments.ts
import { type Request, type Response } from "express";
import Order from "../models/Order.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import type { OrderItem } from "../models/Order.js";
import Product from "../models/Product.js";

// Initialize Razorpay (test/live mode based on keys)
const razorpay =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : null;

/**
 * POST /v1/payments/create-razorpay-order
 * Create Razorpay Order for payment
 */
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    if (!razorpay) {
      return res.status(500).json({
        message:
          "Razorpay is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment variables.",
      });
    }

    // Fetch order
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Verify order ownership (if authenticated)
    const userId = (req as any).user?._id;
    if (userId && order.userId?.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Order must be in pending status
    if (order.status !== "pending") {
      return res.status(400).json({
        message: `Cannot create payment for order with status: ${order.status}`,
      });
    }

    // Re-validate order (prices and stock)
    const Product = (await import("../models/Product.js")).default;
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({
          message: `Product not found: ${item.productId}`,
        });
      }

      if (product.stock < item.qty) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`,
        });
      }

      // Verify price hasn't changed
      if (product.priceMinor !== item.priceMinor) {
        return res.status(400).json({
          message: `Price changed for ${product.name}. Please create a new order.`,
        });
      }
    }

    // Create notes for Razorpay order
    const notes: any = {
      orderId: order._id.toString(),
      userId: order.userId?.toString() || "guest",
      items: order.items.map((item) => item.name).join(", "),
    };

    // Create Razorpay Order
    const razorpayOrder = await razorpay.orders.create({
      amount: order.totalMinor, // Amount in paise (INR minor currency)
      currency: order.currency,
      receipt: order._id.toString(),
      notes: notes,
    });

    // Save Razorpay order ID to our order
    order.razorpayOrderId = razorpayOrder.id;
    await order.save();

    // Return order details and Razorpay key for frontend
    return res.json({
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      amount: order.totalMinor,
      currency: order.currency,
      orderId: order._id,
      customerName: order.shippingAddress.name,
      customerEmail: (req as any).user?.email || "",
      customerPhone: order.shippingAddress.phone,
    });
  } catch (error: any) {
    console.error("Error creating Razorpay order:", error);
    return res.status(500).json({
      message: "Failed to create payment order",
      error: error.message,
    });
  }
};

/**
 * POST /v1/payments/verify
 * Verify Razorpay payment signature
 */
export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !orderId
    ) {
      return res
        .status(400)
        .json({ message: "Missing payment verification details" });
    }

    if (!razorpay) {
      return res.status(500).json({ message: "Razorpay not configured" });
    }

    // Verify signature
    const webhookSecret = process.env.RAZORPAY_KEY_SECRET!;
    const generatedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Fetch order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update order status
    order.status = "paid";
    order.payment.status = "succeeded";
    order.payment.providerPaymentId = razorpay_payment_id;
    order.payment.paidAt = new Date();

    await order.save();

    console.log(`Order ${orderId} payment verified and marked as paid`);

    return res.json({
      success: true,
      message: "Payment verified successfully",
      order: {
        _id: order._id,
        status: order.status,
        totalMinor: order.totalMinor,
      },
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return res.status(500).json({
      message: "Payment verification failed",
      error: error.message,
    });
  }
};

/**
 * POST /v1/payments/webhook
 * Razorpay webhook endpoint
 * Handles payment events from Razorpay
 */
export const razorpayWebhook = async (req: Request, res: Response) => {
  try {
    if (!razorpay) {
      return res.status(500).json({ message: "Razorpay not configured" });
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers["x-razorpay-signature"] as string;

    if (!webhookSecret) {
      console.error("RAZORPAY_WEBHOOK_SECRET not configured");
      return res.status(500).json({ message: "Webhook secret not configured" });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Webhook signature verification failed");
      return res.status(400).json({ message: "Invalid signature" });
    }

    const event = req.body.event;
    const payload =
      req.body.payload.payment?.entity || req.body.payload.order?.entity;

    console.log(`Received Razorpay event: ${event}`);

    switch (event) {
      case "payment.captured": {
        const orderId = payload.notes?.orderId;
        if (!orderId) {
          console.error("No order ID in payment notes");
          break;
        }

        const order = await Order.findById(orderId);
        if (!order) {
          console.error(`Order not found: ${orderId}`);
          break;
        }

        order.status = "paid";
        order.payment.status = "succeeded";
        order.payment.providerPaymentId = payload.id;
        order.payment.paidAt = new Date();

        await order.save();
        console.log(`Order ${orderId} marked as paid via webhook`);
        break;
      }

      case "payment.failed": {
        const orderId = payload.notes?.orderId;
        if (orderId) {
          const order = await Order.findById(orderId);
          if (order) {
            order.payment.status = "failed";
            await order.save();
          }
        }
        console.log(`Payment failed for order: ${orderId}`);
        break;
      }

      case "refund.created": {
        const paymentId = payload.payment_id;
        const order = await Order.findOne({
          "payment.providerPaymentId": paymentId,
        });

        if (order) {
          order.status = "refunded";
          order.payment.status = "refunded";
          await order.save();
          console.log(`Order ${order._id} marked as refunded`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event}`);
    }

    return res.json({ status: "ok" });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return res.status(500).json({
      message: "Webhook processing failed",
      error: error.message,
    });
  }
};

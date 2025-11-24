// src/controllers/orders.ts
import { type Request, type Response } from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import mongoose from "mongoose";

/**
 * POST /v1/orders
 * Create a new order (validates items, checks stock, creates order record)
 * Status: pending (payment not yet processed)
 */
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { items, shippingAddress, billingAddress, notes } = req.body;

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
    }

    if (!shippingAddress) {
      return res.status(400).json({ message: "Shipping address is required" });
    }

    // Validate shipping address fields
    const requiredAddressFields = [
      "name",
      "addressLine1",
      "city",
      "state",
      "postalCode",
      "country",
    ];
    for (const field of requiredAddressFields) {
      if (!shippingAddress[field]) {
        return res
          .status(400)
          .json({ message: `Shipping address ${field} is required` });
      }
    }

    // Validate and process items
    const validatedItems = [];
    let subtotalMinor = 0;
    let currency = "INR"; // Default currency

    for (const item of items) {
      // Fetch product from database
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(400).json({
          message: `Product not found: ${item.productId}`,
        });
      }

      // Check stock availability
      if (product.stock < item.qty) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.qty}`,
        });
      }

      // Validate price (prevent price tampering)
      // Client sends priceMinor, but we use server's price
      const serverPriceMinor = product.priceMinor;
      const itemSubtotal = serverPriceMinor * item.qty;
      subtotalMinor += itemSubtotal;

      // Get currency from first product
      if (validatedItems.length === 0) {
        currency = product.currency || "INR";
      }

      // Create order item with snapshot of product data
      validatedItems.push({
        productId: product._id,
        name: product.name,
        priceMinor: serverPriceMinor, // Use server price, not client price
        qty: item.qty,
        attributes: item.attributes || {},
      });

      // Decrement stock
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.qty },
      });
    }

    // Calculate totals
    // Simple calculation - can be extended with shipping rates, tax rates, etc.
    const shippingMinor = 0; // Free shipping for now
    const taxMinor = Math.round(subtotalMinor * 0.18); // 18% GST example
    const totalMinor = subtotalMinor + shippingMinor + taxMinor;

    // Get user ID (if authenticated) - auth middleware sets req.userId
    const userId = (req as any).userId || (req as any).user?.sub;

    // Create order
    const order = new Order({
      userId: userId || undefined, // Optional for guest checkout
      items: validatedItems,
      status: "pending",
      totalMinor,
      currency,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress, // Use shipping if billing not provided
      payment: {
        provider: "razorpay", // Razorpay provider
        status: "pending",
      },
      subtotalMinor,
      shippingMinor,
      taxMinor,
      notes,
    });

    await order.save();

    return res.status(201).json({
      message: "Order created successfully",
      order: {
        _id: order._id,
        status: order.status,
        totalMinor: order.totalMinor,
        currency: order.currency,
        items: order.items,
      },
    });
  } catch (error: any) {
    console.error("Error creating order:", error);
    return res.status(500).json({
      message: "Failed to create order",
      error: error.message,
    });
  }
};

/**
 * GET /v1/orders
 * List user's orders (requires authentication)
 */
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId || (req as any).user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { page = 1, limit = 10, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build query
    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select("-metadata"),
      Order.countDocuments(query),
    ]);

    return res.json({
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

/**
 * GET /v1/orders/:id
 * Get single order (user must own it or be admin)
 */
export const getOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId || (req as any).user?.sub;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check ownership (user must own order or have admin permissions)
    const isOwner = order.userId?.toString() === userId?.toString();

    // Check if user has admin permissions
    const { userHasPermission } = await import("../helpers/permissions.js");
    const hasAdminPermission = userId
      ? await userHasPermission(userId, "orders:view")
      : false;

    if (!isOwner && !hasAdminPermission) {
      return res.status(403).json({ message: "Access denied" });
    }

    return res.json({ order });
  } catch (error: any) {
    console.error("Error fetching order:", error);
    return res.status(500).json({
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

/**
 * PATCH /v1/orders/:id/cancel
 * Cancel an order (only if pending or paid, not fulfilled)
 */
export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user?._id;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check ownership
    if (order.userId?.toString() !== userId?.toString()) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Can only cancel if not fulfilled
    if (order.status === "fulfilled") {
      return res.status(400).json({ message: "Cannot cancel fulfilled order" });
    }

    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Order already cancelled" });
    }

    // Restore stock for all items
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.qty },
      });
    }

    // Update order status
    order.status = "cancelled";
    await order.save();

    return res.json({
      message: "Order cancelled successfully",
      order,
    });
  } catch (error: any) {
    console.error("Error cancelling order:", error);
    return res.status(500).json({
      message: "Failed to cancel order",
      error: error.message,
    });
  }
};

/**
 * GET /v1/admin/orders
 * List all orders (admin only)
 */
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, status, userId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Build query
    const query: any = {};
    if (status) query.status = status;
    if (userId) query.userId = userId;

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate("userId", "name email"),
      Order.countDocuments(query),
    ]);

    return res.json({
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    console.error("Error fetching all orders:", error);
    return res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

/**
 * PATCH /v1/admin/orders/:id
 * Update order status (admin only)
 */
export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, payment } = req.body;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update fields
    if (status) {
      order.status = status;
    }

    if (payment) {
      if (payment.status) order.payment.status = payment.status;
      if (payment.providerPaymentId)
        order.payment.providerPaymentId = payment.providerPaymentId;
      if (payment.status === "succeeded" && !order.payment.paidAt) {
        order.payment.paidAt = new Date();
      }
    }

    await order.save();

    return res.json({
      message: "Order updated successfully",
      order,
    });
  } catch (error: any) {
    console.error("Error updating order:", error);
    return res.status(500).json({
      message: "Failed to update order",
      error: error.message,
    });
  }
};

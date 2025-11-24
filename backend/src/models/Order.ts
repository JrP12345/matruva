// src/models/Order.ts
import mongoose, { Schema, Document } from "mongoose";

export interface OrderItem {
  productId: mongoose.Types.ObjectId;
  name: string; // Product name at time of order
  priceMinor: number; // Price snapshot
  qty: number;
  attributes?: Record<string, string>; // e.g., { color: 'red', size: 'M' }
}

export interface ShippingAddress {
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface PaymentInfo {
  provider: "stripe" | "paypal" | "razorpay"; // Payment provider
  providerPaymentId?: string; // Stripe payment intent ID, etc.
  status: "pending" | "succeeded" | "failed" | "refunded";
  paidAt?: Date;
}

export interface IOrder extends Document {
  userId?: mongoose.Types.ObjectId; // Optional for guest checkout
  items: OrderItem[]; // Snapshot of products at order time
  status: "pending" | "paid" | "fulfilled" | "cancelled" | "refunded";
  totalMinor: number; // Total order amount in minor currency units
  currency: string; // INR, USD, etc.
  shippingAddress: ShippingAddress;
  billingAddress?: ShippingAddress; // Optional, can use shipping if same
  payment: PaymentInfo;
  subtotalMinor?: number; // Item subtotal
  shippingMinor?: number; // Shipping cost
  taxMinor?: number; // Tax amount
  stripeSessionId?: string; // For Stripe Checkout (legacy)
  razorpayOrderId?: string; // For Razorpay payment
  notes?: string; // Customer notes
  trackingNumber?: string; // Shipping tracking number
  metadata?: any; // Additional data
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<OrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
    name: { type: String, required: true },
    priceMinor: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
    attributes: { type: Schema.Types.Mixed },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema(
  {
    name: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: "IN" },
    phone: { type: String },
  },
  { _id: false }
);

const PaymentInfoSchema = new Schema(
  {
    provider: {
      type: String,
      required: true,
      enum: ["stripe", "paypal", "razorpay"],
      default: "razorpay",
    },
    providerPaymentId: { type: String },
    status: {
      type: String,
      required: true,
      enum: ["pending", "succeeded", "failed", "refunded"],
      default: "pending",
    },
    paidAt: { type: Date },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
      // Optional for guest checkout
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [arrayMinLength, "Order must have at least one item"],
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "paid", "fulfilled", "cancelled", "refunded"],
      default: "pending",
      index: true,
    },
    totalMinor: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "INR" },
    shippingAddress: { type: ShippingAddressSchema, required: true },
    billingAddress: { type: ShippingAddressSchema },
    payment: { type: PaymentInfoSchema, required: true },
    subtotalMinor: { type: Number, min: 0 },
    shippingMinor: { type: Number, default: 0, min: 0 },
    taxMinor: { type: Number, default: 0, min: 0 },
    stripeSessionId: { type: String, index: true, sparse: true },
    razorpayOrderId: { type: String, index: true, sparse: true },
    notes: { type: String },
    trackingNumber: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

// Validation function for array minimum length
function arrayMinLength(val: any[]) {
  return val && val.length > 0;
}

OrderSchema.index({ userId: 1, createdAt: -1 });

const Order =
  (mongoose.models.Order as mongoose.Model<IOrder>) ||
  mongoose.model<IOrder>("Order", OrderSchema);

export default Order;

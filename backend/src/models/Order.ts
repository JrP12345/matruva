// src/models/Order.ts
import mongoose, { Schema, Document } from "mongoose";

export interface OrderItem {
  productId: mongoose.Types.ObjectId;
  title: string;
  priceMinor: number;
  qty: number;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  items: OrderItem[];
  subtotalMinor: number;
  shippingMinor: number;
  taxMinor: number;
  totalMinor: number;
  currency: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  fulfillmentStatus:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  stripeSessionId?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<OrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
    title: { type: String, required: true },
    priceMinor: { type: Number, required: true },
    qty: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
      index: true,
    },
    items: { type: [OrderItemSchema], required: true },
    subtotalMinor: { type: Number, required: true },
    shippingMinor: { type: Number, default: 0 },
    taxMinor: { type: Number, default: 0 },
    totalMinor: { type: Number, required: true },
    currency: { type: String, required: true, default: "INR" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    fulfillmentStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    stripeSessionId: { type: String, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

OrderSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);

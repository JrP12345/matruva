// src/models/Product.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  title: string;
  slug: string;
  description?: string;
  priceMinor: number;
  currency: string;
  images: string[];
  stock: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    priceMinor: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "INR" },
    images: { type: [String], default: [] },
    stock: { type: Number, required: true, default: 0, index: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

ProductSchema.index({ title: "text", description: "text" });

export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);

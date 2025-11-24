// src/models/Product.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description?: string;
  priceMinor: number; // Price in smallest currency unit (paise/cents)
  currency: "INR" | "USD";
  stock: number;
  sku?: string;
  images: string[]; // Array of image URLs
  category?: string;
  attributes?: Record<string, string>; // e.g., { color: 'red', size: 'M' }
  status: "draft" | "active" | "archived";
  createdBy: mongoose.Types.ObjectId; // Admin who created the product
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
    },
    description: { type: String, trim: true },
    priceMinor: { type: Number, required: true, min: 0 }, // Must be non-negative
    currency: {
      type: String,
      required: true,
      enum: ["INR", "USD"],
      default: "INR",
    },
    stock: { type: Number, required: true, default: 0, min: 0 }, // Must be non-negative
    sku: { type: String, trim: true, sparse: true, unique: true }, // Sparse allows multiple null values
    images: { type: [String], default: [] },
    category: { type: String, trim: true },
    attributes: { type: Schema.Types.Mixed }, // Flexible key-value pairs
    status: {
      type: String,
      required: true,
      enum: ["draft", "active", "archived"],
      default: "draft",
      index: true,
    },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Text search index for name and description
ProductSchema.index({ name: "text", description: "text" });

// Compound index for common queries
ProductSchema.index({ status: 1, createdAt: -1 });
ProductSchema.index({ category: 1, status: 1 });

const Product =
  (mongoose.models.Product as mongoose.Model<IProduct>) ||
  mongoose.model<IProduct>("Product", ProductSchema);

export default Product;

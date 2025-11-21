// src/models/Permission.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IPermission extends Document {
  key: string; // e.g. 'product:create'
  description?: string;
  category?: string;
  protected?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PermissionSchema = new Schema<IPermission>(
  {
    key: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    category: { type: String },
    protected: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Permission ||
  mongoose.model<IPermission>("Permission", PermissionSchema);

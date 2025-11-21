// src/models/Role.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IRole extends Document {
  name: string; // 'SUPER_ADMIN', 'ADMIN', ...
  label?: string; // human-friendly
  description?: string;
  permissions: string[]; // permission keys
  protected?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true, index: true },
    label: { type: String },
    description: { type: String },
    permissions: { type: [String], default: [] },
    protected: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Role ||
  mongoose.model<IRole>("Role", RoleSchema);

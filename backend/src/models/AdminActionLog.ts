// src/models/AdminActionLog.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IAdminActionLog extends Document {
  actorId: mongoose.Types.ObjectId;
  actorEmail?: string;
  action: string; // e.g., 'role.create', 'user.assign_role'
  targetType?: string;
  targetId?: any;
  metadata?: any;
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

const AdminActionLogSchema = new Schema<IAdminActionLog>(
  {
    actorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    actorEmail: { type: String },
    action: { type: String, required: true, index: true },
    targetType: { type: String },
    targetId: { type: Schema.Types.Mixed },
    metadata: { type: Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.AdminActionLog ||
  mongoose.model<IAdminActionLog>("AdminActionLog", AdminActionLogSchema);

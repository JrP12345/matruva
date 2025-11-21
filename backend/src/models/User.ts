// src/models/User.ts
import mongoose, { Schema, Document } from "mongoose";

export interface RefreshSession {
  jti: string; // unique id for refresh token
  tokenHash: string; // bcrypt hash of the refresh token JWT (or jti)
  createdAt: Date;
  expiresAt: Date;
  ip?: string;
  userAgent?: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: string; // role name string
  extraPermissions?: string[]; // override perms
  refreshSessions: RefreshSession[];
  createdAt: Date;
  updatedAt: Date;
}

const RefreshSessionSchema = new Schema<RefreshSession>(
  {
    jti: { type: String, required: true, index: true },
    tokenHash: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    ip: { type: String },
    userAgent: { type: String },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, default: "USER" },
    extraPermissions: { type: [String], default: [] },
    refreshSessions: { type: [RefreshSessionSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);

// src/models/Store.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IStore extends Document {
  name: string;
  ownerId: mongoose.Types.ObjectId;
  defaultCurrency: string;
  timezone?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const StoreSchema = new Schema<IStore>(
  {
    name: { type: String, required: true },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    defaultCurrency: { type: String, required: true, default: "INR" },
    timezone: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.models.Store ||
  mongoose.model<IStore>("Store", StoreSchema);

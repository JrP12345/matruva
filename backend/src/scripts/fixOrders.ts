// Script to fix orders by adding userId
import mongoose from "mongoose";
import Order from "../models/Order.js";

async function fixOrders() {
  try {
    const dbUri =
      process.env.DATABASE_URI || "mongodb://localhost:27017/matruva";
    console.log("🔌 Connecting to:", dbUri);
    await mongoose.connect(dbUri);
    console.log("✅ Connected to MongoDB");

    // Update all orders to have the super admin's userId
    const superAdminId = "691f45a847500bc4e6c723fa";

    const result = await Order.updateMany(
      { userId: { $exists: false } },
      { $set: { userId: superAdminId } }
    );

    console.log(`✅ Updated ${result.modifiedCount} orders with userId`);

    // Show sample orders
    const orders = await Order.find({}).limit(3).select("_id userId status");
    console.log("Sample orders:", orders);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

fixOrders();

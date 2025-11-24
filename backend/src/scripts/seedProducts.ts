// Seed sample products
import mongoose from "mongoose";
import Product from "../models/Product.js";
import User from "../models/User.js";

const sampleProducts = [
  {
    name: "Classic T-Shirt",
    slug: "classic-t-shirt",
    description: "Comfortable cotton t-shirt perfect for everyday wear",
    priceMinor: 59900, // ₹599
    currency: "INR",
    stock: 100,
    images: ["https://via.placeholder.com/400x400?text=T-Shirt"],
    category: "Clothing",
    status: "active",
  },
  {
    name: "Denim Jeans",
    slug: "denim-jeans",
    description: "Premium quality denim jeans with perfect fit",
    priceMinor: 149900, // ₹1,499
    currency: "INR",
    stock: 50,
    images: ["https://via.placeholder.com/400x400?text=Jeans"],
    category: "Clothing",
    status: "active",
  },
  {
    name: "Running Shoes",
    slug: "running-shoes",
    description: "Lightweight and comfortable running shoes",
    priceMinor: 249900, // ₹2,499
    currency: "INR",
    stock: 30,
    images: ["https://via.placeholder.com/400x400?text=Shoes"],
    category: "Footwear",
    status: "active",
  },
  {
    name: "Backpack",
    slug: "backpack",
    description: "Durable backpack with multiple compartments",
    priceMinor: 129900, // ₹1,299
    currency: "INR",
    stock: 40,
    images: ["https://via.placeholder.com/400x400?text=Backpack"],
    category: "Accessories",
    status: "active",
  },
  {
    name: "Wireless Earbuds",
    slug: "wireless-earbuds",
    description: "High-quality wireless earbuds with noise cancellation",
    priceMinor: 349900, // ₹3,499
    currency: "INR",
    stock: 25,
    images: ["https://via.placeholder.com/400x400?text=Earbuds"],
    category: "Electronics",
    status: "active",
  },
];

async function seedProducts() {
  try {
    await mongoose.connect(process.env.DATABASE_URI as string);
    console.log("✅ Connected to MongoDB");

    // Get super admin user
    const admin = await User.findOne({ email: "owner@example.com" });
    if (!admin) {
      console.error("❌ Super admin not found. Run 'npm run seed' first!");
      process.exit(1);
    }

    // Clear existing products
    await Product.deleteMany({});
    console.log("🗑️  Cleared existing products");

    // Add createdBy to all products
    const productsWithAdmin = sampleProducts.map((p) => ({
      ...p,
      createdBy: admin._id,
    }));

    // Insert sample products
    const products = await Product.insertMany(productsWithAdmin);
    console.log(`✅ Seeded ${products.length} products:`);
    products.forEach((p) => {
      console.log(`   - ${p.name} (${p.slug}) - ₹${p.priceMinor / 100}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding products:", error);
    process.exit(1);
  }
}

seedProducts();

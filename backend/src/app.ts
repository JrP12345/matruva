// src/app.ts
import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.js";
import jwksRoutes from "./routes/jwks.js";
import adminRoutes from "./routes/admin.js";
import productsRoutes from "./routes/products.js";
import uploadsRoutes from "./routes/uploads.js";
import ordersRoutes from "./routes/orders.js";
import paymentsRoutes from "./routes/payments.js";
import { PORT, DATABASE_URI, NODE_ENV } from "./config/index.js";

const app = express();
app.use(helmet());

// Razorpay webhook needs raw body, so we handle it before express.json()
app.use("/v1/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: NODE_ENV === "production" ? ["https://your-frontend.com"] : true,
    credentials: true,
  })
);

// Rate limiting (more lenient in development)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: NODE_ENV === "production" ? 100 : 1000, // 100 in prod, 1000 in dev
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Public routes
app.use("/", jwksRoutes);
app.get("/health", (req, res) => res.json({ ok: true }));

// API routes
app.use("/v1/auth", authRoutes);
app.use("/v1/admin", adminRoutes);
app.use("/v1/products", productsRoutes);
app.use("/v1/admin/products", productsRoutes); // Admin product routes
app.use("/v1/admin/uploads", uploadsRoutes);
app.use("/v1/orders", ordersRoutes);
app.use("/v1/payments", paymentsRoutes);

// Only start the server if this file is run directly (not imported for tests)
// Check if running directly (not being imported as a module)
const isMainModule =
  process.argv[1] &&
  (process.argv[1].includes("app.ts") || process.argv[1].includes("app.js"));

// Global error handlers
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

if (isMainModule) {
  mongoose
    .connect(DATABASE_URI)
    .then(() => {
      console.log("✅ MongoDB connected successfully");
      const server = app.listen(PORT, "0.0.0.0", () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📡 API: http://localhost:${PORT}`);
        console.log(`🔑 JWKS: http://localhost:${PORT}/.well-known/jwks.json`);
        console.log(`💚 Health: http://localhost:${PORT}/health`);
        console.log("✅ Server is ready to accept connections");
      });

      server.on("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
          console.error(`❌ Port ${PORT} is already in use`);
        } else {
          console.error("❌ Server error:", err);
        }
        process.exit(1);
      });
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      process.exit(1);
    });
}

export default app;

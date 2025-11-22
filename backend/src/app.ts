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
import { PORT, DATABASE_URI, NODE_ENV } from "./config/index.js";

const app = express();
app.use(helmet());
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

// Only start the server if this file is run directly (not imported for tests)
// Check if running directly (not being imported as a module)
const isMainModule =
  process.argv[1] &&
  (process.argv[1].includes("app.ts") || process.argv[1].includes("app.js"));

if (isMainModule) {
  mongoose
    .connect(DATABASE_URI)
    .then(() => {
      console.log("✅ MongoDB connected successfully");
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📡 API: http://localhost:${PORT}`);
        console.log(`🔑 JWKS: http://localhost:${PORT}/.well-known/jwks.json`);
        console.log(`💚 Health: http://localhost:${PORT}/health`);
      });
    })
    .catch((err) => {
      console.error("❌ MongoDB connection error:", err);
      process.exit(1);
    });
}

export default app;

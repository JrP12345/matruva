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

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
});
app.use(limiter);

// Public routes
app.use("/", jwksRoutes);
app.get("/health", (req, res) => res.json({ ok: true }));

// API routes
app.use("/v1/auth", authRoutes);
app.use("/v1/admin", adminRoutes);

// Only start the server if this file is run directly (not imported for tests)
if (import.meta.url === `file://${process.argv[1]}`) {
  mongoose
    .connect(DATABASE_URI)
    .then(() => {
      console.log("Mongo connected");
      app.listen(PORT, () => console.log(`Listening on ${PORT}`));
    })
    .catch((err) => {
      console.error("Mongo connection error", err);
      process.exit(1);
    });
}

export default app;

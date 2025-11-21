// src/routes/auth.ts
import express from "express";
import { register, login, refresh, logout, me } from "../controllers/auth.js";
import { requireAuth } from "../middleware/auth.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

export default router;

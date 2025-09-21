import express from "express";
import { login, logout, signup, refreshToken, getProfile } from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
router.get("/profile", protectRoute, getProfile);

export default router;

// WMDeSog9PLiNkjUB
// mongodb+srv://saimanoj2327:WMDeSog9PLiNkjUB@cluster0.mbjfw3p.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
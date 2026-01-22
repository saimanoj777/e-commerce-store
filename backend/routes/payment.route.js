import express from "express";
import { createOrder, verifyPayment, getRazorpayKey } from "../controllers/payment.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Get Razorpay key for frontend
router.get("/get-key", getRazorpayKey);

// Create order for payment
router.post("/create-order", protectRoute, createOrder);

// Verify payment
router.post("/verify-payment", protectRoute, verifyPayment);

export default router;
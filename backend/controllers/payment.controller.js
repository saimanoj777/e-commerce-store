import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

// Ensure env vars are loaded even if this module is imported before server initialization
dotenv.config();

// Lazily initialize Razorpay instance to ensure env vars are available
let razorpayInstance = null;
const getRazorpayInstance = () => {
    if (razorpayInstance) return razorpayInstance;

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        throw new Error("Missing Razorpay credentials. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET");
    }

    razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
    return razorpayInstance;
};

// Create order for payment
export const createOrder = async (req, res) => {
    try {
        const { amount, currency = "INR", receipt } = req.body;

        // Validate amount (must be a positive number)
        const numericAmount = Number(amount);
        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Valid amount is required" 
            });
        }

        const options = {
            // Razorpay expects amount in paise (multiply by 100)
            amount: Math.round(numericAmount * 100),
            currency,
            receipt: receipt || `receipt_${Date.now()}`,
        };

        const razorpay = getRazorpayInstance();
        const order = await razorpay.orders.create(options);

        res.json({
            success: true,
            order,
        });
    } catch (error) {
        console.error("Error in createOrder controller", error);
        res.status(500).json({ 
            success: false, 
            message: error?.error?.description || error?.message || "Server error", 
            error: error?.error || error 
        });
    }
};

// Verify payment
export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ 
                success: false, 
                message: "Missing payment verification data" 
            });
        }

        // Create signature for verification
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;
        if (!keySecret) {
            return res.status(500).json({
                success: false,
                message: "Missing Razorpay key secret on server",
            });
        }

        const expectedSignature = crypto
            .createHmac("sha256", keySecret)
            .update(body.toString())
            .digest("hex");

        const isAuthentic = expectedSignature === razorpay_signature;

        if (isAuthentic) {
            // Payment is successful
            res.json({
                success: true,
                message: "Payment verified successfully",
                paymentId: razorpay_payment_id,
                orderId: razorpay_order_id,
            });
        } else {
            res.status(400).json({
                success: false,
                message: "Payment verification failed",
            });
        }
    } catch (error) {
        console.error("Error in verifyPayment controller", error);
        res.status(500).json({ 
            success: false, 
            message: error?.error?.description || error?.message || "Server error", 
            error: error?.error || error 
        });
    }
};

// Get Razorpay key for frontend
export const getRazorpayKey = async (req, res) => {
    try {
        const key = process.env.RAZORPAY_KEY_ID;
        if (!key) {
            return res.status(500).json({ success: false, message: "Missing Razorpay key id on server" });
        }
        res.json({ success: true, key });
    } catch (error) {
        console.error("Error in getRazorpayKey controller", error);
        res.status(500).json({ 
            success: false, 
            message: error?.message || "Server error", 
            error 
        });
    }
};
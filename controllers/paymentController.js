// ─────────────────────────────────────────────────────
// SAVE AS: controllers/paymentController.js
// npm install razorpay
// .env: RAZORPAY_KEY_ID=rzp_live_xxx  RAZORPAY_KEY_SECRET=xxx
// ─────────────────────────────────────────────────────

const Razorpay = require("razorpay");
const crypto   = require("crypto");

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay credentials missing in .env");
  }
  return new Razorpay({
    key_id:     process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

/* ─── Create Razorpay order ────────────────────────── */
exports.createOrder = async (req, res) => {
  console.log("CREATE ORDER HIT");
    console.log("BODY:", req.body);
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount) || Number(amount) < 1)
      return res.status(400).json({ message: "Invalid amount" });

    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount:   Math.round(Number(amount) * 100), // paise
      currency: "INR",
      receipt:  "rk_" + Date.now(),
      notes:    { source: "RouterKart" },
    });

    res.json({
      id:       order.id,
      amount:   order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error("createRazorpayOrder:", err);
    res.status(500).json({ message: err.message || "Failed to create payment order" });
  }
};

/* ─── Verify Razorpay payment signature ────────────── */
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      return res.status(400).json({ message: "Missing payment verification fields" });

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expected !== razorpay_signature)
      return res.status(400).json({ message: "Payment signature verification failed" });

    res.json({ verified: true, message: "Payment verified successfully" });
  } catch (err) {
    console.error("verifyPayment:", err);
    res.status(500).json({ message: "Payment verification failed" });
  }
};


// ─────────────────────────────────────────────────────
// SAVE AS: routes/paymentRoutes.js
// ─────────────────────────────────────────────────────
/*
const express = require("express");
const router  = express.Router();
const { createOrder, verifyPayment } = require("../controllers/paymentController");
const { verifyToken } = require("../middleware/authMiddleware");

// Create Razorpay order — protected (must be logged in)
router.post("/create-order", verifyToken, createOrder);

// Verify payment signature — protected
router.post("/verify",       verifyToken, verifyPayment);

module.exports = router;
*/


// ─────────────────────────────────────────────────────
// Add to server.js (if not already there):
// ─────────────────────────────────────────────────────
/*
const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payment", paymentRoutes);
*/
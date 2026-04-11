const Razorpay = require("razorpay");
const crypto = require("crypto");

/* ── Init Razorpay safely ── */
const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay credentials missing in .env");
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

/* ═════════ CREATE ORDER ═════════ */
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    console.log("ENV CHECK:", {
      key: process.env.RAZORPAY_KEY_ID,
      secret: process.env.RAZORPAY_KEY_SECRET ? "present" : "missing",
    });

    console.log("AMOUNT DEBUG:", {
      raw: amount,
      type: typeof amount,
      parsed: Number(amount),
    });

    // ✅ Validation
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: "rk_" + Date.now(),
    });

    return res.json(order);

  } catch (err) {
    console.error("❌ CREATE ORDER ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};

    return res.status(500).json({
      message: err.message || "Failed to create order",
    });
  }
};
/* ═════════ VERIFY PAYMENT ═════════ */
exports.verifyPayment = async (req, res) => {
  try {
    console.log("VERIFY HIT:", req.body);

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    // ✅ Validation
    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        message: "Missing payment verification fields",
      });
    }

    // ✅ Generate expected signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    // ❌ If mismatch
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        message: "Payment verification failed",
      });
    }

    console.log("✅ PAYMENT VERIFIED");

    return res.json({
      verified: true,
      message: "Payment verified successfully",
    });

  } catch (err) {
    console.error("❌ VERIFY ERROR:", err);

    return res.status(500).json({
      message: "Payment verification failed",
    });
  }
};
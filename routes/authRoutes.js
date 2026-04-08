// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");

// ✅ KEEP REGISTER (no OTP)
router.post("/register", auth.register);

// ❌ DO NOT include send-otp (you removed it correctly)

// ✅ LOGIN
router.post("/login", auth.login);

// ✅ FORGOT PASSWORD
router.post("/forgot-password/send-otp", auth.forgotPasswordSendOtp);
router.post("/forgot-password/verify-otp", auth.forgotPasswordVerifyOtp);
router.post("/forgot-password/reset", auth.forgotPasswordReset);

module.exports = router;
const express = require("express");
const router = express.Router();
const auth = require("../controllers/authController");

// ✅ Register
router.post("/register", auth.register);

// ✅ Login
router.post("/login", auth.login);

// ✅ Forgot Password
router.post("/forgot-password/send-otp", auth.forgotPasswordSendOtp);
router.post("/forgot-password/verify-otp", auth.forgotPasswordVerifyOtp);
router.post("/forgot-password/reset", auth.forgotPasswordReset);

module.exports = router;
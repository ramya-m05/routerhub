const express = require("express");
const router = express.Router();

const auth = require("../controllers/authController");
// OTP Signup flow
// Signup OTP
router.post("/send-otp", auth.sendSignupOtp);
router.post("/verify-otp", auth.verifySignupOtp);
router.post("/resend-otp", auth.resendOtp);

// Forgot password
// router.post("/forgot-password/send-otp", auth.forgotPasswordSendOtp);
// router.post("/forgot-password/verify-otp", auth.forgotPasswordVerifyOtp);
// router.post("/forgot-password/reset", auth.forgotPasswordReset);

// Login
router.post("/login", auth.login);
module.exports = router
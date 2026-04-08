// controllers/authController.js
// ─────────────────────────────────────────────────────────────────────────────
// ROOT CAUSE FIX:
//   Old code manually called bcrypt.hash() THEN saved with User.create()
//   which triggered the Mongoose pre-save hook to hash AGAIN.
//   Result: stored hash = bcrypt(bcrypt(password)) → login always fails.
//
//   Fix: NEVER hash manually in this file.
//         Always pass the PLAIN password to User.create() / new User().save()
//         and let the pre-save hook in models/User.js do the single hash.
// ─────────────────────────────────────────────────────────────────────────────

const User   = require("../models/User");
const jwt    = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

/* ── helpers ─────────────────────────────────────── */
const generateToken = (user) => {
  const isAdmin = user.role === "admin" || user.isAdmin === true;
  return jwt.sign(
    { id: user._id, isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const getRole = (user) => {
  if (user.role === "admin" || user.isAdmin === true) return "admin";
  return user.role || "user";
};

/* ═══════════════════════════════════════════════════
   REGISTER  (direct — no OTP)
   POST /api/auth/register
   Body: { name, email, password }

   ✅ Passes PLAIN password to User.create()
      The pre-save hook in User.js hashes it ONCE.
      Never call bcrypt.hash() here.
══════════════════════════════════════════════════ */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ── Basic validation ──
    if (!name?.trim())
      return res.status(400).json({ message: "Name is required" });
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ message: "Please enter a valid email address" });
    if (!password || password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const emailKey = email.toLowerCase().trim();

    // ── Check for duplicate ──
    const existing = await User.findOne({ email: emailKey });
    if (existing)
      return res.status(400).json({ message: "This email is already registered. Please login." });
  

    // ── Create user — pass PLAIN password, pre-save hook hashes it ──
    const user = await User.create({
      name:            name.trim(),
      email:           emailKey,
      password,          // ← plain text here, hashed once by User.js pre-save
      role:            "user",
      isEmailVerified: false,
      addresses:       [],
      orderCount:      0,
      wishlistCount:   0,
    });

    const token = generateToken(user);

    res.status(201).json({
      token,
      role:    getRole(user),
      name:    user.name,
      email:   user.email,
      message: "Account created successfully! Welcome to RouterKart 🎉",
    });
  } catch (err) {
    console.error("register error:", err);
    // Handle duplicate key at DB level (race condition)
    if (err.code === 11000)
      return res.status(400).json({ message: "This email is already registered. Please login." });
    res.status(500).json({ message: "Registration failed. Please try again." });
  }
};

/* ═══════════════════════════════════════════════════
   LOGIN
   POST /api/auth/login
   Body: { email, password }
   ✅ Supports both old (isAdmin:true) and new (role:"admin") schemas
══════════════════════════════════════════════════ */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user)
      return res.status(400).json({ message: "User not found" });

    // ── Compare using bcrypt ──
    // Works whether password was hashed by pre-save hook (new accounts)
    // or by manual bcrypt.hash (old accounts, if any)
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Incorrect password" });

    const token = generateToken(user);
    const role  = getRole(user);

    // Silently upgrade old isAdmin:true accounts to role:"admin"
    if (user.isAdmin === true && user.role !== "admin") {
      User.findByIdAndUpdate(user._id, { role: "admin" }).catch(() => {});
    }

    res.json({
      token,
      role,
      name:  user.name,
      email: user.email,
    });
  } catch (err) {
    console.error("login error:", err);
    res.status(500).json({ message: "Login failed. Please try again." });
  }
};

/* ═══════════════════════════════════════════════════
   FORGOT PASSWORD — 3 endpoints
   POST /api/auth/forgot-password/send-otp
   POST /api/auth/forgot-password/verify-otp
   POST /api/auth/forgot-password/reset
══════════════════════════════════════════════════ */

// In-memory OTP store — key: email → { otp, otpExpires }
const resetStore = new Map();
const makeOtp    = () => crypto.randomInt(100000, 999999).toString();

exports.forgotPasswordSendOtp = async (req, res) => {
  try {
    const emailKey = req.body.email?.toLowerCase().trim();
    if (!emailKey || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailKey))
      return res.status(400).json({ message: "Please enter a valid email address" });

    const user = await User.findOne({ email: emailKey });
    if (!user)
      return res.status(404).json({ message: "No account found with this email address" });

    const otp        = makeOtp();
    const otpExpires = Date.now() + 10 * 60 * 1000;
    resetStore.set(emailKey, { otp, otpExpires });

    const { sendOtpEmail } = require("../services/emailService");
    await sendOtpEmail(emailKey, otp, "passwordReset");

    res.json({ message: "OTP sent to your email address." });
  } catch (err) {
    console.error("forgotPasswordSendOtp:", err);
    res.status(500).json({ message: "Failed to send OTP. Please try again." });
  }
};

exports.forgotPasswordVerifyOtp = async (req, res) => {
  try {
    const emailKey = req.body.email?.toLowerCase().trim();
    const { otp }  = req.body;
    const record   = resetStore.get(emailKey);

    if (!record)
      return res.status(400).json({ message: "No OTP request found. Please start again." });
    if (Date.now() > record.otpExpires) {
      resetStore.delete(emailKey);
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }
    if (record.otp !== String(otp).trim())
      return res.status(400).json({ message: "Invalid OTP. Please check and try again." });

    res.json({ message: "OTP verified. Set your new password." });
  } catch (err) {
    console.error("forgotPasswordVerifyOtp:", err);
    res.status(500).json({ message: "OTP verification failed." });
  }
};

exports.forgotPasswordReset = async (req, res) => {
  try {
    const emailKey      = req.body.email?.toLowerCase().trim();
    const { otp, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const record = resetStore.get(emailKey);
    if (!record)
      return res.status(400).json({ message: "Session expired. Please start again." });
    if (Date.now() > record.otpExpires) {
      resetStore.delete(emailKey);
      return res.status(400).json({ message: "OTP expired. Please request a new one." });
    }
    if (record.otp !== String(otp).trim())
      return res.status(400).json({ message: "Invalid OTP." });

    // ── Hash new password ONCE then save using findOneAndUpdate with $set
    //    so the pre-save hook does NOT run (we hash explicitly here for update)
    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate(
      { email: emailKey },
      { $set: { password: hashed } }
    );

    resetStore.delete(emailKey);
    res.json({ message: "Password reset successful! You can now log in." });
  } catch (err) {
    console.error("forgotPasswordReset:", err);
    res.status(500).json({ message: "Failed to reset password. Please try again." });
  }
};
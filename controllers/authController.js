const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

/* ── helpers ───────────────── */
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

/* ═════════ REGISTER ═════════ */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const emailKey = email.toLowerCase().trim();

    const existing = await User.findOne({ email: emailKey });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });

    const user = await User.create({
      name,
      email: emailKey,
      password,
    });

    const token = generateToken(user);

    res.status(201).json({
      token,
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ═════════ LOGIN ═════════ */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user)
      return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.status(400).json({ message: "Incorrect password" });

    const token = generateToken(user);

    res.json({
      token,
      role: getRole(user),
      name: user.name,
      email: user.email,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ═════════ FORGOT PASSWORD ═════════ */

const resetStore = new Map();
const makeOtp = () => crypto.randomInt(100000, 999999).toString();

/* SEND OTP */
exports.forgotPasswordSendOtp = async (req, res) => {
  try {
    const emailKey = req.body.email?.toLowerCase().trim();

    const user = await User.findOne({ email: emailKey });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    resetStore.set(emailKey, {
      otp,
      expires: Date.now() + 10 * 60 * 1000,
    });

    console.log("OTP GENERATED:", otp); // debug

    const { sendOtpEmail } = require("../services/emailService");

    const sent = await sendOtpEmail(emailKey, otp);

    if (!sent) {
      return res.status(500).json({ message: "Failed to send OTP email" });
    }

    res.json({ message: "OTP sent successfully" });

  } catch (err) {
    console.error("OTP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* VERIFY OTP */
exports.forgotPasswordVerifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const data = resetStore.get(email.toLowerCase());

    if (!data || data.otp !== otp || Date.now() > data.expires) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ verified: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* RESET PASSWORD */
exports.forgotPasswordReset = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user)
      return res.json({ message: "If email exists, OTP sent" });
    user.password = password;
    await user.save();

    resetStore.delete(email.toLowerCase());

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
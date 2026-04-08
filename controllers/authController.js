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

/* ═════════ REGISTER ═════════ */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim())
      return res.status(400).json({ message: "Name is required" });

    if (!email?.trim())
      return res.status(400).json({ message: "Email is required" });

    if (!password || password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    const emailKey = email.toLowerCase().trim();

    const existing = await User.findOne({ email: emailKey });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });

    const user = await User.create({
      name: name.trim(),
      email: emailKey,
      password,
    });

    console.log("USER CREATED:", user);

    const token = generateToken(user);

    return res.status(201).json({
      token,
      name: user.name,     // ✅ FIXED
      email: user.email,
    });

  } catch (err) {
    console.error("🔥 REGISTER ERROR FULL:", err);
    return res.status(500).json({
      message: err.message,
    });
  }
};

/* ═════════ LOGIN ═════════ */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({
        message: "Email and password are required"
      });

    const user = await User.findOne({
      email: email.toLowerCase().trim()
    });

    if (!user)
      return res.status(400).json({
        message: "User not found"
      });

    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.status(400).json({
        message: "Incorrect password"
      });

    const token = generateToken(user);
    const role  = getRole(user);

    if (user.isAdmin === true && user.role !== "admin") {
      await User.findByIdAndUpdate(user._id, { role: "admin" }).catch(() => {});
    }

    return res.json({
      token,
      role,
      name: user.name,     // ✅ FIXED
      email: user.email
    });

  } catch (err) {
    console.error("🔥 LOGIN ERROR FULL:", err);
    return res.status(500).json({
      message: err.message
    });
  }
};

/* ═════════ FORGOT PASSWORD (unchanged) ═════════ */

const resetStore = new Map();
const makeOtp    = () => crypto.randomInt(100000, 999999).toString();

exports.forgotPasswordSendOtp = async (req, res) => {
  try {
    const emailKey = req.body.email?.toLowerCase().trim();
    if (!emailKey)
      return res.status(400).json({ message: "Invalid email" });

    const user = await User.findOne({ email: emailKey });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const otp        = makeOtp();
    const otpExpires = Date.now() + 10 * 60 * 1000;
    resetStore.set(emailKey, { otp, otpExpires });

    const { sendOtpEmail } = require("../services/emailService");
    await sendOtpEmail(emailKey, otp, "passwordReset");

    res.json({ message: "OTP sent" });
  } catch (err) {
    res.status(500).json({ message: "Failed to send OTP" });
  }
};
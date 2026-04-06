const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { sendOtpEmail } = require("../services/emailService");

/* ─── helpers ─── */
const generateOtp = () => crypto.randomInt(100000, 999999).toString();

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

const pendingSignups = new Map();

/* ─── SEND OTP ─────────────────────────── */
exports.sendSignupOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    let user = await User.findOne({ email });

    // 🔥 RATE LIMIT FIX
    if (user?.otpExpires && Date.now() - user.otpExpires < 60000) {
      return res.status(429).json({
        message: "Please wait 1 minute before requesting OTP",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpExpires = Date.now();

    if (!user) {
      user = new User({ email });
    }

    user.otp = otp;
    user.otpExpires = otpExpires;

    await user.save();

    const sent = await sendOtpEmail(email, otp);

    if (!sent) {
      return res.status(500).json({ message: "Failed to send OTP" });
    }

    res.json({ message: "OTP sent successfully" });

  } catch (err) {
    console.error("OTP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= VERIFY OTP ================= */
exports.verifySignupOtp = async (req, res) => {
  try {
    const emailKey = req.body.email?.toLowerCase().trim();
    const { otp } = req.body;

    const data = pendingSignups.get(emailKey);
    if (!data)
      return res.status(400).json({ message: "No pending signup" });

    if (Date.now() > data.otpExpires) {
      pendingSignups.delete(emailKey);
      return res.status(400).json({ message: "OTP expired" });
    }

    if (data.otp !== String(otp).trim())
      return res.status(400).json({ message: "Invalid OTP" });

    const saved = await User.collection.insertOne({
      name: data.name,
      email: emailKey,
      password: data.hashedPassword,
      role: "user",
      isEmailVerified: true,
      addresses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    pendingSignups.delete(emailKey);

    const newUser = await User.findById(saved.insertedId);
    const token = generateToken(newUser);

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: getRole(newUser),
        isAdmin: getRole(newUser) === "admin",
      },
    });
  } catch (err) {
    console.error("verifySignupOtp:", err);
    res.status(500).json({ message: "Failed to verify OTP" });
  }
};

/* ================= RESEND OTP ================= */
exports.resendOtp = async (req, res) => {
  try {
    const emailKey = req.body.email?.toLowerCase().trim();
    const data = pendingSignups.get(emailKey);

    if (!data)
      return res.status(400).json({ message: "No pending signup" });

    const otp = generateOtp();
    const otpExpires = Date.now() + 10 * 60 * 1000;

    pendingSignups.set(emailKey, { ...data, otp, otpExpires });

    await sendOtpEmail(emailKey, otp, "signup");

    res.json({ message: "OTP resent successfully" });
  } catch (err) {
    console.error("resendOtp:", err);
    res.status(500).json({ message: "Failed to resend OTP" });
  }
};

/* ================= LOGIN ================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(400).json({ message: "Incorrect password" });

    const token = generateToken(user);
    const role = getRole(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role,
        isAdmin: role === "admin",
      },
    });
  } catch (err) {
    console.error("login:", err);
    res.status(500).json({ message: "Login failed" });
  }
};

/* ================= FORGOT PASSWORD (TEMP) ================= */
exports.forgotPasswordSendOtp = async (req, res) => {
  res.json({ message: "Send OTP working" });
};

exports.forgotPasswordVerifyOtp = async (req, res) => {
  res.json({ message: "Verify OTP working" });
};

exports.forgotPasswordReset = async (req, res) => {
  res.json({ message: "Reset working" });
};
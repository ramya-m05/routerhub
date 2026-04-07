const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

/* ─── helpers ─── */
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

/* ================= SIGNUP (OTP BYPASSED) ================= */
exports.sendSignupOtp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("📩 Signup:", email);

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    let user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (user) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      isEmailVerified: true, // ✅ bypass OTP
    });

    const token = generateToken(user);
    const role = getRole(user);

    res.json({
      message: "Signup successful",
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
    console.error("Signup ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= VERIFY OTP (DISABLED) ================= */
exports.verifySignupOtp = async (req, res) => {
  return res.json({
    message: "OTP verification disabled",
  });
};

/* ================= RESEND OTP (DISABLED) ================= */
exports.resendOtp = async (req, res) => {
  return res.json({
    message: "OTP disabled",
  });
};

/* ================= LOGIN ================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "Incorrect password" });
    }

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

/* ================= FORGOT PASSWORD ================= */
exports.forgotPasswordSendOtp = async (req, res) => {
  res.json({ message: "Disabled for now" });
};

exports.forgotPasswordVerifyOtp = async (req, res) => {
  res.json({ message: "Disabled for now" });
};

exports.forgotPasswordReset = async (req, res) => {
  res.json({ message: "Disabled for now" });
};
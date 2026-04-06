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


/* ================= SEND OTP ================= */
exports.sendSignupOtp = async (req, res) => {
  try {
    const { name, email, password  } = req.body;

    console.log("📩 Email:", email);

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    let user = await User.findOne({ email });

    // 🔥 RATE LIMIT
    if (user?.otpExpires && Date.now() - user.otpExpires < 60000) {
      return res.status(429).json({
        message: "Please wait 1 minute before requesting OTP",
      });
    }

    const otp = generateOtp();

    if (!user) {
  const hashedPassword = await bcrypt.hash(password, 10);

  user = new User({
    name,
    email,
    password: hashedPassword,
  });
}

    user.otp = otp;
    user.otpExpires = Date.now();

    await user.save();

    const sent = await sendOtpEmail(email, otp);

    if (!sent) {
      console.log("❌ Email failed");
      return res.status(500).json({ message: "Email service failed" });
    }

    res.json({ message: "OTP sent successfully" });

  } catch (err) {
    console.error("❌ OTP ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ================= VERIFY OTP ================= */
exports.verifySignupOtp = async (req, res) => {
  try {
    const emailKey = req.body.email?.toLowerCase().trim();
    const { otp } = req.body;

    const user = await User.findOne({ email: emailKey });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.otp || user.otp !== String(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // OPTIONAL: expiry check (if you later add proper expiry logic)
    // if (Date.now() > user.otpExpires + 10 * 60 * 1000) {
    //   return res.status(400).json({ message: "OTP expired" });
    // }

    user.otp = null;
    user.otpExpires = null;
    user.isEmailVerified = true;

    await user.save();

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: getRole(user),
        isAdmin: getRole(user) === "admin",
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
    const email = req.body.email?.toLowerCase().trim();

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const otp = generateOtp();

    user.otp = otp;
    user.otpExpires = Date.now();

    await user.save();

    await sendOtpEmail(email, otp);

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

/* ================= FORGOT PASSWORD ================= */
exports.forgotPasswordSendOtp = async (req, res) => {
  res.json({ message: "Send OTP working" });
};

exports.forgotPasswordVerifyOtp = async (req, res) => {
  res.json({ message: "Verify OTP working" });
};

exports.forgotPasswordReset = async (req, res) => {
  res.json({ message: "Reset working" });
};
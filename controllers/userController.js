// controllers/userController.js
const User   = require("../models/User");
const crypto = require("crypto");
const { sendOtpEmail } = require("../services/emailService");

const generateOtp = () => crypto.randomInt(100000, 999999).toString();

/* ─── GET profile ─────────────────────────── */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -otp -otpExpires");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch { res.status(500).json({ message: "Failed to load profile" }); }
};

/* ─── UPDATE profile (name + phone only) ─── */
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "Name cannot be empty" });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim(), phone: phone?.trim() || "" },
      { new: true }
    ).select("-password -otp -otpExpires");

    res.json(user);
  } catch { res.status(500).json({ message: "Update failed" }); }
};

/* ─── SEND OTP for email change ──────────── */
exports.sendEmailChangeOtp = async (req, res) => {
  try {
    const { newEmail } = req.body;

    if (!newEmail || !/\S+@\S+\.\S+/.test(newEmail))
      return res.status(400).json({ message: "Enter a valid email address" });

    const currentUser = await User.findById(req.user.id);
    if (newEmail.toLowerCase() === currentUser.email)
      return res.status(400).json({ message: "New email is same as current email" });

    const taken = await User.findOne({ email: newEmail.toLowerCase() });
    if (taken) return res.status(400).json({ message: "Email already in use by another account" });

    const otp        = generateOtp();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    await User.findByIdAndUpdate(req.user.id, {
      otp, otpExpires,
      otpFor:       "emailChange",
      pendingEmail: newEmail.toLowerCase()
    });

    await sendOtpEmail(newEmail, otp, "emailChange");
    res.json({ message: "OTP sent to new email address." });
  } catch (err) {
    console.error("sendEmailChangeOtp:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

/* ─── VERIFY OTP for email change ─────────── */
exports.verifyEmailChangeOtp = async (req, res) => {
  try {
    const { newEmail, otp } = req.body;
    const user = await User.findById(req.user.id);

    if (user.otpFor !== "emailChange")
      return res.status(400).json({ message: "No email change request found. Please start again." });

    if (!user.otp || Date.now() > new Date(user.otpExpires).getTime()) {
      await User.findByIdAndUpdate(req.user.id, { otp: null, otpExpires: null, otpFor: null, pendingEmail: null });
      return res.status(400).json({ message: "OTP has expired. Please request a new one." });
    }

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP. Please check and try again." });

    const updated = await User.findByIdAndUpdate(req.user.id, {
      email:        user.pendingEmail,
      otp:          null,
      otpExpires:   null,
      otpFor:       null,
      pendingEmail: null
    }, { new: true }).select("-password -otp -otpExpires");

    res.json(updated);
  } catch { res.status(500).json({ message: "Failed to verify OTP" }); }
};

/* ─── ADDRESS — get all ─────────────────────── */
exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("addresses");
    res.json(user.addresses || []);
  } catch { res.status(500).json({ message: "Failed to load addresses" }); }
};

/* ─── ADDRESS — add ─────────────────────────── */
exports.addAddress = async (req, res) => {
  try {
    console.log("REQ.USER:", req.user);
    console.log("REQ.BODY:", req.body);

    if (!req.user?.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      label,
      doorNo,
      houseName,
      cross,
      landmark,
      city,
      district,
      pincode,
      phone,
      isDefault
    } = req.body;

    if (!city || !district || !pincode) {
      return res.status(400).json({
        message: "City, district and pincode are required"
      });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.addresses) {
      user.addresses = [];
    }

    let makeDefault = isDefault;

if (user.addresses.length === 0) {
  makeDefault = true;
}

if (makeDefault) {
  user.addresses.forEach(a => (a.isDefault = false));
}

user.addresses.push({
  label: label || "Home",
  doorNo,
  houseName,
  cross,
  landmark,
  city,
  district,
  pincode,
  phone,
  isDefault: !!makeDefault
});

    await user.save();

    res.json(user.addresses);

  } catch (err) {
    console.error("ADD ADDRESS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ─── ADDRESS — update ──────────────────────── */
exports.updateAddress = async (req, res) => {
  try {
    const user    = await User.findById(req.user.id);
    const address = user.addresses.id(req.params.addressId);
    if (!address) return res.status(404).json({ message: "Address not found" });

    const { label, doorNo, houseName, cross, landmark, city, district, pincode, phone, isDefault } = req.body;

    if (isDefault) {
      user.addresses.forEach(a => { a.isDefault = false; });
    }

    Object.assign(address, { label, doorNo, houseName, cross, landmark, city, district, pincode, phone, isDefault: !!isDefault });
    await user.save();

    res.json(user.addresses);
  } catch { res.status(500).json({ message: "Failed to update address" }); }
};

/* ─── ADDRESS — delete ──────────────────────── */
exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses = user.addresses.filter(a => a._id.toString() !== req.params.addressId);
    await user.save();
    res.json(user.addresses);
  } catch { res.status(500).json({ message: "Failed to delete address" }); }
};

/* ─── ADDRESS — set default ─────────────────── */
exports.setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.addresses.forEach(a => { a.isDefault = a._id.toString() === req.params.addressId; });
    await user.save();
    res.json(user.addresses);
  } catch { res.status(500).json({ message: "Failed to update default address" }); }
};

/* ─── ADMIN: get all users ─────────────────── */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -otp -otpExpires");
    res.json(users);
  } catch { res.status(500).json({ message: "Error fetching users" }); }
};

/* ─── ADMIN: delete user ───────────────────── */
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch { res.status(500).json({ message: "Delete failed" }); }
};
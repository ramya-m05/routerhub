const express = require("express");
const router = express.Router();

const {
  getProfile,
  updateProfile,
  sendEmailChangeOtp,
  verifyEmailChangeOtp,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getAllUsers,
  deleteUser
} = require("../controllers/userController");

// ✅ FIXED IMPORT
const { verifyToken } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");


// Profile
router.get("/profile", verifyToken, getProfile);
router.put("/profile", verifyToken, updateProfile);

// Email change OTP
router.post("/email-otp/send", verifyToken, sendEmailChangeOtp);
router.post("/email-otp/verify", verifyToken, verifyEmailChangeOtp);

// Addresses
router.get("/addresses", verifyToken, getAddresses);
router.post("/addresses", verifyToken, addAddress);
router.put("/addresses/:addressId", verifyToken, updateAddress);
router.delete("/addresses/:addressId", verifyToken, deleteAddress);
router.patch("/addresses/:addressId/default", verifyToken, setDefaultAddress);

// Admin
router.get("/", verifyToken, isAdmin, getAllUsers);
router.delete("/:id", verifyToken, isAdmin, deleteUser);

module.exports = router;
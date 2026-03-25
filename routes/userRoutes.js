const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser
} = require("../controllers/userController");

const { verifyToken } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

// GET ALL USERS (ADMIN ONLY)
router.get("/", verifyToken, isAdmin, getAllUsers);

// GET SINGLE USER
router.get("/:id", verifyToken, getUserById);

// UPDATE USER
router.put("/:id", verifyToken, updateUser);

// DELETE USER (ADMIN ONLY)
router.delete("/:id", verifyToken, isAdmin, deleteUser);

module.exports = router;
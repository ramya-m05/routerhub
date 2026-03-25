const express = require("express");
const router = express.Router();

const {
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus
} = require("../controllers/orderController");

const { verifyToken } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

// CREATE ORDER
router.post("/create", verifyToken, createOrder);

// USER ORDERS
router.get("/my", verifyToken, getUserOrders);

// ADMIN - ALL ORDERS
router.get("/", verifyToken, isAdmin, getAllOrders);

// UPDATE STATUS
router.put("/:id", verifyToken, isAdmin, updateOrderStatus);

module.exports = router;
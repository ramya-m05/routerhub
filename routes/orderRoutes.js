const express = require("express");
const router = express.Router();

const {
  createOrder,
  checkStock,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  getOrder
} = require("../controllers/orderController");

// ✅ FIXED IMPORTS
const { verifyToken } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

// ROUTES
router.post("/", verifyToken, createOrder);
router.post("/check-stock", checkStock);
router.get("/my", verifyToken, getUserOrders);
router.get("/", verifyToken, isAdmin, getAllOrders);
router.get("/:id", verifyToken, getOrder);
router.put("/:id", verifyToken, isAdmin, updateOrderStatus);

module.exports = router;
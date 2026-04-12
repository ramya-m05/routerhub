const express = require("express");
const router = express.Router();

const {
  getMyOrders,
  getAllOrders,
  createOrder,
  checkStock
} = require("../controllers/orderController");

const { verifyToken } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

// USER
router.get("/", verifyToken, getMyOrders);

// ADMIN
router.get("/admin", verifyToken, isAdmin, getAllOrders);
router.put("/admin/:id", verifyToken, isAdmin, updateOrderStatus);
// OTHER
router.post("/", verifyToken, createOrder);
router.post("/check-stock", verifyToken, checkStock);

module.exports = router;
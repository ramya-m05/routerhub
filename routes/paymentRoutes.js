const express = require("express");
const router  = express.Router();
const { createOrder, verifyPayment } = require("../controllers/paymentController");
const { verifyToken } = require("../middleware/authMiddleware");
 

// Create Razorpay order — protected (must be logged in)
router.post("/create-order", verifyToken, createOrder);
 
// Verify payment signature — protected
router.post("/verify",       verifyToken, verifyPayment);
 

module.exports = router;
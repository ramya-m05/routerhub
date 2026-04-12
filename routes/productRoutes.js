const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getReviews
} = require("../controllers/productController");

const { verifyToken } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");
const upload = require("../middleware/upload");

/* ─────────────────────────────────────────────
   PUBLIC ROUTES
───────────────────────────────────────────── */

// Get all products
router.get("/", getProducts);

// Get single product
router.get("/:id", getProduct);

// Get product reviews (safe fallback)
router.get("/:id/reviews", getReviews);

/* ─────────────────────────────────────────────
   ADMIN ROUTES (NO UPLOAD — SAFE)
───────────────────────────────────────────── */

// Create product
router.post("/", verifyToken, isAdmin, upload.array("images", 6), createProduct);
// Update product
router.put("/:id", verifyToken, isAdmin, upload.array("images", 6), updateProduct);
// Delete product
router.delete("/:id", verifyToken, isAdmin, deleteProduct);

module.exports = router;
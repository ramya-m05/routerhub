const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getReviews,
  addReview
} = require("../controllers/productController");

// ✅ FIXED IMPORTS
const { verifyToken } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

const upload = require("../middleware/upload");


// PUBLIC
router.get("/", getProducts);

// ✅ REVIEWS FIRST
router.get("/:id/reviews", getReviews);
router.post("/:id/reviews", verifyToken, addReview);

// PRODUCT
router.get("/:id", getProduct);

// ADMIN
router.post("/", verifyToken, isAdmin, upload.single("image"), createProduct);
router.put("/:id", verifyToken, isAdmin, upload.single("image"), updateProduct);
router.delete("/:id", verifyToken, isAdmin, deleteProduct);


module.exports = router;
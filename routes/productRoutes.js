const express = require("express");
const router = express.Router();

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

const { verifyToken } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

const upload = require("../middleware/upload");

// PUBLIC
router.get("/", getProducts);
router.get("/:id", getProduct);

// ADMIN
router.post("/", verifyToken, isAdmin, upload.array("images", 6), createProduct);
router.put("/:id", verifyToken, isAdmin, upload.array("images", 6), updateProduct);
router.delete("/:id", verifyToken, isAdmin, deleteProduct);

module.exports = router;
const express = require("express");
const router = express.Router();

const {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} = require("../controllers/productController");

// ✅ CREATE PRODUCT
router.post("/", addProduct);

// ✅ GET ALL PRODUCTS
router.get("/", getProducts);

// ✅ GET SINGLE PRODUCT
router.get("/:id", getProductById);

// ✅ UPDATE PRODUCT
router.put("/:id", updateProduct);

// ✅ DELETE PRODUCT
router.delete("/:id", deleteProduct);

module.exports = router;
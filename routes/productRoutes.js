const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { verifyToken } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");
const {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct,
  getProductById
} = require("../controllers/productController");

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/add", verifyToken, isAdmin, upload.single("image"), addProduct);
router.delete("/:id", verifyToken, isAdmin, deleteProduct);
router.put("/:id", verifyToken, isAdmin, updateProduct);

module.exports = router;

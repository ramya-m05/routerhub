const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  addProduct,
  getProducts,
  deleteProduct,
  updateProduct
} = require("../controllers/productController");

const { verifyToken } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

router.get("/:id", getProductById);

router.get("/", getProducts);

router.post("/add", verifyToken, isAdmin, addProduct);

router.delete("/:id", verifyToken, isAdmin, deleteProduct);

router.put("/:id", verifyToken, isAdmin, updateProduct);

router.post(
  "/add",
  verifyToken,
  isAdmin,
  upload.single("image"),
  addProduct
);

module.exports = router;
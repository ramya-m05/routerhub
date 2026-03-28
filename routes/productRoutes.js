const express = require("express");
const router = express.Router();

// ✅ GET products
router.get("/", async (req, res) => {
  res.json([{ name: "Test Product" }]);
});

// ✅ ADD PRODUCT (THIS IS MISSING)
router.post("/", async (req, res) => {
  try {
    const { name, price } = req.body;

    res.json({
      message: "Product added",
      name,
      price
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
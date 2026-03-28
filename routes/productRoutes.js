const express = require("express");
const router = express.Router();

// GET all products
router.get("/", async (req, res) => {
  try {
    res.json([{ name: "Test Product" }]); // temporary test
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
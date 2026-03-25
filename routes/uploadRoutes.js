const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");

// Upload route
router.post("/", upload.single("image"), (req, res) => {
  try {
    res.json({
      message: "File uploaded",
      file: req.file
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
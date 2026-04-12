const multer = require("multer");
const cloudinaryModule = require("cloudinary"); // ✅ full module, NOT .v2
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// ✅ config on .v2
cloudinaryModule.v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key:    process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// ✅ pass full module — package accesses .v2 internally
const storage = new CloudinaryStorage({
  cloudinary: cloudinaryModule,
  params: {
    folder:           "routerhub",
    allowed_formats:  ["jpg", "png", "jpeg", "webp"],
  },
});

module.exports = multer({ storage });
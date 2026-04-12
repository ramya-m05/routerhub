const multer   = require("multer");
const cloudinary = require("cloudinary").v2;

// ✅ Handle all export shapes across multer-storage-cloudinary versions
const storageModule = require("multer-storage-cloudinary");
const CloudinaryStorage =
  storageModule.CloudinaryStorage ||   // v4+
  storageModule.default?.CloudinaryStorage ||
  storageModule.default ||             // ESM default
  storageModule;                       // older versions export class directly

if (typeof CloudinaryStorage !== "function") {
  console.error("❌ CloudinaryStorage export:", Object.keys(storageModule));
  throw new Error("CloudinaryStorage is not a constructor — check multer-storage-cloudinary version");
}

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key:    process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// ✅ Pass cloudinary.v2 instance directly
const storage = new CloudinaryStorage({
  cloudinary,                          // this is already .v2
  params: {
    folder:          "routerhub",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation:  [{ width: 1200, crop: "limit" }],
  },
});

module.exports = multer({ storage });
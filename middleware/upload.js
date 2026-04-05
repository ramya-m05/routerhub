const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const storageModule = require("multer-storage-cloudinary");

// 🔥 HANDLE ALL CASES
const CloudinaryStorage =
  storageModule.CloudinaryStorage ||
  storageModule.default ||
  storageModule;
  
// CONFIG
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET
});

// STORAGE
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "routerhub",
    allowed_formats: ["jpg", "png", "jpeg"]
  }
});

// UPLOAD
const upload = multer({ storage });

module.exports = upload;
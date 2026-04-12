const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const app = express();

// ROUTES
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes"); // ✅ ADD THIS
const paymentRoutes = require("./routes/paymentRoutes");


// MIDDLEWARE
// ✅ CORS (FIXED)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://routerkart.in",
      "https://www.routerkart.in"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// ✅ HANDLE PREFLIGHT (CRITICAL)
app.options("*", cors());

// DEBUG
app.use((req, res, next) => {
  console.log("REQ HIT:", req.method, req.url);
  next();
});

app.use(express.json());

// DB CONNECTION
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000,
})
.then(() => {
  console.log("✅ MongoDB Connected");
  console.log("DB Name:", mongoose.connection.name);
})
.catch(err => {
  console.error("❌ MongoDB Error:", err.message);
});

// SERVER START
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
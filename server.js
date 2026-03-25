const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);

// Health check
app.get("/", (req, res) => res.json({ status: "RouterHub API running ✅" }));

// 🔥 Serve frontend
app.use(express.static(path.join(__dirname, "frontend/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend/dist/index.html"));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  res.status(500).json({ message: err.message || "Server error" });
});

// DB connect
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB failed:", err.message);
    setTimeout(connectDB, 5000);
  }
};

connectDB();

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected. Retrying...");
  setTimeout(connectDB, 5000);
});

// Crash protection
process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err.message);
});

process.on("unhandledRejection", (err) => {
  console.error("💥 Unhandled Rejection:", err.message);
});

// ✅ PORT FIX
const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
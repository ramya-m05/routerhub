const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ─────────────────────────────────────────────
   ROUTES IMPORT
───────────────────────────────────────────── */
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

/* ─────────────────────────────────────────────
   MIDDLEWARE
───────────────────────────────────────────── */

// ✅ CORS (FINAL FIX)
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://routerkart.in",
      "https://www.routerkart.in"
    ],
    credentials: true,
  })
);

// ✅ JSON parser
app.use(express.json());

// ✅ DEBUG (optional but useful)
app.use((req, res, next) => {
  console.log("REQ HIT:", req.method, req.url);
  next();
});

/* ─────────────────────────────────────────────
   API ROUTES
───────────────────────────────────────────── */

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payment", paymentRoutes);

/* ─────────────────────────────────────────────
   ROOT ROUTE (optional)
───────────────────────────────────────────── */

app.get("/", (req, res) => {
  res.send("🚀 RouterHub API is running");
});

/* ─────────────────────────────────────────────
   ERROR HANDLER (IMPORTANT)
───────────────────────────────────────────── */

app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);
  res.status(500).json({ message: "Server error" });
});

/* ─────────────────────────────────────────────
   DATABASE CONNECTION
───────────────────────────────────────────── */

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

/* ─────────────────────────────────────────────
   SERVER START
───────────────────────────────────────────── */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
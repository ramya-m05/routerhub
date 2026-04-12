const express  = require("express");
const mongoose = require("mongoose");
const cors     = require("cors");
require("dotenv").config();

const app = express();

/* ─────────────────────────────────────────────
   CORS — must be FIRST, before all routes
   ✅ Handles preflight OPTIONS requests too
───────────────────────────────────────────── */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://routerkart.in",
  "https://www.routerkart.in",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Explicitly handle OPTIONS preflight for all routes
app.options("*", cors());

/* ─────────────────────────────────────────────
   BODY PARSERS
───────────────────────────────────────────── */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ─────────────────────────────────────────────
   REQUEST LOGGER (dev)
───────────────────────────────────────────── */
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/* ─────────────────────────────────────────────
   ROUTES IMPORT — wrapped so a bad require
   doesn't silently kill the server
───────────────────────────────────────────── */
let authRoutes, productRoutes, orderRoutes, userRoutes, paymentRoutes;

try {
  authRoutes    = require("./routes/authRoutes");
  productRoutes = require("./routes/productRoutes");
  orderRoutes   = require("./routes/orderRoutes");
  userRoutes    = require("./routes/userRoutes");
  paymentRoutes = require("./routes/paymentRoutes");
} catch (err) {
  console.error("❌ ROUTE IMPORT FAILED:", err.message);
  process.exit(1); // crash loudly so Render shows the real error
}

/* ─────────────────────────────────────────────
   API ROUTES
───────────────────────────────────────────── */
app.use("/api/auth",    authRoutes);
app.use("/api/products",productRoutes);
app.use("/api/orders",  orderRoutes);
app.use("/api/users",   userRoutes);
app.use("/api/payment", paymentRoutes);

/* ─────────────────────────────────────────────
   HEALTH CHECK
───────────────────────────────────────────── */
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "RouterKart API",
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

/* ─────────────────────────────────────────────
   404 HANDLER
───────────────────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.url}` });
});

/* ─────────────────────────────────────────────
   GLOBAL ERROR HANDLER
───────────────────────────────────────────── */
app.use((err, _req, res, _next) => {
  console.error("GLOBAL ERROR:", err.message || err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

/* ─────────────────────────────────────────────
   MONGODB CONNECTION
───────────────────────────────────────────── */
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is not set in .env — server cannot start");
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 })
  .then(() => {
    console.log("✅ MongoDB connected:", mongoose.connection.name);
  })
  .catch(err => {
    console.error("❌ MongoDB connection failed:", err.message);
    // Don't exit — Render will restart; let health check reflect DB status
  });

/* ─────────────────────────────────────────────
   START SERVER
───────────────────────────────────────────── */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 RouterKart API running on port ${PORT}`);
  console.log(`   Allowed origins: ${allowedOrigins.join(", ")}`);
});
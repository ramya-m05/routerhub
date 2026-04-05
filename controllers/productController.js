// controllers/productController.js
const Product = require("../models/Product");
const Order   = require("../models/Order");

/* ─── GET all products ───────────────────────────── */
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch { res.status(500).json({ message: "Failed to fetch products" }); }
};

/* ─── GET single product ─────────────────────────── */
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch { res.status(500).json({ message: "Failed to fetch product" }); }
};

/* ─── CREATE product ─────────────────────────────── */
exports.createProduct = async (req, res) => {
  try {
    const {
      name, category, description, price,
      originalPrice, stock, brand, sku, deliveryDays
    } = req.body;

    const product = await Product.create({
      name:          name?.trim(),
      category,
      description:   description?.trim() || "",
      price:         Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      stock:         Number(stock),
      image:         req.file?.path || "",
      brand:         brand?.trim() || "",
      sku:           sku?.trim() || "",
      deliveryDays:  deliveryDays ? Number(deliveryDays) : 5
    });

    res.status(201).json(product);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ─── UPDATE product ─────────────────────────────── */
exports.updateProduct = async (req, res) => {
  try {
    const {
      name, category, description, price,
      originalPrice, stock, brand, sku, deliveryDays
    } = req.body;

    const updateData = {
      name:          name?.trim(),
      category,
      description:   description?.trim() || "",
      price:         Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      stock:         Number(stock),
      brand:         brand?.trim() || "",
      sku:           sku?.trim() || "",
      deliveryDays:  deliveryDays ? Number(deliveryDays) : 5
    };

    if (req.file) updateData.image = req.file.path;

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updated) return res.status(404).json({ message: "Product not found" });
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ─── DELETE product ─────────────────────────────── */
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

/* ─── GET reviews for a product ─────────────────── */
exports.getReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select("reviews");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product.reviews || []);
  } catch { res.status(500).json({ message: "Failed to load reviews" }); }
};

/* ─── ADD review (verified buyer only) ──────────── */
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    const userId    = req.user.id;

    if (!rating || !comment?.trim())
      return res.status(400).json({ message: "Rating and comment are required" });

    // ── Verified buyer check ──
    const bought = await Order.findOne({
      userId,
      status: { $in: ["delivered", "shipped", "out_for_delivery", "confirmed", "processing"] },
      "items.productId": productId
    });

    if (!bought)
      return res.status(403).json({
        message: "Only verified buyers who have purchased this product can write a review."
      });

    // ── Prevent duplicate review ──
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const alreadyReviewed = product.reviews.some(
      r => r.userId?.toString() === userId
    );
    if (alreadyReviewed)
      return res.status(400).json({ message: "You have already reviewed this product." });

    const { name } = require("../models/User");
    const User   = require("../models/User");
    const user   = await User.findById(userId).select("name");

    product.reviews.push({
      userId,
      name:     user?.name || req.body.name || "Customer",
      rating:   Number(rating),
      comment:  comment.trim(),
      verified: true
    });

    await product.save();
    res.json(product.reviews);
  } catch (err) {
    console.error("addReview:", err);
    res.status(500).json({ message: "Failed to submit review" });
  }
};
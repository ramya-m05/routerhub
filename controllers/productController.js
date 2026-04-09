// controllers/productController.js

const Product = require("../models/Product");
const Order   = require("../models/Order");
const User    = require("../models/User");

/* ─── GET all products ───────────────────────────── */
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.json(products);
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err); // 🔥 IMPORTANT
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

/* ─── GET single product ─────────────────────────── */
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (err) {
    console.error("GET PRODUCT ERROR:", err);
    res.status(500).json({ message: "Failed to fetch product" });
  }
};

/* ─── CREATE product ─────────────────────────────── */
exports.createProduct = async (req, res) => {
  try {
    const {
      name, category, description, price,
      originalPrice, stock, brand, sku, deliveryDays
    } = req.body;

    // ✅ handle multiple images
    const images = req.files?.map(file => file.path) || [];

    const product = await Product.create({
      name: name?.trim(),
      category,
      description: description?.trim() || "",
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      stock: Number(stock),
      images, // ✅ FIXED
      brand: brand?.trim() || "",
      sku: sku?.trim() || "",
      deliveryDays: deliveryDays ? Number(deliveryDays) : 5
    });

    res.status(201).json(product);

  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
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

    if (req.files && req.files.length > 0) {
  updateData.images = req.files.map(file => file.path);
}

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Product not found" });

    res.json(updated);
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ─── DELETE product ─────────────────────────────── */
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("DELETE PRODUCT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ─── GET reviews ───────────────────────────────── */
exports.getReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select("reviews");
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json(product.reviews || []);
  } catch (err) {
    console.error("GET REVIEWS ERROR:", err);
    res.status(500).json({ message: "Failed to load reviews" });
  }
};

/* ─── ADD review ────────────────────────────────── */
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;
    const userId    = req.user.id;

    if (!rating || !comment?.trim()) {
      return res.status(400).json({
        message: "Rating and comment are required"
      });
    }

    // ✅ Check if user bought product
    const bought = await Order.findOne({
      userId,
      status: { $in: ["delivered", "shipped", "out_for_delivery", "confirmed", "processing"] },
      "items.productId": productId
    });

    if (!bought) {
      return res.status(403).json({
        message: "Only verified buyers can review"
      });
    }

    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    // ✅ Prevent duplicate review
    const alreadyReviewed = product.reviews.some(
      r => r.userId?.toString() === userId
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        message: "You already reviewed this product"
      });
    }

    // ✅ FIXED USER FETCH
    const user = await User.findById(userId).select("name");

    product.reviews.push({
      userId,
      name: user?.name || "Customer",
      rating: Number(rating),
      comment: comment.trim(),
      verified: true
    });

    await product.save();

    res.json(product.reviews);

  } catch (err) {
    console.error("ADD REVIEW ERROR:", err);
    res.status(500).json({ message: "Failed to submit review" });
  }
};
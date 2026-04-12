const Product = require("../models/Product");
const mongoose = require("mongoose");

/* ─────────────────────────────────────────────
   GET ALL PRODUCTS
───────────────────────────────────────────── */
exports.getProducts = async (req, res) => {
  try {
    console.log("🔥 getProducts hit");

    const products = await Product.find().lean();

    return res.status(200).json(products);

  } catch (err) {
    console.error("❌ GET PRODUCTS ERROR:", err);
    return res.status(500).json({
      message: "Failed to fetch products",
      error: err.message
    });
  }
};

/* ─────────────────────────────────────────────
   GET SINGLE PRODUCT
───────────────────────────────────────────── */
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(id).lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(product);

  } catch (err) {
    console.error("❌ GET PRODUCT ERROR:", err);
    return res.status(500).json({
      message: "Failed to fetch product",
      error: err.message
    });
  }
};

/* ─────────────────────────────────────────────
   CREATE PRODUCT
───────────────────────────────────────────── */
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      price,
      originalPrice,
      stock,
      brand,
      sku,
      deliveryDays
    } = req.body;

    // ✅ Validation
    if (!name?.trim() || !category || !price) {
      return res.status(400).json({
        message: "Name, category and price are required"
      });
    }

    // ✅ Safe image handling (even if multer not used)
    const images = req.files?.map(file => file.path) || [];

    const product = await Product.create({
      name: name.trim(),
      category,
      description: description?.trim() || "",
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : null,
      stock: Number(stock) || 0,
      brand: brand?.trim() || "",
      sku: sku?.trim() || "",
      deliveryDays: deliveryDays ? Number(deliveryDays) : 5,
      images
    });

    return res.status(201).json(product);

  } catch (err) {
    console.error("❌ CREATE PRODUCT ERROR:", err);
    return res.status(500).json({
      message: "Failed to create product",
      error: err.message
    });
  }
};

/* ─────────────────────────────────────────────
   UPDATE PRODUCT
───────────────────────────────────────────── */
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const {
      name,
      category,
      description,
      price,
      originalPrice,
      stock,
      brand,
      sku,
      deliveryDays
    } = req.body;

    // ✅ Existing images
    let existingImages = [];
    try {
      existingImages = JSON.parse(req.body.existingImages || "[]");
    } catch {
      existingImages = [];
    }

    // ✅ New images
    const newImages = req.files?.map(file => file.path) || [];

    const finalImages = [...existingImages, ...newImages];

    const updated = await Product.findByIdAndUpdate(
      id,
      {
        name: name?.trim(),
        category,
        description: description?.trim() || "",
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : null,
        stock: Number(stock) || 0,
        brand: brand?.trim() || "",
        sku: sku?.trim() || "",
        deliveryDays: deliveryDays ? Number(deliveryDays) : 5,
        images: finalImages
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json(updated);

  } catch (err) {
    console.error("❌ UPDATE PRODUCT ERROR:", err);
    return res.status(500).json({
      message: "Failed to update product",
      error: err.message
    });
  }
};

/* ─────────────────────────────────────────────
   DELETE PRODUCT
───────────────────────────────────────────── */
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(200).json({ message: "Product deleted successfully" });

  } catch (err) {
    console.error("❌ DELETE PRODUCT ERROR:", err);
    return res.status(500).json({
      message: "Failed to delete product",
      error: err.message
    });
  }
};

/* ─────────────────────────────────────────────
   GET REVIEWS (SAFE PLACEHOLDER)
───────────────────────────────────────────── */
exports.getReviews = async (req, res) => {
  try {
    return res.json([]); // safe fallback
  } catch (err) {
    console.error("❌ GET REVIEWS ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
};
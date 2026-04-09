const Product = require("../models/Product");
const mongoose = require("mongoose");

/* ─── GET all products ─── */
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().lean();
    res.json(products);
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

/* ─── GET single product ─── */
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(id).lean();

    if (!product)
      return res.status(404).json({ message: "Product not found" });

    res.json(product);

  } catch (err) {
    console.error("GET PRODUCT ERROR:", err);
    res.status(500).json({ message: "Failed to fetch product" });
  }
};

/* ─── CREATE product ─── */
exports.createProduct = async (req, res) => {
  try {
    const {
      name, category, description, price,
      originalPrice, stock, brand, sku, deliveryDays
    } = req.body;

    const images = req.files?.map(file => file.path) || [];

const product = await Product.create({
  name: name?.trim(),
  category,
  description: description?.trim() || "",
  price: Number(price),
  originalPrice: originalPrice ? Number(originalPrice) : null,
  stock: Number(stock),
  brand: brand?.trim() || "",
  sku: sku?.trim() || "",
  deliveryDays: deliveryDays ? Number(deliveryDays) : 5,
  images
});

    res.status(201).json(product);

  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ─── UPDATE product ─── */
exports.updateProduct = async (req, res) => {
  try {
    const {
      name, category, description, price,
      originalPrice, stock, brand, sku, deliveryDays
    } = req.body;

    // ✅ Parse existing images
    let existingImages = [];
try {
  existingImages = JSON.parse(req.body.existingImages || "[]");
} catch {
  existingImages = [];
}

const newImages = req.files?.map(file => file.path) || [];

// FINAL MERGE
const finalImages = [...existingImages, ...newImages];

const updateData = {
  name: name?.trim(),
  category,
  description: description?.trim() || "",
  price: Number(price),
  originalPrice: originalPrice ? Number(originalPrice) : null,
  stock: Number(stock),
  brand: brand?.trim() || "",
  sku: sku?.trim() || "",
  deliveryDays: deliveryDays ? Number(deliveryDays) : 5,
  images: finalImages
};

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Product not found" });

    res.json(updated);

  } catch (err) {
    console.error("🔥 UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ─── DELETE product ─── */
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("DELETE PRODUCT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
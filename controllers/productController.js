const Product = require("../models/Product");
const mongoose = require("mongoose");

/* ─────────────────────────────────────────────
   GET ALL PRODUCTS
───────────────────────────────────────────── */
exports.getProducts = async (req, res) => {
  try {
    console.log("🔥 getProducts hit");

    const products = await Product.find().lean();

    res.status(200).json(products);

  } catch (err) {
    console.error("❌ GET PRODUCTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch products" });
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

    res.json(product);

  } catch (err) {
    console.error("❌ GET PRODUCT ERROR:", err);
    res.status(500).json({ message: "Failed to fetch product" });
  }
};

/* ─────────────────────────────────────────────
   CREATE PRODUCT
───────────────────────────────────────────── */
exports.createProduct = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("FILES:", req.files?.length);

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
      return res.status(400).json({ message: "Required fields missing" });
    }

    let imageUrls = [];

    // ✅ Existing images (for edit reuse if needed)
    if (req.body.existingImages) {
      try {
        imageUrls = JSON.parse(req.body.existingImages);
      } catch {
        imageUrls = [];
      }
    }

    // ✅ New uploaded images (already uploaded to Cloudinary)
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path);
      imageUrls.push(...newImages);
    }

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
      images: imageUrls
    });

    res.status(201).json(product);

  } catch (err) {
    console.error("❌ CREATE PRODUCT ERROR:", err);
    res.status(500).json({ message: err.message });
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

    let imageUrls = [];

    // ✅ Existing images
    if (req.body.existingImages) {
      try {
        imageUrls = JSON.parse(req.body.existingImages);
      } catch {
        imageUrls = [];
      }
    }

    // ✅ New images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path);
      imageUrls.push(...newImages);
    }

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
        images: imageUrls
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updated);

  } catch (err) {
    console.error("❌ UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ message: err.message });
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

    res.json({ message: "Product deleted successfully" });

  } catch (err) {
    console.error("❌ DELETE PRODUCT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

/* ─────────────────────────────────────────────
   GET REVIEWS (SAFE PLACEHOLDER)
───────────────────────────────────────────── */
exports.getReviews = async (req, res) => {
  try {
    res.json([]);
  } catch (err) {
    console.error("❌ GET REVIEWS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
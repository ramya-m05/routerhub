const Product = require("../models/Product");

// ✅ ADD PRODUCT
exports.addProduct = async (req, res) => {
  try {
    const { name, category, description, price, stock } = req.body;

    // Validation
    if (!name || !category || !price || !stock) {
      return res.status(400).json({ message: "Name, category, price, stock required" });
    }

    // 🔴 CRASH FIX — req.file can be undefined if no image uploaded
    const imageUrl = req.file ? req.file.path : "";

    const product = new Product({
      name,
      category,
      description,
      price,
      stock,
      image: imageUrl
    });

    await product.save();
    res.status(201).json(product);

  } catch (err) {
    console.error("Add product error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET ALL PRODUCTS (with search + category filter)
exports.getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;

    let filter = {};

    if (category && category !== "All") {
      filter.category = category;
    }

    if (search) {
      filter.name = { $regex: search, $options: "i" }; // case-insensitive
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);

  } catch (err) {
    console.error("Get products error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ GET SINGLE PRODUCT
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);

  } catch (err) {
    console.error("Get product error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ UPDATE PRODUCT (safe — only allow known fields)
exports.updateProduct = async (req, res) => {
  try {
    const { name, category, description, price, stock, image } = req.body;

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      { name, category, description, price, stock, image },
      { new: true, runValidators: true } // ✅ runs schema validation on update
    );

    if (!updated) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(updated);

  } catch (err) {
    console.error("Update product error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ✅ DELETE PRODUCT
exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted ✅" });

  } catch (err) {
    console.error("Delete product error:", err.message);
    res.status(500).json({ message: err.message });
  }
};
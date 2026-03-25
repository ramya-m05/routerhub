const mongoose = require("mongoose");

if (mongoose.models.Product) {
  module.exports = mongoose.model("Product");
} else {
  const productSchema = new mongoose.Schema({
    name:        { type: String, required: true },
    category:    { type: String, required: true },
    description: { type: String },
    price:       { type: Number, required: true },
    stock:       { type: Number, required: true },
    image:       { type: String }
  }, { timestamps: true });

  module.exports = mongoose.model("Product", productSchema);
}
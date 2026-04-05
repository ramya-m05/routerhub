const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  name:    { type: String, default: "Customer" },
  rating:  { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  verified: { type: Boolean, default: true } // true = confirmed buyer
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name:          { type: String, required: true, trim: true },
  category:      { type: String, required: true },
  description:   { type: String, default: "" },

  // Pricing
  price:         { type: Number, required: true },     // selling price
  originalPrice: { type: Number, default: null },      // MRP / strike-through price

  stock:         { type: Number, required: true, default: 0 },
  image:         { type: String, default: "" },

  // Extra info
  brand:         { type: String, default: "" },
  sku:           { type: String, default: "" },
  deliveryDays:  { type: Number, default: 5 },         // working days

  reviews:       [reviewSchema]
}, { timestamps: true });

// Virtual: average rating
productSchema.virtual("avgRating").get(function () {
  if (!this.reviews.length) return 0;
  const sum = this.reviews.reduce((s, r) => s + r.rating, 0);
  return (sum / this.reviews.length).toFixed(1);
});

productSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Product", productSchema);
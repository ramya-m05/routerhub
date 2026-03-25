const mongoose = require("mongoose");

if (mongoose.models.Order) {
  module.exports = mongoose.model("Order");
} else {
  const OrderSchema = new mongoose.Schema({
    user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items:   { type: Array, required: true },
    address: { type: String, required: true },
    phone:   { type: String, required: true },
    total:   { type: Number, required: true },
    status:  { type: String, default: "Pending" },
  }, { timestamps: true });

  module.exports = mongoose.model("Order", OrderSchema);
}

const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name:  { type: String, required: true },
  price: { type: Number, required: true },
  qty:   { type: Number, required: true, min: 1 },
  image: { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  items: [orderItemSchema],

  address: { type: String, default: "" },
  addressDetails: {
    doorNo: String,
    houseName: String,
    cross: String,
    landmark: String,
    city: String,
    district: String,
    pincode: String
  },

  phone: String,

  subtotal:    { type: Number, default: 0 },
  delivery:    { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },

  paymentMode: {
    type: String,
    enum: ["online", "cod"],
    default: "online"
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "advance_paid", "paid", "failed", "refunded"],
    default: "pending"
  },

  razorpayOrderId:   { type: String, default: "" },
  razorpayPaymentId: { type: String, default: "" },

  advancePaid: { type: Number, default: 0 },
  amountDueOnDelivery: { type: Number, default: 0 },

  status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "out_for_delivery",
      "delivered",
      "cancelled",
      "returned"
    ],
    default: "pending"
  },

  timeline: {
    ordered: { type: Date, default: Date.now },
    confirmed: Date,
    processing: Date,
    shipped: Date,
    out_for_delivery: Date,
    delivered: Date,
    cancelled: Date
  },

  confirmationEmailSent: { type: Boolean, default: false },
  deliveryEmailSent:     { type: Boolean, default: false },
  adminNotified:         { type: Boolean, default: false },

  notes: { type: String, default: "" }

}, { timestamps: true });

orderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
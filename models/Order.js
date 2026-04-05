const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name:      { type: String },
  price:     { type: Number },
  qty:       { type: Number },
  image:     { type: String }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  items: [orderItemSchema],

  // Full address string + breakdown
  address: { type: String, default: "" },
  addressDetails: {
    doorNo:    String,
    houseName: String,
    cross:     String,
    landmark:  String,
    city:      String,
    district:  String,
    pincode:   String
  },
  phone: { type: String },

  // Order totals
  subtotal:    { type: Number, default: 0 },
  delivery:    { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },

  // Payment
  paymentMode:   { type: String, enum: ["online", "cod"], default: "online" },
  paymentStatus: { type: String, enum: ["pending", "advance_paid", "paid", "failed", "refunded"], default: "pending" },
  razorpayOrderId:   { type: String, default: "" },
  razorpayPaymentId: { type: String, default: "" },

  // COD specific
  advancePaid:          { type: Number, default: 0 },
  amountDueOnDelivery:  { type: Number, default: 0 },

  // Delivery status — admin manages this
  status: {
    type: String,
    enum: ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"],
    default: "pending"
  },

  // Notification tracking
  confirmationEmailSent: { type: Boolean, default: false },
  deliveryEmailSent:     { type: Boolean, default: false },
  adminNotified:         { type: Boolean, default: false },

  // Timeline — set dates when status changes
  timeline: {
    ordered:         { type: Date, default: Date.now },
    confirmed:       { type: Date },
    processing:      { type: Date },
    shipped:         { type: Date },
    out_for_delivery:{ type: Date },
    delivered:       { type: Date },
    cancelled:       { type: Date }
  },

  notes: { type: String, default: "" }

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
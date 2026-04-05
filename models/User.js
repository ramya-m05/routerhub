const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const addressSchema = new mongoose.Schema({
  label:     { type: String, default: "Home" },
  doorNo:    { type: String },
  houseName: { type: String },
  cross:     { type: String },
  landmark:  { type: String },
  city:      { type: String, required: true },
  district:  { type: String, required: true },
  pincode:   { type: String, required: true },
  phone:     { type: String },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const userSchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, default: "" },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },

  isEmailVerified: { type: Boolean, default: false },

  otp:        { type: String, default: null },
  otpExpires: { type: Date,   default: null },
  otpFor:     { type: String, default: null },
  pendingEmail: { type: String, default: null },

  // ✅ CORRECT
  addresses: {
    type: [addressSchema],
    default: []
  },

  orderCount:    { type: Number, default: 0 },
  wishlistCount: { type: Number, default: 0 }

}, { timestamps: true });


// ✅ FIXED middleware (NO next())
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});


// ✅ password check
userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model("User", userSchema);
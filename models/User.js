// models/User.js
const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

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
  isDefault: { type: Boolean, default: false },
}, { _id: true });

const userSchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, default: "" },
  password: { type: String, required: true },

  role: { type: String, enum: ["user", "admin"], default: "user" },

  // Backwards compatibility with old admin accounts that used isAdmin:true
  isAdmin: { type: Boolean, default: false },

  isEmailVerified: { type: Boolean, default: false },

  // For OTP flows (email change, etc.)
  otp:          { type: String,  default: null },
  otpExpires:   { type: Date,    default: null },
  otpFor:       { type: String,  default: null },
  pendingEmail: { type: String,  default: null },

  addresses:    [addressSchema],
  orderCount:   { type: Number, default: 0 },
  wishlistCount:{ type: Number, default: 0 },
}, { timestamps: true });

/* ─────────────────────────────────────────────────
   PRE-SAVE HOOK
   Hashes the password ONLY when it has been modified.
   `isModified("password")` is false when you update
   other fields, so this never runs unnecessarily.

   ⚠️  IMPORTANT: never pass an already-hashed string
       to User.create() / user.save().
       Always pass the PLAIN TEXT password and let
       this hook do the hashing.
───────────────────────────────────────────────── */
userSchema.pre("save", async function (next) {
  // Only hash when password field was actually changed
  if (!this.isModified("password")) return next();

  // Extra safety guard — if it already looks hashed, skip
  // (this can happen with old data or migration scripts)
  if (this.password.startsWith("$2b$") || this.password.startsWith("$2a$")) {
    console.warn("⚠️  User pre-save: password looks already hashed — skipping re-hash for", this.email);
    return next();
  }

  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/* ─── Instance method for login comparison ── */
userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
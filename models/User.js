const mongoose = require("mongoose");

// Guard against model overwrite (safety net)
if (mongoose.models.User) {
  module.exports = mongoose.model("User");
} else {
  const UserSchema = new mongoose.Schema({
    name:      { type: String, required: true },
    email:     { type: String, required: true, unique: true },
    password:  { type: String, required: true },
    role:      { type: String, default: "user" },
    createdAt: { type: Date, default: Date.now }
  });

  module.exports = mongoose.model("User", UserSchema);
}
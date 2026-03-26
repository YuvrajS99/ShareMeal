const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },

  email: { type: String, required: true, unique: true },

  password: { type: String, required: true },

  phone: String,

  role: {
    type: String,
    enum: ["donor", "ngo", "admin"],
    default: "donor"
  },

  address: String,

  // NGO recommendation fields
  capacity: {
    type: Number,
    default: 50
  },

  rating: {
    type: Number,
    default: 4
  },

  location: {
    type: String,
    default: "Unknown"
  },

  notifications: [
    {
      message: { type: String, required: true },
      read: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
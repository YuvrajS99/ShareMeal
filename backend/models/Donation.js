const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  donorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  foodType: { type: String, required: true },
  quantity: { type: String, required: true },
  expiryTime: { type: Date, required: true },
  pickupAddress: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "accepted", "picked", "completed", "cancelled"],
    default: "pending"
  },
  ngoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  assignedNGO: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  // Optional food image path served from /uploads
  image: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model("Donation", donationSchema);
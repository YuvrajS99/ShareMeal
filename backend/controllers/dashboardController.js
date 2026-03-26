const Donation = require("../models/Donation");

exports.getDashboardStats = async (req, res) => {
  try {

    const total = await Donation.countDocuments();
    const pending = await Donation.countDocuments({ status: "pending" });
    const accepted = await Donation.countDocuments({ status: "accepted" });
    const picked = await Donation.countDocuments({ status: "picked" });
    const completed = await Donation.countDocuments({ status: "completed" });

    res.json({
      totalDonations: total,
      pending,
      accepted,
      picked,
      completed
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
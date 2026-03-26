const Donation = require("../models/Donation");
const User = require("../models/User");
const { findBestNGO } = require("../utils/ngoRecommendation");

// Create Donation
exports.createDonation = async (req, res) => {
  try {

    const { foodType, quantity, expiryTime, pickupAddress } = req.body;
    const imagePath = req.file
      ? `/uploads/donations/${req.file.filename}`
      : undefined;

    // find all NGOs
    const ngos = await User.find({ role: "ngo" });

    const { bestNGO } = findBestNGO(ngos, { pickupAddress, expiryTime });

    const donation = await Donation.create({
      donorId: req.user.id,
      foodType,
      quantity,
      expiryTime,
      pickupAddress,
      ngoId: bestNGO ? bestNGO._id : null,
      assignedNGO: bestNGO ? bestNGO._id : null,
      status: bestNGO ? "accepted" : "pending",
      image: imagePath
    });

    // If we auto-assigned and set status "accepted" immediately,
    // notify the donor right away.
    if (bestNGO && donation.status === "accepted") {
      const donor = await User.findById(req.user.id).select("notifications");
      if (donor) {
        donor.notifications = donor.notifications || [];
        donor.notifications.push({
          message: `Your donation was accepted by ${bestNGO.name} NGO`
        });
        await donor.save();
      }
    }

    res.status(201).json({
      message: "Donation created successfully",
      assignedNGO: bestNGO
        ? { _id: bestNGO._id, name: bestNGO.name, email: bestNGO.email }
        : null,
      donation
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user.id })
      .populate("donorId", "name email")
      .populate("assignedNGO", "name email")
      .populate("ngoId", "name email");

    const donationsWithAssignedNGO = donations.map((d) => {
      const obj = d.toObject();
      const ngoObj = obj.assignedNGO || obj.ngoId;
      obj.assignedNGO = ngoObj
        ? { _id: ngoObj._id, name: ngoObj.name, email: ngoObj.email }
        : null;
      return obj;
    });

    res.json({
      count: donationsWithAssignedNGO.length,
      donations: donationsWithAssignedNGO
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getPendingDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ status: "pending" }).populate("donorId", "name email phone");

    res.json({
      count: donations.length,
      donations
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



exports.getMyAcceptedDonations = async (req, res) => {
  try {
    const donations = await Donation.find({
      ngoId: req.user.id,
      status: "accepted"
    })
      .populate("donorId", "name email phone")
      .populate("ngoId", "name email");

    res.json({
      count: donations.length,
      donations
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// const Donation = require("../models/Donation");

exports.acceptDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation)
      return res.status(404).json({ message: "Donation not found" });

    if (donation.status !== "pending")
      return res.status(400).json({ message: "Donation already processed" });

    donation.status = "accepted";
    donation.ngoId = req.user.id;

    await donation.save();
    await donation.populate("ngoId", "name email");

    // Notify donor about acceptance.
    const ngo = await User.findById(req.user.id).select("name");
    const donor = await User.findById(donation.donorId).select("notifications");
    if (ngo && donor) {
      donor.notifications = donor.notifications || [];
      donor.notifications.push({
        message: `Your donation was accepted by ${ngo.name} NGO`
      });
      await donor.save();
    }

    res.json({ message: "Donation accepted", donation });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.markPicked = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation)
      return res.status(404).json({ message: "Donation not found" });

    if (donation.status !== "accepted")
      return res.status(400).json({ message: "Donation must be accepted first" });

    donation.status = "picked";

    await donation.save();
    await donation.populate("ngoId", "name email");

    // Notify donor about pickup.
    const ngo = await User.findById(donation.ngoId).select("name");
    const donor = await User.findById(donation.donorId).select("notifications");
    if (ngo && donor) {
      donor.notifications = donor.notifications || [];
      donor.notifications.push({
        message: `Your donation was picked by ${ngo.name} NGO`
      });
      await donor.save();
    }

    res.json({ message: "Donation marked as picked", donation });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.markCompleted = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation)
      return res.status(404).json({ message: "Donation not found" });

    if (donation.status !== "picked")
      return res.status(400).json({ message: "Food not picked yet" });

    donation.status = "completed";

    await donation.save();

    res.json({ message: "Donation completed", donation });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



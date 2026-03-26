const User = require("../models/User");
const Donation = require("../models/Donation");
const { findBestNGO } = require("../utils/ngoRecommendation");

exports.getRecommendedNGO = async (req, res) => {
  try {
    console.log("[RECOMMEND] API called /api/ngos/recommend");

    const ngos = await User.find({ role: "ngo" });

    if (ngos.length === 0) {
      return res.json({
        ngoName: "Not available",
        recommendedNGO: "Not available",
        score: 0,
        reason: "No NGO available",
        distanceKm: null
      });
    }

    const pickupAddress = req.query.pickupAddress || "";
    const expiryTime = req.query.expiryTime || "";

    const { bestNGO, bestScore, bestDistanceKm, bestReason } = findBestNGO(
      ngos,
      { pickupAddress, expiryTime }
    );

    res.json({
      ngoName: bestNGO?.name || "Not available",
      recommendedNGO: bestNGO?.name,
      email: bestNGO?.email,
      score: bestScore,
      distanceKm: bestDistanceKm,
      reason: bestReason
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

function extractCityFromAddress(address) {
  if (!address) return "";
  const parts = String(address)
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length === 0) return "";
  // Use last comma-separated segment as city-ish token.
  return parts[parts.length - 1].toLowerCase();
}

exports.assignRecommendationForDonation = async (req, res) => {
  try {
    const { donationId } = req.params;
    console.log("[RECOMMEND] API called /api/recommendation/:donationId", {
      donationId
    });

    const donation = await Donation.findById(donationId);
    if (!donation) {
      return res.status(404).json({ message: "Donation not found" });
    }

    const ngos = await User.find({ role: "ngo" });
    if (ngos.length === 0) {
      return res.json({
        ngoName: "Not available",
        score: 0,
        reason: "No NGO available"
      });
    }

    const donationCity = extractCityFromAddress(donation.pickupAddress);

    let selectedNGO = null;
    if (donationCity) {
      selectedNGO = ngos.find((ngo) =>
        String(ngo.location || "")
          .toLowerCase()
          .includes(donationCity)
      );
    }

    // Fallback to the first NGO if city match is unavailable.
    if (!selectedNGO) selectedNGO = ngos[0];

    console.log("[RECOMMEND] NGO selected", {
      donationId,
      ngoId: selectedNGO?._id,
      ngoName: selectedNGO?.name
    });

    donation.assignedNGO = selectedNGO._id;
    donation.ngoId = selectedNGO._id; // keep backward compatibility
    donation.status = "accepted";
    await donation.save();

    console.log("[RECOMMEND] Donation updated", {
      donationId,
      status: donation.status,
      assignedNGO: donation.assignedNGO
    });

    return res.json({
      ngoName: selectedNGO.name,
      score: 90,
      reason: donationCity
        ? "Matched by city fallback + availability"
        : "Assigned first available NGO"
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
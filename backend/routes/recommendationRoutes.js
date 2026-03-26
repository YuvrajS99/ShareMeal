const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const {
  getRecommendedNGO,
  assignRecommendationForDonation
} = require("../controllers/recommendationController");

router.get("/recommend", protect, getRecommendedNGO);
router.get("/:donationId", protect, assignRecommendationForDonation);

module.exports = router;
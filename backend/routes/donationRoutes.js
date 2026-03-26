const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
  createDonation,
  getMyDonations,
  getPendingDonations,
  acceptDonation,
  markPicked,
  markCompleted,
  getMyAcceptedDonations
} = require("../controllers/donationController");

// Multer config for food image uploads
const uploadDir = path.join(__dirname, "..", "uploads", "donations");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    const safeExt = ext.toLowerCase().slice(0, 10);
    const filename = `donation_${Date.now()}_${Math.random()
      .toString(16)
      .slice(2)}${safeExt}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files are allowed (jpg/png/webp/gif)"));
  }
});


/* Donor creates donation */
router.post(
  "/create",
  protect,
  authorizeRoles("donor"),
  upload.single("image"),
  createDonation
);


/* Donor views own donations */
router.get(
  "/my-donations",
  protect,
  authorizeRoles("donor"),
  getMyDonations
);


/* NGO views pending donations */
router.get(
  "/pending",
  protect,
  authorizeRoles("ngo"),
  getPendingDonations
);


/* NGO accepts donation */
router.patch(
  "/:id/accept",
  protect,
  authorizeRoles("ngo"),
  acceptDonation
);


/* NGO marks donation as picked */
router.patch(
  "/:id/picked",
  protect,
  authorizeRoles("ngo"),
  markPicked
);


/* NGO marks donation as completed */
router.patch(
  "/:id/completed",
  protect,
  authorizeRoles("ngo"),
  markCompleted
);


/* NGO views accepted donations */
router.get(
  "/accepted",
  protect,
  authorizeRoles("ngo"),
  getMyAcceptedDonations
);


module.exports = router;
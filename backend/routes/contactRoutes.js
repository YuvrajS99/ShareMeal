const express = require("express");
const router = express.Router();

const Contact = require("../models/Contact");

const {
  validateContactInput,
  sendContactConfirmationEmail
} = require("../controllers/contactController");

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body || {};
    console.log("[CONTACT] Received:", {
      name,
      email,
      messageLength: (message || "").length
    });

    const errors = validateContactInput({ name, email, message });
    if (errors.length > 0) {
      return res.status(400).json({ message: errors.join(" ") });
    }

    const newContact = new Contact({
      name: name.trim(),
      email: email.trim(),
      message: message.trim()
    });
    await newContact.save();

    await sendContactConfirmationEmail({ name: name.trim(), email: email.trim() });

    return res.json({
      message: "Message stored and email sent successfully"
    });
  } catch (err) {
    console.error("[CONTACT] Error:", err);
    return res.status(500).json({ message: err.message || "Failed to submit contact" });
  }
});

module.exports = router;


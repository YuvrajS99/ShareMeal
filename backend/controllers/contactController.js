const nodemailer = require("nodemailer");

// existing functions...
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateContactInput({ name, email, message }) {
  const errors = [];

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push("Name is required.");
  }

  if (!email || typeof email !== "string" || !isValidEmail(email.trim())) {
    errors.push("Valid email is required.");
  }

  if (typeof message !== "string" || message.trim().length < 5) {
    errors.push("Message is required.");
  }

  return errors;
}

// 🔥 transport builder
function buildTransport() {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) return null;

  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // important
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
}

// 🔥 THIS IS YOUR FUNCTION (PUT HERE)
async function sendContactConfirmationEmail({ name, email }) {
  const transport = buildTransport();

  if (!transport) {
    throw new Error("Email service not configured");
  }

  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  try {
    const info = await transport.sendMail({
      from,
      to: email.trim(),
      subject: "ShareMeal - We received your message",
      text: `Hi ${name},

Thank you for contacting ShareMeal.

We have received your message and will get back to you soon.

- ShareMeal Team`
    });

    console.log("✅ Email sent:", info.response);

  } catch (err) {
    console.error("❌ EMAIL ERROR:", err);
    throw err;
  }
}

// ✅ EXPORT EVERYTHING

module.exports = {
  validateContactInput,
  sendContactConfirmationEmail
};

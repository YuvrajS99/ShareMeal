const nodemailer = require("nodemailer");

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

  if (typeof message === "string" && message.length > 2000) {
    errors.push("Message is too long.");
  }

  return errors;
}

function buildTransport() {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
}

async function sendContactConfirmationEmail({ name, email }) {
  const transport = buildTransport();
  if (!transport) {
    throw new Error(
      "Email service is not configured. Please set EMAIL_USER and EMAIL_PASS in backend .env."
    );
  }

  const to = email.trim();
  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  const text = `Hi ${name}, thank you for contacting ShareMeal. Our team will reach out soon.`;

  await transport.sendMail({
    from,
    to,
    subject: "ShareMeal - We received your message",
    text
  });
}

module.exports = {
  validateContactInput,
  sendContactConfirmationEmail
};


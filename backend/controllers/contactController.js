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

  if (!emailUser || !emailPass) {
    console.error("❌ EMAIL ENV NOT SET");
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
}

async function sendContactEmails({ name, email, message }) {
  const transport = buildTransport();

  if (!transport) {
    throw new Error("Email service not configured");
  }

  const from = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  // 🔥 1. EMAIL TO YOU (IMPORTANT)
  await transport.sendMail({
    from,
    to: process.env.EMAIL_USER, // you receive this
    subject: "📩 New Contact Message - ShareMeal",
    text: `
New message received:

Name: ${name}
Email: ${email}

Message:
${message}
    `
  });

  // 🔥 2. CONFIRMATION TO USER
  await transport.sendMail({
    from,
    to: email,
    subject: "ShareMeal - We received your message",
    text: `Hi ${name},

Thank you for contacting ShareMeal.
We have received your message and will get back to you soon.

- ShareMeal Team`
  });

  console.log("✅ Emails sent successfully");
}

module.exports = {
  validateContactInput,
  sendContactEmails
};

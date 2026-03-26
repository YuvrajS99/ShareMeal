import React, { useState } from "react";
import { Mail, MessageSquare } from "lucide-react";
import { api } from "../services/api.js";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const payload = { name, email, message };
      await api.contact(payload);

      setName("");
      setEmail("");
      setMessage("");
      setSuccess("Message sent successfully. Thank you!");
    } catch (err) {
      setError(err?.message || "Failed to submit message");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="pageWrap">
      <section className="pageCard">
        <div className="pageHeader">
          <div>
            <h1 style={{ margin: 0 }}>Contact</h1>
            <div className="pageHint" style={{ marginTop: 6 }}>
              Send us a message and we will get back to you.
            </div>
          </div>
          <div className="pageIcon">
            <MessageSquare size={20} />
          </div>
        </div>

        <form className="form contactForm" onSubmit={onSubmit}>
          <div>
            <div className="fieldLabel">Name</div>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your name"
            />
          </div>

          <div>
            <div className="fieldLabel">Email</div>
            <div className="inputWithIcon">
              <Mail size={16} />
              <input
                className="input inputNoIcon"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <div className="fieldLabel">Message</div>
            <textarea
              className="input"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              placeholder="How can we help?"
            />
          </div>

          {error && <div className="errorBox">{error}</div>}
          {success && <div className="successBox">{success}</div>}

          <button className="primaryBtn" type="submit" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner" /> Sending...
              </>
            ) : (
              "Submit"
            )}
          </button>
        </form>
      </section>
    </div>
  );
}


import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("donor");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.register({ name, email, password, role });

      // After registering, ask user to login.
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="appShell">
      <div className="appMain">
        <div className="authWrap">
          <h1 className="authTitle">Create your account</h1>
          <div className="authSub">
            Join as a donor or an NGO to manage food donations.
          </div>

          <form className="form" onSubmit={onSubmit}>
            <div>
              <div className="fieldLabel">Name</div>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your full name"
                autoComplete="name"
              />
            </div>

            <div>
              <div className="fieldLabel">Email</div>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>

            <div>
              <div className="fieldLabel">Password</div>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            </div>

            <div>
              <div className="fieldLabel">Role</div>
              <select
                className="input"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="donor">Donor</option>
                <option value="ngo">NGO</option>
              </select>
            </div>

            <button className="primaryBtn" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Register"}
            </button>

            {error && <div className="errorBox">{error}</div>}

            <div className="pageHint" style={{ marginTop: 14 }}>
              Already have an account?{" "}
              <a
                href="/login"
                style={{ color: "var(--accent)", textDecoration: "none" }}
              >
                Login
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


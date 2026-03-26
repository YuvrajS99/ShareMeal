import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, decodeJwt, getToken, setToken } from "../services/api.js";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    const decoded = decodeJwt(token);
    if (!decoded?.role) return;
    navigate(decoded.role === "ngo" ? "/ngo" : "/donor", { replace: true });
  }, [navigate]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await api.login(email, password);
      if (!data?.token) throw new Error("Login failed: missing token");
      setToken(data.token);

      const role = data?.user?.role || decodeJwt(data.token)?.role;
      if (role === "ngo") navigate("/ngo", { replace: true });
      else navigate("/donor", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="appShell">
      <div className="appMain">
        <div className="authWrap">
          <h1 className="authTitle">Welcome to ShareMeal</h1>
          <div className="authSub">
            Donate food, manage pickups, reduce waste.
          </div>

          <form className="form" onSubmit={onSubmit}>
            <div>
              <div className="fieldLabel">Email</div>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
                autoComplete="current-password"
              />
            </div>

            <button className="primaryBtn" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>

            {error && <div className="errorBox">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
}


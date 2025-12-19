import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../utils/toast";
import "./css/Login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Please fill both fields.");
      return;
    }

    setLoading(true);
    try {
      await login(form);
      showToast("Welcome back! Login successful", "success");
      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || err.message || 'Unable to connect. Please check your internet connection.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-left">
          <h1>Welcome Back</h1>
          <p>Login to view your bookings and manage your trips</p>

          <form className="login-form" onSubmit={submit}>
            <label>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />

            <label>Password</label>
            <div className="password-input-container">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>

            {error && <div className="login-error">{error}</div>}

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "Signing In..." : "Login"}
            </button>
          </form>

          <div className="login-foot">
            <span>Don't have an account? </span>
            <Link to="/signup" className="link">Create one</Link>
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
              Test: admin@bb.com / admin123
            </div>
          </div>
        </div>

        <div className="login-right" aria-hidden>
          {/* decorative bus illustration or gradient */}
          <div className="bus-visual">
            <svg width="220" height="120" viewBox="0 0 220 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="30" width="200" height="60" rx="12" fill="#D32F2F" />
              <rect x="22" y="40" width="36" height="30" rx="4" fill="#fff" opacity="0.85" />
              <rect x="66" y="40" width="36" height="30" rx="4" fill="#fff" opacity="0.85" />
              <rect x="110" y="40" width="36" height="30" rx="4" fill="#fff" opacity="0.85" />
              <circle cx="46" cy="95" r="10" fill="#2B2B2B" />
              <circle cx="164" cy="95" r="10" fill="#2B2B2B" />
            </svg>
          </div>
          <div className="bus-caption">Fast • Safe • Reliable</div>
        </div>
      </div>
    </div>
  );
}

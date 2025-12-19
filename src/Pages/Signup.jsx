import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { showToast } from "../utils/toast";
import "./css/Signup.css";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.name || !form.email || !form.password) {
      setError("All fields are required.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await signup(form);
      showToast("Account created successfully! Welcome to BookMySeat!", "success");
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-card">

        {/* LEFT SECTION */}
        <div className="signup-left">
          <h1>Create Your Account</h1>
          <p>Join us and book your trips faster than ever</p>

          <form className="signup-form" onSubmit={submit}>
            <label>Full Name</label>
            <input
              name="name"
              type="text"
              value={form.name}
              placeholder="Your Name"
              onChange={handleChange}
            />

            <label>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              placeholder="you@example.com"
              onChange={handleChange}
            />

            <label>Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              placeholder="••••••••"
              onChange={handleChange}
            />

            {error && <div className="signup-error">{error}</div>}
            {success && <div className="signup-success">{success}</div>}

            <button className="signup-btn" type="submit" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="signup-foot">
            Already have an account?
            <Link to="/login" className="link"> Login</Link>
          </div>
        </div>

        {/* RIGHT SECTION */}
        <div className="signup-right">
          <div className="signup-illustration">
            <svg width="240" height="140" viewBox="0 0 220 120" fill="none">
              <rect x="6" y="30" width="200" height="60" rx="12" fill="#d32f2f" />
              <rect x="22" y="40" width="36" height="30" rx="4" fill="#fff" opacity="0.85" />
              <rect x="66" y="40" width="36" height="30" rx="4" fill="#fff" opacity="0.85" />
              <rect x="110" y="40" width="36" height="30" rx="4" fill="#fff" opacity="0.85" />
              <circle cx="46" cy="95" r="10" fill="#2B2B2B" />
              <circle cx="164" cy="95" r="10" fill="#2B2B2B" />
            </svg>
          </div>
          <div className="signup-caption">Safe • Secure • Simple</div>
        </div>

      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MessagePopup from "../Components/MessagePopup";
import "./css/Auth.css";

export default function Auth() {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [isProcessing, setIsProcessing] = useState(false);
  const { login, signup, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in (but not during processing)
  React.useEffect(() => {
    if (user && !isProcessing) {
      if (user.role === 'admin') navigate("/admin");
      else navigate("/");
    }
  }, [user, navigate, isProcessing]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setIsProcessing(true);

    // Validate inputs
    if (!form.email?.trim() || !form.password?.trim()) {
      setError("Please fill all fields.");
      setIsProcessing(false);
      return;
    }

    if (isSignup && !form.name?.trim()) {
      setError("Name is required for signup.");
      setIsProcessing(false);
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsProcessing(false);
      return;
    }

    if (!isSignup) {
      // LOGIN PROCESS
      try {
        console.log('🔐 Attempting login with:', { email: form.email, passwordLength: form.password.length });
        const loginData = { email: form.email.trim(), password: form.password };
        console.log('📤 Sending login request:', loginData);
        const user = await login(loginData);
        console.log('✅ Login successful, user:', user);
        
        setPopup({ show: true, message: "Successfully Logged In!", type: "success" });
        setIsProcessing(false);
        
        // Redirect based on role immediately
        if (user.role === 'admin') {
          console.log('🔄 Redirecting to admin panel');
          navigate("/admin");
        } else {
          console.log('🔄 Redirecting to home');
          navigate("/");
        }
      } catch (err) {
        setIsProcessing(false);
        console.error('❌ Login error:', err);
        
        const errorMsg = err.response?.data?.message || err.message;
        if (errorMsg === "Invalid credentials") {
          setError("Account not found. Please create a new account.");
          setIsSignup(true);
        } else {
          setError(errorMsg || "Login failed. Please try again.");
        }
      }
    } else {
      // SIGNUP PROCESS
      try {
        console.log('📝 Attempting signup with:', { name: form.name, email: form.email });
        const user = await signup({ 
          name: form.name.trim(), 
          email: form.email.trim(), 
          password: form.password 
        });
        console.log('✅ Signup successful, user:', user);
        
        if (user) {
          setPopup({ show: true, message: "Account created successfully!", type: "success" });
          setIsProcessing(false);
          
          // Redirect based on role immediately
          if (user.role === 'admin') {
            console.log('🔄 Redirecting new admin to admin panel');
            navigate("/admin");
          } else {
            console.log('🔄 Redirecting new user to home');
            navigate("/");
          }
        } else {
          setIsProcessing(false);
          setError("Signup failed - please try again.");
        }
      } catch (err) {
        setIsProcessing(false);
        console.error('❌ Signup error:', err);
        
        const errorMsg = err.response?.data?.message || err.message;
        if (errorMsg === "Email already exists. Please login.") {
          setError("Account already exists. Please login with your password.");
          setIsSignup(false);
        } else {
          setError(errorMsg || "Signup failed. Please try again.");
        }
      }
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-content">
          <h2>{isSignup ? "Create Account" : "Welcome!"}</h2>
          <p>{isSignup ? "Join us for easy bus booking" : "Enter your credentials to continue"}</p>

          <form className="auth-form" onSubmit={submit}>
            {isSignup && (
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  id="fullName"
                  name="name"
                  type="text"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete={isSignup ? "new-password" : "current-password"}
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button className="auth-btn" type="submit" disabled={isProcessing}>
              {isProcessing ? "Processing..." : (isSignup ? "Create Account" : "Continue")}
            </button>

            {!isSignup && (
              <p className="switch-mode">
                Don't have an account? 
                <button type="button" className="link-btn" onClick={() => setIsSignup(true)}>
                  Sign up here
                </button>
              </p>
            )}

            {isSignup && (
              <p className="switch-mode">
                Already have an account? 
                <button type="button" className="link-btn" onClick={() => setIsSignup(false)}>
                  Login here
                </button>
              </p>
            )}
          </form>
        </div>
      </div>

      {popup.show && (
        <MessagePopup
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup({ show: false, message: "", type: "" })}
        />
      )}
    </div>
  );
}
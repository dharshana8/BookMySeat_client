import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./css/Header.css";
import { useAuth } from "../context/AuthContext";
import logoImg from "../assets/bookMySeat.png";

export default function Header(){
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [notification, setNotification] = useState({ show: false, message: "", type: "info" });

  const showNotification = (message, type = "info") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "info" }), 4000);
  };

  return (
    <header className="site-header">
      <div className="container header-row">
        <div className="nav-controls">
          <button 
            onClick={() => navigate(-1)} 
            className="nav-btn back-btn"
            title="Go Back"
          >
            ← Back
          </button>
          <button 
            onClick={() => navigate(1)} 
            className="nav-btn forward-btn"
            title="Go Forward"
          >
            Forward →
          </button>
        </div>
        <div className="logo">
          <Link to="/">
            <img src={logoImg} alt="BookMySeat" className="logo-img" />
          </Link>
        </div>
        <nav className={`main-nav ${open ? 'open' : ''}`}>
          <Link to="/" onClick={() => setOpen(false)}>Home</Link>
          <Link to="/search" onClick={() => setOpen(false)}>Search</Link>
          <Link to="/my-account" onClick={() => setOpen(false)}>My Account</Link>
          {user?.role === "admin" && <Link to="/admin" onClick={() => setOpen(false)}>Admin Panel</Link>}
          {user ? (<>
            <button className="btn small" onClick={()=>{ logout(); setOpen(false); }}>Logout</button>
          </>) : (<>
            <Link to="/login" onClick={() => setOpen(false)}>Login / Sign Up</Link>
          </>)}
        </nav>

        <div className="hamburger-menu">
          <button className="hamburger hide-md" onClick={()=>setOpen(o=>!o)} aria-label="menu">
            ☰
          </button>
          {open && (
            <div className="dropdown-menu">
              <div className="dropdown-header">
                <h4>Quick Actions</h4>
              </div>
              <div className="dropdown-item" onClick={() => {navigate('/'); setOpen(false);}}>
                🏠 Home
              </div>
              <div className="dropdown-item" onClick={() => {navigate('/search'); setOpen(false);}}>
                🔍 Search Buses
              </div>
              {user && (
                <div className="dropdown-item" onClick={() => {navigate('/my-account'); setOpen(false);}}>
                  👤 My Account
                </div>
              )}
              {user?.role === "admin" && (
                <div className="dropdown-item" onClick={() => {navigate('/admin'); setOpen(false);}}>
                  ⚙️ Admin Panel
                </div>
              )}
              <div className="dropdown-divider"></div>
              <div className="dropdown-item" onClick={() => {window.open('tel:+911234567890'); setOpen(false);}}>
                📞 Call Support
              </div>
              <div className="dropdown-item" onClick={() => {window.open('mailto:support@bookmyseat.com'); setOpen(false);}}>
                ✉️ Email Support
              </div>
              <div className="dropdown-item" onClick={() => {showNotification('BookMySeat v1.0 - Your trusted travel partner', 'info'); setOpen(false);}}>
                ℹ️ About
              </div>
              {user ? (
                <div className="dropdown-item logout" onClick={() => {logout(); setOpen(false);}}>
                  🚪 Logout
                </div>
              ) : (
                <div className="dropdown-item" onClick={() => {navigate('/login'); setOpen(false);}}>
                  🔑 Login
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification({ show: false, message: "", type: "info" })} className="close-btn">×</button>
        </div>
      )}
    </header>
  );
}

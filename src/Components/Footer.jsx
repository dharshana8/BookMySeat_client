import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./css/Footer.css";

export default function Footer() {
  const { user } = useAuth();
  const [helpForm, setHelpForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "",
    message: "",
    type: "complaint"
  });
  const [showHelpForm, setShowHelpForm] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Store in localStorage for admin to see
    const helpTickets = JSON.parse(localStorage.getItem("help_tickets") || "[]");
    const newTicket = {
      id: "HELP-" + Date.now(),
      ...helpForm,
      createdAt: new Date().toISOString(),
      status: "Open"
    };
    
    helpTickets.push(newTicket);
    localStorage.setItem("help_tickets", JSON.stringify(helpTickets));
    
    alert("Your request has been submitted. We'll get back to you soon!");
    setHelpForm({ name: "", email: "", subject: "", message: "", type: "complaint" });
    setShowHelpForm(false);
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>BookMySeat</h3>
          <p>Your trusted travel partner for comfortable and safe bus journeys across India.</p>
          <div className="contact-info">
            <p>Email: support@bookmyseat.com</p>
            <p>Phone: +91 98765 43210</p>
          </div>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/search">Search Buses</a></li>
            <li><a href="/my-account">My Account</a></li>
            <li><a href="#" onClick={() => setShowHelpForm(true)}>Help & Support</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Services</h4>
          <ul>
            <li>Bus Booking</li>
            <li>Seat Selection</li>
            <li>Live Tracking</li>
            <li>24/7 Support</li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Need Help?</h4>
          <button 
            className="help-btn"
            onClick={() => setShowHelpForm(true)}
          >
            Contact Support
          </button>
          <p>We're here to help with any questions or issues.</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 BookMySeat. All rights reserved.</p>
      </div>

      {/* Help Form Modal */}
      {showHelpForm && (
        <div className="modal-overlay" onClick={() => setShowHelpForm(false)}>
          <div className="help-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Help & Support</h3>
              <button className="close-btn" onClick={() => setShowHelpForm(false)}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="help-form">
              <div className="form-group">
                <label>Type</label>
                <select 
                  value={helpForm.type} 
                  onChange={(e) => setHelpForm({...helpForm, type: e.target.value})}
                >
                  <option value="complaint">Complaint</option>
                  <option value="help">Help Request</option>
                  <option value="feedback">Feedback</option>
                  <option value="refund">Refund Request</option>
                </select>
              </div>

              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={helpForm.name}
                  onChange={(e) => setHelpForm({...helpForm, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={helpForm.email}
                  onChange={(e) => setHelpForm({...helpForm, email: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  value={helpForm.subject}
                  onChange={(e) => setHelpForm({...helpForm, subject: e.target.value})}
                  placeholder="Brief description of your issue"
                  required
                />
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  value={helpForm.message}
                  onChange={(e) => setHelpForm({...helpForm, message: e.target.value})}
                  placeholder="Please describe your issue in detail..."
                  rows="4"
                  required
                ></textarea>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowHelpForm(false)}>Cancel</button>
                <button type="submit">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </footer>
  );
}
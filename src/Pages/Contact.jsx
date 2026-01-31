import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './css/Contact.css';

export default function Contact() {
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });

  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: 'info' }), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Block submission if not logged in
    if (!user || !token) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/contact/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSuccess(true);
        setFormData({ name: user?.name || '', email: user?.email || '', subject: '', message: '' });
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err) {
      // Silent fail - no alerts
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        <div className="contact-header">
          <h1>Contact & Support</h1>
          <p>Need help? We're here to assist you with any questions or issues.</p>
        </div>

        <div className="contact-content">
          <div className="contact-info">
            <h3>Get in Touch</h3>
            <div className="info-item">
              <span className="icon">📧</span>
              <div>
                <strong>Email Support</strong>
                <p>support@bookmyseat.com</p>
              </div>
            </div>
            <div className="info-item">
              <span className="icon">📞</span>
              <div>
                <strong>Phone Support</strong>
                <p>+91 1800-123-4567</p>
              </div>
            </div>
            <div className="info-item">
              <span className="icon">🕒</span>
              <div>
                <strong>Support Hours</strong>
                <p>24/7 Customer Support</p>
              </div>
            </div>
          </div>

          <div className="contact-form-section">
            <h3>Submit a Support Request</h3>
            {user && (
              <div className="existing-tickets-link">
                <p>Already have a support ticket? <a href="/support-tickets">View your tickets</a></p>
              </div>
            )}
            {!user ? (
              <div className="login-prompt">
                <p>Please <a href="/login">login</a> to submit a support request.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="Booking Issue">Booking Issue</option>
                    <option value="Payment Problem">Payment Problem</option>
                    <option value="Cancellation Request">Cancellation Request</option>
                    <option value="Bus Delay/Schedule">Bus Delay/Schedule</option>
                    <option value="Refund Request">Refund Request</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Complaint">Complaint</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    rows="5"
                    placeholder="Please describe your issue or question in detail..."
                    required
                  ></textarea>
                </div>
                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
                {success && (
                  <div className="success-message">
                    ✅ Support request submitted successfully!
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
        
        {notification.show && (
          <div className={`notification ${notification.type}`}>
            <span>{notification.message}</span>
            <button onClick={() => setNotification({ show: false, message: '', type: 'info' })} className="close-btn">×</button>
          </div>
        )}
      </div>
    </div>
  );
}
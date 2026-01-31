import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './css/SupportTickets.css';

export default function SupportTickets() {
  const { user, token } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [feedback, setFeedback] = useState({
    satisfied: null,
    rating: 0,
    comment: ''
  });
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  useEffect(() => {
    if (user && token) {
      fetchTickets();
    }
  }, [user, token]);

  const fetchTickets = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/contact/my-tickets', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return '#ff6b6b';
      case 'In Progress': return '#ffa726';
      case 'Resolved': return '#66bb6a';
      case 'Closed': return '#9e9e9e';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return '🔴';
      case 'In Progress': return '🟡';
      case 'Resolved': return '✅';
      case 'Closed': return '⚫';
      default: return '❓';
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!selectedTicket || feedback.satisfied === null || feedback.rating === 0) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/contact/${selectedTicket._id}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(feedback)
      });

      if (response.ok) {
        setShowFeedbackModal(false);
        setFeedback({ satisfied: null, rating: 0, comment: '' });
        setSelectedTicket(null);
        fetchTickets(); // Refresh tickets
      }
    } catch (err) {
      console.error('Error submitting feedback:', err);
    }
  };

  const openFeedbackModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowFeedbackModal(true);
  };

  if (!user) {
    return (
      <div className="support-tickets-page">
        <div className="login-required">
          <h2>Login Required</h2>
          <p>Please <a href="/login">login</a> to view your support tickets.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="support-tickets-page">
        <div className="loading">Loading your support tickets...</div>
      </div>
    );
  }

  return (
    <div className="support-tickets-page">
      <div className="tickets-container">
        <div className="tickets-header">
          <h1>My Support Tickets</h1>
          <p>Track the status of your support requests and provide feedback</p>
        </div>

        {tickets.length === 0 ? (
          <div className="no-tickets">
            <h3>No Support Tickets</h3>
            <p>You haven't submitted any support requests yet.</p>
            <a href="/contact" className="submit-ticket-btn">🆕 Submit Your First Ticket</a>
          </div>
        ) : (
          <>
            <div className="tickets-list">
              {tickets.map(ticket => (
                <div key={ticket._id} className="ticket-card">
                  <div className="ticket-header">
                    <div className="ticket-info">
                      <h3>{ticket.subject}</h3>
                      <div className="ticket-meta">
                        <span className="ticket-id">#{ticket._id.slice(-6)}</span>
                        <span className="ticket-date">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="ticket-status">
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getStatusColor(ticket.status) }}
                      >
                        {getStatusIcon(ticket.status)} {ticket.status}
                      </span>
                    </div>
                  </div>

                  <div className="ticket-content">
                    <div className="original-message">
                      <strong>Your Message:</strong>
                      <p>{ticket.message}</p>
                    </div>

                    {ticket.adminResponse && (
                      <div className="admin-response">
                        <strong>Support Response:</strong>
                        <p>{ticket.adminResponse}</p>
                        {ticket.respondedBy && (
                          <div className="response-meta">
                            <small>
                              Responded by {ticket.respondedBy.name} on{' '}
                              {new Date(ticket.respondedAt).toLocaleString()}
                            </small>
                          </div>
                        )}
                      </div>
                    )}

                    {ticket.userFeedback ? (
                      <div className="feedback-given">
                        <strong>Your Feedback:</strong>
                        <div className="feedback-details">
                          <span className={`satisfaction ${ticket.userFeedback.satisfied ? 'satisfied' : 'not-satisfied'}`}>
                            {ticket.userFeedback.satisfied ? '😊 Satisfied' : '😞 Not Satisfied'}
                          </span>
                          <span className="rating">
                            {'⭐'.repeat(ticket.userFeedback.rating)}
                          </span>
                          {ticket.userFeedback.comment && (
                            <p className="feedback-comment">{ticket.userFeedback.comment}</p>
                          )}
                        </div>
                      </div>
                    ) : ticket.status === 'Resolved' && (
                      <div className="feedback-prompt">
                        <p>How was our support? Please provide feedback:</p>
                        <button 
                          className="feedback-btn"
                          onClick={() => openFeedbackModal(ticket)}
                        >
                          Give Feedback
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="tickets-footer">
              <a href="/contact" className="submit-new-ticket">
                📝 Submit New Support Ticket
              </a>
            </div>
          </>
        )}
      </div>

      {showFeedbackModal && (
        <div className="feedback-modal-overlay">
          <div className="feedback-modal">
            <div className="modal-header">
              <h3>Provide Feedback</h3>
              <button 
                className="close-btn"
                onClick={() => setShowFeedbackModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="feedback-question">
                <p>Were you satisfied with our support?</p>
                <div className="satisfaction-buttons">
                  <button 
                    className={`satisfaction-btn ${feedback.satisfied === true ? 'selected' : ''}`}
                    onClick={() => setFeedback({...feedback, satisfied: true})}
                  >
                    😊 Yes, Satisfied
                  </button>
                  <button 
                    className={`satisfaction-btn ${feedback.satisfied === false ? 'selected' : ''}`}
                    onClick={() => setFeedback({...feedback, satisfied: false})}
                  >
                    😞 No, Not Satisfied
                  </button>
                </div>
              </div>

              <div className="rating-section">
                <p>Rate our support (1-5 stars):</p>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      className={`star ${feedback.rating >= star ? 'selected' : ''}`}
                      onClick={() => setFeedback({...feedback, rating: star})}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
              </div>

              <div className="comment-section">
                <label>Additional Comments (Optional):</label>
                <textarea
                  value={feedback.comment}
                  onChange={(e) => setFeedback({...feedback, comment: e.target.value})}
                  placeholder="Tell us more about your experience..."
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button 
                  className="cancel-btn"
                  onClick={() => setShowFeedbackModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="submit-feedback-btn"
                  onClick={handleFeedbackSubmit}
                  disabled={feedback.satisfied === null || feedback.rating === 0}
                >
                  Submit Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
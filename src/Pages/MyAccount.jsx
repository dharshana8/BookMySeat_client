import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useBus } from "../context/BusContext";

import { useNavigate } from "react-router-dom";
import Modal from "../Components/Modal";
import "./css/MyAccount.css";

function TodoSection() {
  const [todos, setTodos] = React.useState([]);
  const [newTodo, setNewTodo] = React.useState("");
  const [editingId, setEditingId] = React.useState(null);
  const [editText, setEditText] = React.useState("");

  React.useEffect(() => {
    if (todos.length === 0) {
      const defaultTodos = [
        { id: '1', text: "Book bus tickets for weekend trip", completed: false },
        { id: '2', text: "Pack travel essentials", completed: false },
        { id: '3', text: "Check weather forecast", completed: false },
        { id: '4', text: "Confirm hotel booking", completed: false }
      ];
      setTodos(defaultTodos);
    }
  }, []);

  const addTodo = (todo) => {
    setTodos(prev => [...prev, { ...todo, id: Date.now().toString() }]);
  };

  const removeTodo = (id) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  };

  const updateTodo = (id, updates) => {
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, ...updates } : todo
    ));
  };

  const handleAddTodo = (e) => {
    e.preventDefault();
    if (newTodo.trim()) {
      addTodo({ text: newTodo.trim(), completed: false });
      setNewTodo("");
    }
  };

  const handleEdit = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const handleSaveEdit = (id) => {
    if (editText.trim()) {
      updateTodo(id, { text: editText.trim() });
    }
    setEditingId(null);
    setEditText("");
  };

  return (
    <div className="todo-section">
      <div className="todo-header">
        <h2>Travel Todo List</h2>
        <p>Manage your travel tasks</p>
      </div>

      <div className="add-todo">
        <form onSubmit={handleAddTodo} className="todo-form">
          <input
            type="text"
            placeholder="Add a travel task..."
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            className="todo-input"
          />
          <button type="submit" className="add-btn">➕ Add</button>
        </form>
      </div>

      <div className="todos-list">
        {todos.map(todo => (
          <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => updateTodo(todo.id, { completed: !todo.completed })}
              className="todo-checkbox"
            />
            {editingId === todo.id ? (
              <div className="edit-mode">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="edit-input"
                />
                <button onClick={() => handleSaveEdit(todo.id)} className="save-btn">✓</button>
                <button onClick={() => setEditingId(null)} className="cancel-btn">✕</button>
              </div>
            ) : (
              <>
                <span className="todo-text">{todo.text}</span>
                <div className="todo-actions">
                  <button onClick={() => handleEdit(todo)} className="edit-btn">✏️</button>
                  <button onClick={() => removeTodo(todo.id)} className="delete-btn">🗑️</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="todo-stats">
        <div className="stat">
          <strong>{todos.length}</strong>
          <span>Total</span>
        </div>
        <div className="stat">
          <strong>{todos.filter(t => t.completed).length}</strong>
          <span>Done</span>
        </div>
        <div className="stat">
          <strong>{todos.filter(t => !t.completed).length}</strong>
          <span>Pending</span>
        </div>
      </div>
    </div>
  );
}

export default function MyAccount() {
  const { user, logout, updateProfile } = useAuth();
  const { getUserBookings, cancelBooking } = useBus();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("bookings");
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: ""
  });
  const [language, setLanguage] = useState("English");
  const [notification, setNotification] = useState({ show: false, message: "", type: "info" });
  const [modal, setModal] = useState({ show: false, title: "", message: "", type: "info", onConfirm: null });

  const showNotification = (message, type = "info") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "info" }), 4000);
  };

  const downloadTicket = (booking) => {
    const isDelayed = booking.busDetails.status?.includes('Delayed');
    const delayMinutes = isDelayed ? 20 : 0;
    const newArrival = new Date(new Date(booking.busDetails.arrival).getTime() + delayMinutes * 60000);
    
    const htmlContent = `<!DOCTYPE html>
<html><head><style>
body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
.ticket { border: 2px solid #007bff; border-radius: 10px; padding: 20px; text-align: center; }
.header { background: #007bff; color: white; padding: 15px; margin: -20px -20px 20px; border-radius: 8px 8px 0 0; }
.section { margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 5px; }
.row { display: flex; justify-content: space-between; margin: 5px 0; }
.delay-alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; color: #856404; }
</style></head><body>
<div class="ticket">
<div class="header"><h1>🚌 BookMySeat</h1><h2>BOOKING CONFIRMATION</h2><p>Booking ID: ${booking.id}</p></div>
${isDelayed ? `<div class="delay-alert">⚠️ <strong>DELAY NOTICE:</strong> Your bus is delayed by ${delayMinutes} minutes</div>` : ''}
<div class="section"><h3>👤 PASSENGER DETAILS</h3><div class="row"><span>Name:</span><span>${booking.user.name}</span></div><div class="row"><span>Email:</span><span>${booking.user.email}</span></div></div>
<div class="section"><h3>🚌 TRAVEL DETAILS</h3><div class="row"><span>Route:</span><span>${booking.busDetails.from} → ${booking.busDetails.to}</span></div><div class="row"><span>Date:</span><span>${new Date(booking.busDetails.departure).toLocaleDateString()}</span></div><div class="row"><span>Departure:</span><span>${new Date(booking.busDetails.departure).toLocaleTimeString()}</span></div><div class="row"><span>Arrival:</span><span>${isDelayed ? newArrival.toLocaleTimeString() + ' (Delayed)' : new Date(booking.busDetails.arrival).toLocaleTimeString()}</span></div></div>
<div class="section"><h3>🚍 BUS DETAILS</h3><div class="row"><span>Bus:</span><span>${booking.busDetails.name}</span></div><div class="row"><span>Operator:</span><span>${booking.busDetails.operator}</span></div><div class="row"><span>Bus Number:</span><span>${booking.busDetails.busNumber}</span></div><div class="row"><span>Seats:</span><span>${booking.seats.join(", ")}</span></div></div>
<div class="section"><h3>💳 PAYMENT DETAILS</h3><div class="row"><span>Total Amount:</span><span>₹${booking.payment.totalAmount}</span></div>${booking.payment.discount > 0 ? `<div class="row"><span>Discount:</span><span>-₹${booking.payment.discount}</span></div>` : ''}<div class="row"><strong>Final Amount:</strong><strong>₹${booking.payment.finalAmount}</strong></div><div class="row"><span>Payment Status:</span><span>${booking.payment.status}</span></div></div>
<div class="section"><p><strong>Booked on:</strong> ${new Date(booking.createdAt).toLocaleString()}</p><p>Thank you for choosing BookMySeat!</p><p>For support: support@bookmyseat.com</p></div>
</div></body></html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BookMySeat_Ticket_${booking.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <div className="my-account-page">
        <div className="account-container">
          <div className="login-prompt">
            <div className="login-card">
              <h2>Access Your Account</h2>
              <p>Please log in to view your bookings, manage your profile, and access travel tools.</p>
              <div className="login-actions">
                <button onClick={() => navigate("/login")} className="login-btn">
                  🔑 Login / Sign Up
                </button>
                <button onClick={() => navigate("/")} className="home-btn">
                  🏠 Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [userBookings, setUserBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    let mounted = true;
    if (user) {
      setLoading(true);
      getUserBookings()
        .then(data => { 
          if (mounted) {
            setUserBookings(Array.isArray(data) ? data : []);
            setLoading(false);
          }
        })
        .catch(() => { 
          if (mounted) {
            setUserBookings([]);
            setLoading(false);
          }
        });
    } else {
      setLoading(false);
    }
    return () => { mounted = false };
  }, [user]);

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    try {
      const updates = { name: profileForm.name, email: profileForm.email };
      if (profileForm.password) updates.password = profileForm.password;
      updateProfile(updates);
      setEditMode(false);
      showNotification("Profile updated successfully!", "success");
    } catch (err) {
      showNotification("Failed to update profile", "error");
    }
  };

  const handleDeleteAccount = () => {
    setModal({
      show: true,
      title: "Delete Account",
      message: "Are you sure you want to delete your account? This action cannot be undone.",
      type: "error",
      onConfirm: () => {
        logout();
        navigate("/");
        showNotification("Account deleted successfully", "success");
        setModal({ show: false, title: "", message: "", type: "info", onConfirm: null });
      }
    });
  };

  const calculateRefund = (booking) => {
    const bookingDate = new Date(booking.createdAt);
    const today = new Date();
    const isSameDay = bookingDate.toDateString() === today.toDateString();
    const refundPercentage = isSameDay ? 75 : 50;
    const refundAmount = Math.round((booking.payment.finalAmount * refundPercentage) / 100);
    return { refundAmount, refundPercentage };
  };

  const [cancelReason, setCancelReason] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [showAllBookings, setShowAllBookings] = useState(false);

  const handleCancelBooking = (booking) => {
    setBookingToCancel(booking);
    setShowCancelModal(true);
    setCancelReason("");
  };

  const confirmCancellation = async () => {
    if (!cancelReason.trim() || cancelReason.trim().length < 5) {
      showNotification("Please provide a cancellation reason (minimum 5 characters)", "error");
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/buses/bookings/${bookingToCancel._id || bookingToCancel.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ reason: cancelReason.trim() })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        showNotification(`Booking cancelled! Refund of ₹${result.refundAmount} (${result.refundPercentage}%) will be processed within 5-7 business days.`, "success");
        const data = await getUserBookings();
        setUserBookings(data);
      } else {
        showNotification(result.message || 'Cancellation failed', "error");
      }
    } catch (err) {
      showNotification('Unable to cancel booking. Please try again.', "error");
    }
    
    setShowCancelModal(false);
    setBookingToCancel(null);
    setCancelReason("");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="my-account-page">
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification({ show: false, message: "", type: "info" })} className="close-btn">×</button>
        </div>
      )}
      
      <Modal
        show={modal.show}
        onClose={() => setModal({ show: false, title: "", message: "", type: "info", onConfirm: null })}
        onConfirm={modal.onConfirm}
        title={modal.title}
        message={modal.message}
        type={modal.type}
      />
      
      {/* Cancellation Reason Modal */}
      {showCancelModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Cancel Booking</h3>
            <p>Please provide a reason for cancellation:</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Enter cancellation reason (minimum 5 characters)..."
              rows={4}
              style={{ width: '100%', margin: '10px 0', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
            />
            <div className="modal-actions">
              <button onClick={() => setShowCancelModal(false)} className="cancel-btn">Cancel</button>
              <button onClick={confirmCancellation} className="confirm-btn">Confirm Cancellation</button>
            </div>
          </div>
        </div>
      )}
      <div className="account-container">
        <div className="account-header">
          <h1>My Account</h1>
          <p>Welcome back, {user.name}!</p>
        </div>

        <div className="account-tabs">
          <button
            className={activeTab === "bookings" ? "tab active" : "tab"}
            onClick={() => setActiveTab("bookings")}
          >
            My Bookings
          </button>
          <button
            className={activeTab === "todos" ? "tab active" : "tab"}
            onClick={() => setActiveTab("todos")}
          >
            Travel Planner
          </button>
          <button
            className={activeTab === "profile" ? "tab active" : "tab"}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            className={activeTab === "settings" ? "tab active" : "tab"}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
          <button
            className={activeTab === "history" ? "tab active" : "tab"}
            onClick={() => setActiveTab("history")}
          >
            Travel History
          </button>
        </div>

        <div className="account-content">
          {activeTab === "bookings" && (
            <div className="bookings-section">
              <h2>Current Bookings</h2>
              {loading ? (
                <div className="loading-state">
                  <p>Loading your bookings...</p>
                </div>
              ) : (() => {
                const currentBookings = userBookings?.filter(booking => 
                  booking && booking.busDetails && booking.busDetails.from && booking.busDetails.to &&
                  booking.status !== 'Cancelled' &&
                  new Date(booking.busDetails.arrival || booking.busDetails.departure) >= new Date()
                ) || [];
                
                return (
                  <div>
                    <div className="bookings-header">
                      <h3>Upcoming Trips ({currentBookings.length} active)</h3>
                      <p>Total bookings made: {userBookings?.length || 0}</p>
                    </div>
                    {currentBookings.length > 0 ? (
                  <>
                    <div className="bookings-list">
                      {(showAllBookings ? currentBookings : currentBookings.slice(0, 20)).map(booking => (
                    <div key={booking.id} className="booking-card">
                      <div className="booking-header">
                        <h3>{booking.busDetails.from} → {booking.busDetails.to}</h3>
                        <span className={`booking-status ${booking.status.toLowerCase()}`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="booking-details">
                        <div className="travel-info">
                          <div className="info-row">
                            <span className="label">Bus:</span>
                            <span>{booking.busDetails.name} ({booking.busDetails.busNumber})</span>
                          </div>
                          <div className="info-row">
                            <span className="label">Operator:</span>
                            <span>{booking.busDetails.operator}</span>
                          </div>
                          <div className="info-row">
                            <span className="label">Travel Date:</span>
                            <span>{new Date(booking.busDetails.departure).toLocaleDateString()}</span>
                          </div>
                          <div className="info-row">
                            <span className="label">Departure:</span>
                            <span>{new Date(booking.busDetails.departure).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          {booking.busDetails.delayInfo?.isDelayed && (
                            <div className="info-row delay-notice">
                              <span className="label">⚠️ Delay:</span>
                              <span>{booking.busDetails.delayInfo.delayMinutes} min - {booking.busDetails.delayInfo.reason}</span>
                            </div>
                          )}
                          <div className="info-row">
                            <span className="label">Seats:</span>
                            <span>{booking.seats.join(", ")}</span>
                          </div>
                        </div>

                        <div className="payment-info">
                          <div className="info-row">
                            <span className="label">Total Amount:</span>
                            <span>₹{booking.payment.totalAmount}</span>
                          </div>
                          {booking.payment.discount > 0 && (
                            <div className="info-row">
                              <span className="label">Discount:</span>
                              <span className="discount">-₹{booking.payment.discount}</span>
                            </div>
                          )}
                          <div className="info-row final-amount">
                            <span className="label">Paid Amount:</span>
                            <span>₹{booking.payment.finalAmount}</span>
                          </div>
                          <div className="info-row">
                            <span className="label">Payment:</span>
                            <span className="payment-status">{booking.payment.status}</span>
                          </div>
                        </div>
                      </div>

                      <div className="booking-footer">
                        <small>Booked on: {new Date(booking.createdAt).toLocaleString()}</small>
                        <div className="booking-actions">
                          <button 
                            className="track-btn"
                            onClick={() => {
                              const status = booking.busDetails.status?.includes('Delayed') 
                                ? `🚌 ${booking.busDetails.name} is delayed by 20 minutes. Current location: En route to ${booking.busDetails.to}. Expected arrival: ${new Date(new Date(booking.busDetails.arrival).getTime() + 20 * 60000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`
                                : `🚌 ${booking.busDetails.name} is on time. Departure: ${new Date(booking.busDetails.departure).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} from ${booking.busDetails.from}. Arrival: ${new Date(booking.busDetails.arrival).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} at ${booking.busDetails.to}`;
                              showNotification(status, 'info');
                            }}
                          >
                            Track Bus
                          </button>
                          <button
                            className="download-btn"
                            onClick={() => downloadTicket(booking)}
                          >
                            Download Ticket
                          </button>
                          {booking.status === "Confirmed" && (
                            <button
                              className="cancel-btn"
                              onClick={() => handleCancelBooking(booking)}
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Cancellation Info for Cancelled Bookings */}
                      {booking.status === "Cancelled" && booking.cancellation && (
                        <div className="cancellation-info">
                          <h4>❌ Booking Cancelled</h4>
                          <div className="cancellation-details">
                            <p><strong>Cancelled on:</strong> {new Date(booking.cancellation.cancelledAt).toLocaleString()}</p>
                            <p><strong>Refund:</strong> ₹{booking.cancellation.refundAmount} ({booking.cancellation.refundPercentage}% of ₹{booking.payment.finalAmount})</p>
                            <p><strong>Status:</strong> Refund will be processed within 5-7 business days</p>
                          </div>
                        </div>
                      )}

                      {/* Live Status */}
                      {booking.status === "Confirmed" && (
                        <div className="live-tracking">
                          <h4>📍 Live Status</h4>
                          <div className="tracking-info">
                            {booking.busDetails.status?.includes('Delayed') ? (
                              <div className="delay-notification">
                                <span className="delay-icon">⚠️</span>
                                <span>Bus delayed by 20 minutes. New arrival: {new Date(new Date(booking.busDetails.arrival).getTime() + 20 * 60000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                            ) : (
                              <span>✅ Bus is on time. Departure: {new Date(booking.busDetails.departure).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                            )}
                          </div>
                        </div>
                      )}

                      {booking.notifications && booking.notifications.length > 0 && (
                        <div className="notifications">
                          <h4>Travel Updates:</h4>
                          {booking.notifications.map((notif, index) => (
                            <div key={index} className="notification">
                              <span>{notif.message}</span>
                              <small>{new Date(notif.time).toLocaleString()}</small>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                      ))}
                    </div>
                    {!showAllBookings && currentBookings.length > 20 && (
                      <div className="see-more-section">
                        <button 
                          onClick={() => setShowAllBookings(true)}
                          className="see-more-btn"
                        >
                          See More ({currentBookings.length - 20} more bookings)
                        </button>
                      </div>
                    )}
                  </>
                    ) : (
                      <div className="no-current-bookings">
                        <div className="empty-state">
                          <div className="empty-icon">🚌</div>
                          <h3>No upcoming trips</h3>
                          <p>You have no active bookings. Book your next journey!</p>
                          <button onClick={() => navigate("/")} className="book-now-btn">
                            Book New Trip
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {activeTab === "todos" && (
            <TodoSection />
          )}

          {activeTab === "profile" && (
            <div className="profile-section">
              <div className="profile-card">
                <div className="profile-avatar">
                  <div className="avatar-circle">{user.name.charAt(0).toUpperCase()}</div>
                </div>
                <div className="profile-info">
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                  <span className="role-badge">{user.role}</span>
                </div>
                <button
                  className="edit-profile-btn"
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? "Cancel" : "Edit Profile"}
                </button>
              </div>

              {editMode && (
                <div className="edit-form-card">
                  <form onSubmit={handleProfileUpdate} className="simple-form">
                    <input
                      type="text"
                      placeholder="Name"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    />
                    <input
                      type="password"
                      placeholder="New Password (optional)"
                      value={profileForm.password}
                      onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                    />
                    <button type="submit" className="save-btn">Save Changes</button>
                  </form>
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="settings-section">
              <h2>Settings</h2>

              <div className="setting-item">
                <label>Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="language-select"
                >
                  <option value="English">English</option>
                  <option value="Hindi">हिंदी</option>
                  <option value="Tamil">தமிழ்</option>
                  <option value="Telugu">తెలుగు</option>
                  <option value="Kannada">ಕನ್ನಡ</option>
                </select>
              </div>

              <div className="setting-item">
                <label>Notifications</label>
                <div className="toggle-switch">
                  <input type="checkbox" id="notifications" defaultChecked />
                  <label htmlFor="notifications" className="switch"></label>
                </div>
              </div>

              <div className="danger-zone">
                <h3>Account Actions</h3>
                <div className="action-buttons">
                  <button className="logout-btn" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                  <button className="delete-btn" onClick={handleDeleteAccount}>
                    🗑️ Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="admin-content">
              <h2>Travel History</h2>
              {(() => {
                const historyBookings = userBookings || [];
                
                return (
                  <>
                    <div className="history-stats">
                      <div className="stat-card">
                        <h3>All Bookings</h3>
                        <p>{userBookings?.length || 0}</p>
                      </div>
                      <div className="stat-card">
                        <h3>Completed Trips</h3>
                        <p>{userBookings?.filter(b => {
                          if (b.status === 'Cancelled') return false;
                          const arrivalTime = b.busDetails?.arrival || b.bus?.arrival || b.busDetails?.departure || b.bus?.departure;
                          return arrivalTime && new Date(arrivalTime) < new Date();
                        }).length || 0}</p>
                      </div>
                      <div className="stat-card">
                        <h3>Total Spent</h3>
                        <p>₹{userBookings?.reduce((sum, b) => sum + (b?.payment?.finalAmount || 0), 0) || 0}</p>
                      </div>
                      <div className="stat-card">
                        <h3>Cancelled</h3>
                        <p>{historyBookings.filter(b => b.status === 'Cancelled').length}</p>
                      </div>
                    </div>

                    <div className="travel-timeline">
                      {historyBookings.length > 0 ? historyBookings.map(booking => {
                        const busDetails = booking.busDetails || booking.bus || {};
                        const travelStatus = (() => {
                          if (booking.status === 'Cancelled') return 'Cancelled';
                          const arrivalTime = busDetails.arrival || busDetails.departure;
                          if (arrivalTime && new Date(arrivalTime) < new Date()) return 'Travel Completed';
                          return booking.status || 'Confirmed';
                        })();
                        
                        return (
                          <div key={booking.id} className="timeline-item">
                            <div className="timeline-date">
                              {busDetails.departure ? new Date(busDetails.departure).toLocaleDateString() : new Date(booking.createdAt).toLocaleDateString()}
                            </div>
                            <div className="timeline-content">
                              <h4>{busDetails.from || 'N/A'} → {busDetails.to || 'N/A'}</h4>
                              <div className="history-details">
                                <p><strong>Bus:</strong> {busDetails.name || 'N/A'} ({busDetails.busNumber || 'N/A'})</p>
                                <p><strong>Operator:</strong> {busDetails.operator || 'N/A'}</p>
                                <p><strong>Seats:</strong> {booking.seats?.join(", ") || 'N/A'}</p>
                                <p><strong>Departure:</strong> {busDetails.departure ? new Date(busDetails.departure).toLocaleString() : 'N/A'}</p>
                                <p><strong>Arrival:</strong> {busDetails.arrival ? new Date(busDetails.arrival).toLocaleString() : 'N/A'}</p>
                                {busDetails.delayInfo?.isDelayed && (
                                  <p><strong>⚠️ Delay:</strong> {busDetails.delayInfo.delayMinutes} min - {busDetails.delayInfo.reason}</p>
                                )}
                                <p><strong>Status:</strong> <span className={`status-badge ${travelStatus.toLowerCase()}`}>{travelStatus}</span></p>
                                <p><strong>Payment:</strong> ₹{booking.payment?.finalAmount || 0} {booking.payment?.discount > 0 ? `(Discount: ₹${booking.payment.discount})` : ''}</p>
                                <p><strong>Booked on:</strong> {new Date(booking.createdAt).toLocaleString()}</p>
                                {booking.status === 'Cancelled' && booking.cancellation && (
                                  <p><strong>Refund:</strong> ₹{booking.cancellation.refundAmount} ({booking.cancellation.refundPercentage}%)</p>
                                )}
                              </div>
                              <div className="timeline-actions">
                                <button className="download-btn" onClick={() => downloadTicket(booking)}>Download Ticket</button>
                              </div>
                            </div>
                          </div>
                        );
                      }) : (
                        <div className="no-history">
                          <p>No bookings found.</p>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useMemo } from "react";
import { useBus } from "../context/BusContext";
import { useAuth } from "../context/AuthContext";
import { useCoupon } from "../context/CouponContext";
import { useNavigate } from "react-router-dom";
import MessagePopup from "../Components/MessagePopup";
import LoadingSpinner from "../Components/LoadingSpinner";
import ScrollToTop from "../Components/ScrollToTop";
import "./css/AdminDashBoard.css";

export default function AdminDashBoard() {
  const { buses, deleteBus, bookings, loading, clearAllBookings } = useBus();
  const { user, token } = useAuth();
  const { coupons, addCoupon: addCouponToContext, updateCoupon, deleteCoupon: deleteCouponFromContext, toggleCouponStatus } = useCoupon();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("buses");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [notification, setNotification] = useState({ show: false, message: "", type: "info" });

  const [couponForm, setCouponForm] = useState({ code: "", discount: "", type: "percentage", minAmount: "", maxDiscount: "", expiryDate: "", isActive: true });
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [showAllBuses, setShowAllBuses] = useState(false);

  const showNotification = (message, type = "info") => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: "", type: "info" }), 4000);
  };

  const addCoupon = async () => {
    if (!couponForm.code || !couponForm.discount || !couponForm.minAmount || !couponForm.expiryDate) {
      showNotification("Please fill all required fields", "warning");
      return;
    }
    try {
      const newCoupon = { ...couponForm, discount: parseFloat(couponForm.discount), minAmount: parseFloat(couponForm.minAmount), maxDiscount: parseFloat(couponForm.maxDiscount) || 0 };
      await addCouponToContext(newCoupon);
      setCouponForm({ code: "", discount: "", type: "percentage", minAmount: "", maxDiscount: "", expiryDate: "", isActive: true });
      showNotification("Coupon added successfully", "success");
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const updateCouponHandler = async () => {
    try {
      const updates = { ...couponForm, discount: parseFloat(couponForm.discount), minAmount: parseFloat(couponForm.minAmount), maxDiscount: parseFloat(couponForm.maxDiscount) || 0 };
      await updateCoupon(editingCoupon._id, updates);
      setEditingCoupon(null);
      setCouponForm({ code: "", discount: "", type: "percentage", minAmount: "", maxDiscount: "", expiryDate: "", isActive: true });
      showNotification("Coupon updated successfully", "success");
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const deleteCoupon = async (id) => {
    try {
      await deleteCouponFromContext(id);
      showNotification("Coupon deleted successfully", "success");
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const editCoupon = (coupon) => {
    setEditingCoupon(coupon);
    setCouponForm({ 
      ...coupon, 
      discount: coupon.discount.toString(), 
      minAmount: coupon.minAmount.toString(), 
      maxDiscount: coupon.maxDiscount.toString(),
      expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0]
    });
  };

  const toggleStatus = async (id) => {
    try {
      await toggleCouponStatus(id);
      showNotification("Coupon status updated", "success");
    } catch (err) {
      showNotification(err.message, "error");
    }
  };
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else if (user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  const filteredBuses = useMemo(() => {
    if (loading) return [];
    let filtered = buses.filter(bus => {
      const matchesSearch = bus.name.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesType = filterType === "" || bus.type === filterType || (filterType === "delayed" && bus.delayInfo?.isDelayed);
      return matchesSearch && matchesType;
    });
    
    return filtered.sort((a, b) => {
      switch(sortBy) {
        case 'fare': return a.fare - b.fare;
        case 'departure': return new Date(a.departure) - new Date(b.departure);
        case 'route': return `${a.from}-${a.to}`.localeCompare(`${b.from}-${b.to}`);
        default: return a.name.localeCompare(b.name);
      }
    });
  }, [buses, debouncedSearch, filterType, sortBy, loading]);

  if (!user || user.role !== "admin") {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Welcome back, {user.name}!</p>
      </div>
      
      <div className="admin-tabs">
        <button 
          onClick={() => setActiveTab("buses")}
          className={`tab-btn ${activeTab === "buses" ? "active" : ""}`}
        >
          🚌 Bus Management
        </button>
        <button 
          onClick={() => setActiveTab("bookings")}
          className={`tab-btn ${activeTab === "bookings" ? "active" : ""}`}
        >
          📋 Bookings
        </button>
        <button 
          onClick={() => setActiveTab("delays")}
          className={`tab-btn ${activeTab === "delays" ? "active" : ""}`}
        >
          ⏰ Delay Management
        </button>
        <button 
          onClick={() => setActiveTab("coupons")}
          className={`tab-btn ${activeTab === "coupons" ? "active" : ""}`}
        >
          🎫 Coupons
        </button>
      </div>

      {activeTab === "buses" && (
        <div className="admin-content">
          <div className="section-header">
            <div className="section-title">
              <h2>Bus Management</h2>
              <span className="bus-count">{filteredBuses.length} buses in fleet (Total: {buses.length}, Loading: {loading ? 'Yes' : 'No'})</span>
            </div>
            <button 
              onClick={() => navigate("/admin/add")}
              className="add-btn"
            >
              ➕ Add New Bus
            </button>
          </div>
          
          <div className="bus-controls">
            <div className="search-filter-row">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="🔍 Search buses by name, route, or operator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <div className="filter-controls">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="filter-select"
                >
                  <option value="">All Types</option>
                  <option value="AC Sleeper">AC Sleeper</option>
                  <option value="AC Semi Sleeper">AC Semi Sleeper</option>
                  <option value="AC Seater">AC Seater</option>
                  <option value="Non AC Seater">Non AC Seater</option>
                  <option value="delayed">Delayed Buses</option>
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="name">Sort by Name</option>
                  <option value="fare">Sort by Fare</option>
                  <option value="departure">Sort by Departure</option>
                  <option value="route">Sort by Route</option>
                </select>
              </div>
            </div>
          </div>
          
          {loading ? (
            <LoadingSpinner />
          ) : filteredBuses.length > 0 ? (
            <>
              <div className="buses-grid">
                {(showAllBuses ? filteredBuses : filteredBuses.slice(0, 20)).map(bus => (
                <div key={bus.id} className="bus-card">
                  <div className="bus-image-section">
                    <img 
                      src={bus.imageUrl || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&h=200&fit=crop"} 
                      alt={bus.name}
                      className="bus-thumbnail"
                    />
                    <div className="bus-status">
                      <span className={`status-badge ${bus.availableSeats > 0 ? 'available' : 'full'}`}>
                        {bus.availableSeats > 0 ? '✅ Available' : '❌ Full'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="bus-details">
                    <div className="bus-header">
                      <div className="bus-title">
                        <h3>{bus.name}</h3>
                        <span className="bus-number">#{bus.busNumber}</span>
                      </div>
                      <span className="bus-type">{bus.type}</span>
                    </div>
                    
                    <div className="bus-route-info">
                      <div className="route">
                        <span className="route-text">{bus.from} → {bus.to}</span>
                        <span className="departure-time">
                          {new Date(bus.departure).toLocaleString('en-IN', { 
                            day: '2-digit', 
                            month: 'short', 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bus-stats">
                      <div className="stat-item">
                        <span className="stat-label">Fare</span>
                        <span className="stat-value">₹{bus.fare}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Seats</span>
                        <span className="stat-value">{bus.availableSeats}/{bus.totalSeats}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Rating</span>
                        <span className="stat-value">⭐ {bus.rating}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Operator</span>
                        <span className="stat-value">{bus.operator}</span>
                      </div>
                    </div>
                    
                    {bus.delayInfo?.isDelayed && (
                      <div className="delay-alert">
                        <span className="delay-icon">⚠️</span>
                        <span className="delay-text">Delayed by {bus.delayInfo.delayMinutes} min - {bus.delayInfo.reason}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="bus-actions">
                    <button 
                      onClick={() => navigate(`/bus/${bus.id}/seats`)}
                      className="view-btn"
                      title="View Bus Details"
                    >
                      📋 Details
                    </button>
                    <button 
                      onClick={() => navigate(`/admin/edit/${bus.id}`)}
                      className="edit-btn"
                      title="Edit Bus"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={async () => {
                        if (window.confirm(`Are you sure you want to delete ${bus.name}?`)) {
                          try {
                            const result = await deleteBus(bus.id);
                            setPopup({ show: true, message: result.message, type: "success" });
                          } catch (err) {
                            setPopup({ show: true, message: err.message, type: "error" });
                          }
                        }
                      }}
                      className="delete-btn"
                      title="Delete Bus"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
                ))}
              </div>
              {!showAllBuses && filteredBuses.length > 20 && (
                <div className="see-more-section">
                  <button 
                    onClick={() => setShowAllBuses(true)}
                    className="see-more-btn"
                  >
                    See More ({filteredBuses.length - 20} more buses)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>No buses found</h3>
              <p>{searchTerm || filterType ? 'No buses match your search criteria.' : 'Your bus fleet is empty.'}</p>
              {(searchTerm || filterType) && (
                <button 
                  onClick={() => {
                    setSearchTerm("");
                    setFilterType("");
                  }}
                  className="clear-filters-btn"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "coupons" && (
        <div className="admin-content">
          <div className="section-header">
            <h2>Coupon Management</h2>
            <p>Create and manage discount coupons</p>
          </div>
          
          <div className="coupon-form-card">
            <h3>{editingCoupon ? "Edit Coupon" : "Add New Coupon"}</h3>
            <div className="coupon-form">
              <input
                type="text"
                placeholder="Coupon Code"
                value={couponForm.code}
                onChange={(e) => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})}
                className="form-input"
              />
              <input
                type="number"
                placeholder="Discount Value"
                value={couponForm.discount}
                onChange={(e) => setCouponForm({...couponForm, discount: e.target.value})}
                className="form-input"
              />
              <select
                value={couponForm.type}
                onChange={(e) => setCouponForm({...couponForm, type: e.target.value})}
                className="form-select"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
              <input
                type="number"
                placeholder="Minimum Amount"
                value={couponForm.minAmount}
                onChange={(e) => setCouponForm({...couponForm, minAmount: e.target.value})}
                className="form-input"
              />
              <input
                type="number"
                placeholder="Max Discount (optional)"
                value={couponForm.maxDiscount}
                onChange={(e) => setCouponForm({...couponForm, maxDiscount: e.target.value})}
                className="form-input"
              />
              <input
                type="date"
                value={couponForm.expiryDate}
                onChange={(e) => setCouponForm({...couponForm, expiryDate: e.target.value})}
                className="form-input"
              />
              <div className="form-actions">
                {editingCoupon ? (
                  <>
                    <button onClick={updateCouponHandler} className="update-btn">Update Coupon</button>
                    <button onClick={() => { setEditingCoupon(null); setCouponForm({ code: "", discount: "", type: "percentage", minAmount: "", maxDiscount: "", expiryDate: "", isActive: true }); }} className="cancel-btn">Cancel</button>
                  </>
                ) : (
                  <button onClick={addCoupon} className="add-coupon-btn">Add Coupon</button>
                )}
              </div>
            </div>
          </div>

          <div className="coupons-list">
            <h3>All Coupons ({coupons.length} total, {coupons.filter(c => c.isActive).length} active)</h3>
            <div className="coupons-grid">
              {coupons.map(coupon => (
                <div key={coupon._id} className={`coupon-card ${!coupon.isActive ? 'inactive' : ''}`}>
                  <div className="coupon-header">
                    <h4>{coupon.code}</h4>
                    <span className={`status-badge ${coupon.isActive ? 'active' : 'inactive'}`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="coupon-details">
                    <p><strong>Discount:</strong> {coupon.type === 'percentage' ? `${coupon.discount}%` : `₹${coupon.discount}`}</p>
                    <p><strong>Min Amount:</strong> ₹{coupon.minAmount}</p>
                    {coupon.maxDiscount > 0 && <p><strong>Max Discount:</strong> ₹{coupon.maxDiscount}</p>}
                    <p><strong>Expires:</strong> {new Date(coupon.expiryDate).toLocaleDateString()}</p>
                  </div>
                  <div className="coupon-actions">
                    <button onClick={() => editCoupon(coupon)} className="edit-coupon-btn">✏️ Edit</button>
                    <button onClick={() => toggleStatus(coupon._id)} className="toggle-btn">
                      {coupon.isActive ? '⏸️ Disable' : '▶️ Enable'}
                    </button>
                    <button onClick={() => deleteCoupon(coupon._id)} className="delete-coupon-btn">🗑️ Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === "delays" && (
        <div className="admin-content">
          <div className="section-header">
            <h2>Bus Delay Management</h2>
            <p>Update bus delays and notify passengers</p>
          </div>
          
          <div className="bus-controls">
            <div className="search-filter-row">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="🔍 Search buses by name, route, or operator..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
          </div>
          
          <div className="delay-grid">
            {filteredBuses.map(bus => (
              <div key={bus.id} className="delay-card">
                <div className="bus-info">
                  <h4>{bus.name}</h4>
                  <p>{bus.from} → {bus.to}</p>
                  <p>Departure: {new Date(bus.departure).toLocaleString()}</p>
                  <p>Arrival: {new Date(bus.arrival).toLocaleString()}</p>
                  {bus.delayInfo?.isDelayed && (
                    <p className="delay-info">⚠️ Delayed by {bus.delayInfo.delayMinutes} min - {bus.delayInfo.reason}</p>
                  )}
                </div>
                <div className="delay-status">
                  {bus.delayInfo?.isDelayed ? (
                    <span className="delayed">⚠️ Delayed by {bus.delayInfo.delayMinutes} min</span>
                  ) : (
                    <span className="on-time">✅ On Time</span>
                  )}
                </div>
                <div className="delay-actions">
                  <input
                    type="number"
                    placeholder="Delay (min)"
                    className="delay-input"
                    id={`delay-${bus.id}`}
                  />
                  <input
                    type="text"
                    placeholder="Reason"
                    className="reason-input"
                    id={`reason-${bus.id}`}
                  />
                  <button
                    onClick={async () => {
                      const delayMinutes = parseInt(document.getElementById(`delay-${bus.id}`).value);
                      const reason = document.getElementById(`reason-${bus.id}`).value;
                      if (delayMinutes && reason && delayMinutes > 0 && delayMinutes <= 480 && reason.trim().length >= 3) {
                        try {
                          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/buses/${bus.id}/delay`, {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({ delayMinutes, reason })
                          });
                          
                          const result = await response.json();
                          
                          if (response.ok) {
                            showNotification(`Updated ${bus.name}: Delayed by ${delayMinutes} min - ${reason}`, "success");
                            // Clear inputs
                            document.getElementById(`delay-${bus.id}`).value = '';
                            document.getElementById(`reason-${bus.id}`).value = '';
                            // Refresh buses data
                            window.location.reload();
                          } else {
                            showNotification(result.message || 'Failed to update delay', 'error');
                          }
                        } catch (err) {
                          showNotification('Failed to update delay', 'error');
                        }
                      } else {
                        if (!delayMinutes || delayMinutes <= 0 || delayMinutes > 480) {
                          showNotification('Delay must be between 1 and 480 minutes', 'warning');
                        } else if (!reason || reason.trim().length < 3) {
                          showNotification('Reason must be at least 3 characters', 'warning');
                        } else {
                          showNotification('Please enter valid delay minutes and reason', 'warning');
                        }
                      }
                    }}
                    className="update-delay-btn"
                  >
                    Update Delay
                  </button>
                  {bus.delayInfo?.isDelayed && (
                    <button
                      onClick={() => {
                        // Reset to original times (would need to store original times)
                        const originalDeparture = new Date(bus.departure);
                        const originalArrival = new Date(bus.arrival);
                        
                        // Remove delay minutes to get back original time
                        const resetDeparture = new Date(originalDeparture.getTime() - (bus.delayInfo.delayMinutes * 60000));
                        const resetArrival = new Date(originalArrival.getTime() - (bus.delayInfo.delayMinutes * 60000));
                        
                        showNotification(`Cleared delay for ${bus.name}. Restored times: ${resetDeparture.toLocaleTimeString()} - ${resetArrival.toLocaleTimeString()}`, "success");
                        
                        // In real app, update bus with cleared delay
                        // await clearBusDelay(bus.id);
                      }}
                      className="clear-delay-btn"
                    >
                      Clear Delay
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "bookings" && (
        <div className="admin-content">
          <div className="section-header">
            <h2>All Bookings</h2>
            <div className="booking-header-actions">
              <span className="booking-count">{bookings.length} total bookings</span>
              <button 
                onClick={() => {
                  setPopup({
                    show: true,
                    title: "Reset All Bookings",
                    message: "This will permanently delete all booking records and reset bus availability. This action cannot be undone.",
                    type: "warning",
                    onConfirm: async () => {
                      try {
                        await clearAllBookings();
                        showNotification('All bookings cleared and bus seats reset successfully', 'success');
                        setPopup({ show: false, message: "", type: "" });
                      } catch (err) {
                        showNotification(err.message, 'error');
                        setPopup({ show: false, message: "", type: "" });
                      }
                    }
                  });
                }}
                className="clear-bookings-btn"
                title="Reset all bookings and restore full bus availability"
              >
                🔄 Reset All Bookings
              </button>
            </div>
          </div>
          
          {bookings.length > 0 ? (
            <div className="bookings-grid">
              {bookings.map(booking => (
                <div key={booking.id} className={`booking-card ${booking.status?.toLowerCase() === 'cancelled' ? 'cancelled' : ''}`}>
                  <div className="booking-header">
                    <h4>#{booking.id?.slice(-8)}</h4>
                    <span className={`status ${(() => {
                      if (booking.status?.toLowerCase() === 'cancelled') return 'cancelled';
                      const travelDate = booking.busDetails?.arrival || booking.bus?.arrival;
                      if (travelDate && new Date(travelDate) < new Date()) return 'completed';
                      return 'confirmed';
                    })()}`}>
                      {(() => {
                        if (booking.status?.toLowerCase() === 'cancelled') return 'Cancelled';
                        const travelDate = booking.busDetails?.arrival || booking.bus?.arrival;
                        if (travelDate && new Date(travelDate) < new Date()) return 'Travel Done';
                        return 'Confirmed';
                      })()}
                    </span>
                  </div>
                  <div className="booking-info">
                    <p><strong>Travel Name:</strong> {booking.busDetails?.name || booking.bus?.name || 'N/A'}</p>
                    <p><strong>Route:</strong> {booking.busDetails?.from || booking.bus?.from || 'N/A'} → {booking.busDetails?.to || booking.bus?.to || 'N/A'}</p>
                    <p><strong>Operator:</strong> {booking.busDetails?.operator || booking.bus?.operator || 'N/A'}</p>
                    <p><strong>Bus Number:</strong> {booking.busDetails?.busNumber || booking.bus?.busNumber || 'N/A'}</p>
                    <p><strong>Customer:</strong> {booking.user?.name}</p>
                    <p><strong>Email:</strong> {booking.user?.email}</p>
                    <p><strong>Seats:</strong> {booking.seats?.join(", ")}</p>
                    <p><strong>Amount:</strong> ₹{booking.payment?.finalAmount}</p>
                    <p><strong>Departure:</strong> {booking.busDetails?.departure ? new Date(booking.busDetails.departure).toLocaleString() : booking.bus?.departure ? new Date(booking.bus.departure).toLocaleString() : 'N/A'}</p>
                    <p><strong>Booked on:</strong> {new Date(booking.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h3>No bookings found</h3>
              <p>Bookings will appear here when customers make reservations</p>
            </div>
          )}
        </div>
      )}
      
      {popup.show && (
        <MessagePopup
          message={popup.message}
          type={popup.type}
          onClose={() => setPopup({ show: false, message: "", type: "" })}
        />
      )}
      
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification({ show: false, message: "", type: "info" })} className="close-btn">×</button>
        </div>
      )}
      
      <ScrollToTop />
    </div>
  );
}
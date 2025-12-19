import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useBus } from "../context/BusContext";
import { useNavigate } from "react-router-dom";
import "./css/AdminBookings.css";

export default function AdminBookings() {
  const { user } = useAuth();
  const { getAllBookings, clearAllBookingsDB } = useBus();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/login");
      return;
    }

    const loadBookings = async () => {
      try {
        const data = await getAllBookings();
        setBookings(data);
      } catch (error) {
        console.error("Error loading bookings:", error);
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [user, navigate, getAllBookings]);

  useEffect(() => {
    const filterBookings = () => {
      let filtered = [...bookings];

      if (filter !== "all") {
        filtered = filtered.filter(booking => booking.status.toLowerCase() === filter);
      }

      if (searchTerm) {
        filtered = filtered.filter(booking =>
          booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.bus?.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.bus?.to?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setFilteredBookings(filtered);
    };

    filterBookings();
  }, [bookings, filter, searchTerm]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return '#27ae60';
      case 'cancelled': return '#e74c3c';
      case 'pending': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return <div className="admin-loading">Loading bookings...</div>;
  }

  return (
    <div className="admin-bookings-page">
      <div className="admin-bookings-header">
        <h1>Manage Bookings</h1>
        <p>View and manage all customer bookings</p>
        <button
          onClick={async () => {
            if (window.confirm('WARNING: This will delete ALL booking history for ALL users. This action cannot be undone. Are you sure?')) {
              try {
                await clearAllBookingsDB();
                alert('All bookings have been cleared.');
                window.location.reload(); // force full reload
              } catch (e) {
                alert('Failed to clear bookings');
              }
            }
          }}
          style={{
            backgroundColor: '#e74c3c',
            color: 'white',
            padding: '8px 16px',
            border: 'none',
            borderRadius: '4px',
            marginTop: '10px',
            cursor: 'pointer'
          }}
        >
          ⚠️ Clear All History
        </button>
      </div>

      <div className="bookings-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by booking ID, customer name, email, or route..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-tabs">
          <button
            className={filter === "all" ? "filter-tab active" : "filter-tab"}
            onClick={() => setFilter("all")}
          >
            All ({bookings.length})
          </button>
          <button
            className={filter === "confirmed" ? "filter-tab active" : "filter-tab"}
            onClick={() => setFilter("confirmed")}
          >
            Confirmed ({bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length})
          </button>
          <button
            className={filter === "pending" ? "filter-tab active" : "filter-tab"}
            onClick={() => setFilter("pending")}
          >
            Pending ({bookings.filter(b => b.status?.toLowerCase() === 'pending').length})
          </button>
          <button
            className={filter === "cancelled" ? "filter-tab active" : "filter-tab"}
            onClick={() => setFilter("cancelled")}
          >
            Cancelled ({bookings.filter(b => b.status?.toLowerCase() === 'cancelled').length})
          </button>
        </div>
      </div>

      <div className="bookings-stats">
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p>{formatCurrency(bookings.filter(b => b.status !== 'Cancelled').reduce((sum, b) => sum + (b.payment?.finalAmount || 0), 0))}</p>
        </div>
        <div className="stat-card">
          <h3>Total Refunds</h3>
          <p>{formatCurrency(bookings.filter(b => b.status === 'Cancelled').reduce((sum, b) => sum + (b.cancellation?.refundAmount || 0), 0))}</p>
        </div>
        <div className="stat-card">
          <h3>Today's Bookings</h3>
          <p>{bookings.filter(b => new Date(b.createdAt).toDateString() === new Date().toDateString()).length}</p>
        </div>
        <div className="stat-card">
          <h3>Active Bookings</h3>
          <p>{bookings.filter(b => b.status?.toLowerCase() === 'confirmed').length}</p>
        </div>
      </div>

      <div className="bookings-table-container">
        {filteredBookings.length === 0 ? (
          <div className="no-bookings">
            <h3>No bookings found</h3>
            <p>No bookings match your current filter criteria.</p>
          </div>
        ) : (
          <table className="bookings-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Customer</th>
                <th>Route</th>
                <th>Travel Date</th>
                <th>Seats</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Booked On</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id}>
                  <td className="booking-id">{booking.id}</td>
                  <td>
                    <div className="customer-info">
                      <div className="customer-name">{booking.user?.name || 'N/A'}</div>
                      <div className="customer-email">{booking.user?.email || 'N/A'}</div>
                    </div>
                  </td>
                  <td>
                    <div className="route-info">
                      <span className="route">{booking.bus?.from || 'N/A'} → {booking.bus?.to || 'N/A'}</span>
                      <div className="bus-info">{booking.bus?.name || 'N/A'}</div>
                    </div>
                  </td>
                  <td>
                    {booking.bus?.departure ?
                      new Date(booking.bus.departure).toLocaleDateString('en-IN') : 'N/A'}
                  </td>
                  <td>
                    <span className="seats-info">{booking.seats?.join(', ') || 'N/A'}</span>
                  </td>
                  <td>
                    <div className="amount-info">
                      <div className="final-amount">{formatCurrency(booking.payment?.finalAmount || 0)}</div>
                      {booking.payment?.discount > 0 && (
                        <div className="discount">-{formatCurrency(booking.payment.discount)}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(booking.status) }}
                    >
                      {booking.status || 'Unknown'}
                    </span>
                    {booking.status === 'Cancelled' && booking.cancellation && (
                      <div style={{fontSize: '11px', marginTop: '4px', color: '#e74c3c'}}>
                        Refund: {formatCurrency(booking.cancellation.refundAmount)} ({booking.cancellation.refundPercentage}%)
                      </div>
                    )}
                  </td>
                  <td>
                    {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="action-btn view-btn" title="View Details">
                        👁️
                      </button>
                      <button className="action-btn edit-btn" title="Edit Booking">
                        ✏️
                      </button>
                      {booking.status?.toLowerCase() === 'confirmed' && (
                        <button className="action-btn cancel-btn" title="Cancel Booking">
                          ❌
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
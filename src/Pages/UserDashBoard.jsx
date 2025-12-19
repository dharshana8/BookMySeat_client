import React from "react";
import "./css/UserDashboard.css";

export default function UserDashboard() {
  return (
    <div className="userdash-page">

      <div className="dash-header">
        <h1>Your Dashboard</h1>
        <p>Manage bookings & explore new routes</p>
      </div>

      {/* Quick Search */}
      <div className="dash-search-card">
        <input type="text" placeholder="From" />
        <input type="text" placeholder="To" />
        <input type="date" />

        <button className="dash-search-btn">Search</button>
      </div>

      {/* Your Bookings */}
      <h2 className="section-title">Your Bookings</h2>
      <div className="booking-list">
        <p className="empty">No bookings yet.</p>
      </div>

    </div>
  );
}

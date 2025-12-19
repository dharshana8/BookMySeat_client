import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./css/BusCard.css";

export default function BusCard({ bus }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const calculateDuration = (departure, arrival) => {
    const dep = new Date(departure);
    const arr = new Date(arrival);
    const diff = arr - dep;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getDelayedTime = (originalTime, status) => {
    const delayMatch = status.match(/Delayed by (\d+) mins/);
    if (delayMatch) {
      const delayMinutes = parseInt(delayMatch[1]);
      const originalDate = new Date(originalTime);
      const delayedDate = new Date(originalDate.getTime() + delayMinutes * 60000);
      return delayedDate.toISOString();
    }
    return originalTime;
  };

  const handleSelectSeats = () => {
    if (!user) {
      alert("Please login to book tickets");
      navigate("/login");
      return;
    }
    navigate(`/bus/${bus.id}/seats`);
  };

  return (
    <div className="bus-card">
      <div className="bus-image">
        <img 
          src={bus.imageUrl || "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&h=200&fit=crop"} 
          alt={bus.name} 
        />
        <div className="bus-type-overlay">{bus.type}</div>
      </div>
      
      <div className="bus-main-content">
        <div className="bus-header">
          <div className="bus-title">
            <h3>{bus.name}</h3>
            <div className="bus-meta">
              <span className="operator">🚌 {bus.operator}</span>
              <span className="bus-number">#{bus.busNumber}</span>
            </div>
          </div>
          <div className="bus-rating">
            <span className="rating">⭐ {bus.rating}</span>
          </div>
        </div>

        <div className="route-section">
          <div className="route-time">
            <div className="departure">
              <div className="time">{formatTime(bus.departure)}</div>
              <div className="city">{bus.from}</div>
            </div>
            
            <div className="journey-info">
              <div className="duration-line">
                <div className="line"></div>
                <div className="duration">{calculateDuration(bus.departure, bus.arrival)}</div>
              </div>
              {bus.status?.includes('Delayed') && (
                <div className="delay-badge">⚠️ Delayed</div>
              )}
            </div>
            
            <div className="arrival">
              <div className="time">{formatTime(bus.arrival)}</div>
              <div className="city">{bus.to}</div>
            </div>
          </div>
        </div>

        <div className="bus-features">
          <div className="seats-info">
            <span className="seats-available">🪑 {bus.availableSeats} seats left</span>
            <span className="total-seats">of {bus.totalSeats}</span>
          </div>
          
          <div className="amenities">
            {bus.amenities?.slice(0, 4).map((amenity, index) => (
              <span key={index} className="amenity">{amenity}</span>
            ))}
            {bus.amenities?.length > 4 && (
              <span className="more-amenities">+{bus.amenities.length - 4} more</span>
            )}
          </div>
        </div>
      </div>

      <div className="bus-booking">
        <div className="price-section">
          <div className="price">₹{bus.fare}</div>
          <div className="price-label">per person</div>
        </div>
        
        <div className="booking-actions">
          <button 
            className="book-btn"
            onClick={handleSelectSeats}
            disabled={bus.availableSeats === 0}
          >
            {bus.availableSeats === 0 ? "Sold Out" : "Book Now"}
          </button>
          
          <button className="track-btn" onClick={() => {
            window.open(`https://maps.google.com/maps?q=${bus.from}+to+${bus.to}+bus+route`, '_blank');
          }}>
            📍 Live Track
          </button>
        </div>
        
        <div className="status-badge">
          <span className={`status ${bus.status?.includes('Delayed') ? 'delayed' : 'ontime'}`}>
            {bus.status?.includes('Delayed') ? '⚠️ Delayed' : '✅ On Time'}
          </span>
        </div>
      </div>
    </div>
  );
}
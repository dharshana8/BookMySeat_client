import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCoupon } from "../context/CouponContext";
import { useBus } from "../context/BusContext";
import SearchBar from "../Components/SearchBar.jsx";
import Footer from "../Components/Footer.jsx";
import "./css/Home.css";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getActiveCoupons } = useCoupon();
  const { buses, fetchBuses } = useBus();
  const activeCoupons = getActiveCoupons();
  const [featuredBuses, setFeaturedBuses] = useState([]);

  // When search bar sends data -> navigate to search page
  const handleSearch = (data) => {
    navigate("/search", { state: data });
  };

  // Fetch featured buses on component mount
  useEffect(() => {
    const loadFeaturedBuses = async () => {
      try {
        await fetchBuses({});
        // Get first 6 buses as featured
        setFeaturedBuses(buses.slice(0, 6));
      } catch (err) {
        console.error('Error loading featured buses:', err);
      }
    };
    loadFeaturedBuses();
  }, []);

  useEffect(() => {
    setFeaturedBuses(buses.slice(0, 6));
  }, [buses]);

  const [showCouponModal, setShowCouponModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState("");

  const handleCouponClick = (couponCode) => {
    if (user) {
      navigator.clipboard.writeText(couponCode);
      setSelectedCoupon(couponCode);
      setShowCouponModal(true);
      setTimeout(() => setShowCouponModal(false), 2000);
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="home-container">

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>India's #1 Online Bus Booking Platform</h1>
            <p>Book bus tickets online in just 60 seconds. Choose from 3000+ buses across 100+ cities</p>
            <div className="hero-stats">
              <div className="stat">
                <strong>50M+</strong>
                <span>Happy Customers</span>
              </div>
              <div className="stat">
                <strong>3000+</strong>
                <span>Bus Partners</span>
              </div>
              <div className="stat">
                <strong>100+</strong>
                <span>Cities Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <SearchBar onSearch={handleSearch} />
      </div>

      {/* Features */}
      <h2 className="section-title">Why Choose BookMySeat?</h2>
      <div className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">SECURE</div>
          <h3>Safe & Secure</h3>
          <p>Your safety is our priority. All buses are GPS tracked with CCTV surveillance</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">FAST</div>
          <h3>Quick Booking</h3>
          <p>Book tickets in under 60 seconds with instant confirmation and e-tickets</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">PRICE</div>
          <h3>Best Prices</h3>
          <p>Compare prices across operators and get the best deals with exclusive offers</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">REFUND</div>
          <h3>Easy Cancellation</h3>
          <p>Cancel tickets easily and get instant refunds with our flexible policies</p>
        </div>
      </div>

      {/* Available Buses */}
      <h2 className="section-title">Popular Routes & Available Buses</h2>
      <div className="buses-grid">
        {featuredBuses.map(bus => (
          <div key={bus.id} className="bus-card-home">
            <div className="bus-route">
              <h3>{bus.from} → {bus.to}</h3>
              <span className="bus-type">{bus.type}</span>
            </div>
            <div className="bus-details">
              <p><strong>{bus.name}</strong> by {bus.operator}</p>
              <div className="bus-timing">
                <span>Departure: {new Date(bus.departure).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                <span>Arrival: {new Date(bus.arrival).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="bus-info">
                <span className="fare">₹{bus.fare}</span>
                <span className="seats">{bus.availableSeats} seats left</span>
                <span className="rating">★ {bus.rating}</span>
              </div>
            </div>
            <button 
              className="book-btn" 
              onClick={() => navigate(`/bus/${bus.id}/seats`)}
            >
              Book Now
            </button>
          </div>
        ))}
      </div>
      <div className="see-more-section">
        <button className="see-more-btn" onClick={() => navigate('/search')}>
          See More Buses →
        </button>
      </div>

      {/* Offers */}
      <h2 className="section-title">Special Offers ({activeCoupons.length} Active)</h2>
      <div className="offers-grid">
        {activeCoupons.map(coupon => (
          <div key={coupon.id} className="offer-card">
            <span className="offer-badge">
              {coupon.type === 'percentage' ? `${coupon.discount}%` : `₹${coupon.discount}`}
            </span>
            <h3>{coupon.code} - {coupon.type === 'percentage' ? `${coupon.discount}% OFF` : `₹${coupon.discount} OFF`}</h3>
            <p>
              {coupon.type === 'percentage' 
                ? `Get ${coupon.discount}% off on bookings above ₹${coupon.minAmount}`
                : `Flat ₹${coupon.discount} off on bookings above ₹${coupon.minAmount}`
              }
            </p>
            <button className="offer-btn" onClick={() => handleCouponClick(coupon.code)}>Use Code</button>
          </div>
        ))}
      </div>

      <Footer />
      
      {/* Coupon Success Modal */}
      {showCouponModal && (
        <div className="coupon-modal">
          <div className="coupon-modal-content">
            <span className="success-icon">✓</span>
            <p>Coupon code <strong>{selectedCoupon}</strong> copied!</p>
            <small>Use it during booking to get discount</small>
          </div>
        </div>
      )}
    </div>
  );
}

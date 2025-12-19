import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useBus } from "../context/BusContext";
import { useAuth } from "../context/AuthContext";
import "./css/Payment.css";

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const { createBooking } = useBus();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [error, setError] = useState("");

  const state = location.state || {};
  const { busId, seats = [], totalAmount = 0, discount = 0 } = state;

  // Test data for direct access
  const testData = {
    busId: busId || 'TEST-BUS-001',
    seats: seats.length > 0 ? seats : ['A1', 'A2'],
    totalAmount: totalAmount || 500,
    discount: discount || 50
  };

  if (!busId || seats.length === 0) {
    return (
      <div className="payment-page">
        <div className="payment-card">
          <h3>⚠️ Test Mode - No Payment Data</h3>
          <p>Using test data for demonstration.</p>
          <button 
            onClick={() => {
              // Use test data
              Object.assign(state, testData);
              window.location.reload();
            }} 
            className="home-btn"
          >
            Load Test Data
          </button>
          <button onClick={() => navigate('/')} className="home-btn">Go Home</button>
        </div>
      </div>
    );
  }

  const currentBusId = busId || testData.busId;
  const currentSeats = seats.length > 0 ? seats : testData.seats;
  const currentTotal = totalAmount || testData.totalAmount;
  const currentDiscount = discount || testData.discount;
  const finalAmount = currentTotal - currentDiscount;

  const handlePay = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    setError("");
    try {
      const booking = await createBooking({ 
        busId: currentBusId, 
        seats: currentSeats, 
        totalAmount: currentTotal, 
        discount: currentDiscount 
      });
      console.log('Booking created:', booking); // Debug log
      setCurrentBooking(booking);
      setPaymentSuccess(true);
    } catch (err) {
      console.error('Payment error:', err); // Debug log
      setError(err?.response?.data?.message || err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadTicket = () => {
    if (!currentBooking) {
      alert('No booking data available');
      return;
    }
    
    const bookingId = currentBooking.id || currentBooking._id || 'N/A';
    const userName = currentBooking.user?.name || user?.name || 'N/A';
    const userEmail = currentBooking.user?.email || user?.email || 'N/A';
    const busRoute = currentBooking.busDetails ? 
      `${currentBooking.busDetails.from} → ${currentBooking.busDetails.to}` : 
      `${currentBooking.bus?.from || 'N/A'} → ${currentBooking.bus?.to || 'N/A'}`;
    const seatsList = currentBooking.seats?.join(', ') || 'N/A';
    const amountPaid = currentBooking.payment?.finalAmount || finalAmount;
    
    const htmlContent = `<!DOCTYPE html>
<html><head><style>
body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }
.header { background: #d32f2f; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
.section { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; }
.row { display: flex; justify-content: space-between; margin: 5px 0; }
</style></head><body>
<div class="header"><h1>🚌 BookMySeat</h1><h2>BOOKING CONFIRMATION</h2><p>Booking ID: ${bookingId}</p></div>
<div class="section"><h3>PASSENGER DETAILS</h3><div class="row"><span>Name:</span><span>${userName}</span></div><div class="row"><span>Email:</span><span>${userEmail}</span></div></div>
<div class="section"><h3>TRAVEL DETAILS</h3><div class="row"><span>Route:</span><span>${busRoute}</span></div><div class="row"><span>Seats:</span><span>${seatsList}</span></div><div class="row"><span>Amount Paid:</span><span>₹${amountPaid}</span></div></div>
<div class="section"><p>Thank you for choosing BookMySeat!</p></div>
</body></html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BookMySeat_Ticket_${bookingId}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (paymentSuccess) {
    return (
      <div className="payment-page">
        <div className="success-modal">
          <div className="modal-header">
            <h2>✅ Payment Successful!</h2>
            <p>Your booking has been confirmed! Booking ID: {currentBooking?.id || 'N/A'}</p>
            <p>Do you need to download the ticket or continue with your account?</p>
          </div>
          <div className="modal-actions">
            <button onClick={downloadTicket} className="download-btn">
              📎 Download Ticket
            </button>
            <button onClick={() => navigate('/my-account')} className="continue-btn">
              📄 Continue to My Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-card">
        <h2>💳 Complete Payment</h2>
        
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}
        
        <div className="payment-summary">
          <div className="summary-row">
            <span>Selected Seats:</span>
            <span><strong>{currentSeats.join(', ')}</strong></span>
          </div>
          <div className="summary-row">
            <span>Base Amount:</span>
            <span>₹{currentTotal}</span>
          </div>
          {currentDiscount > 0 && (
            <div className="summary-row discount">
              <span>Discount:</span>
              <span>-₹{currentDiscount}</span>
            </div>
          )}
          <div className="summary-row total">
            <span><strong>Total Amount:</strong></span>
            <span><strong>₹{finalAmount}</strong></span>
          </div>
        </div>

        <div className="payment-methods">
          <h3>Payment Method</h3>
          <div className="method-option selected">
            <span>💳 Online Payment</span>
            <span>✓</span>
          </div>
        </div>

        <div className="payment-actions">
          <button 
            className="pay-now-btn" 
            onClick={handlePay} 
            disabled={loading}
          >
            {loading ? '⏳ Processing Payment...' : `💳 Pay ₹${finalAmount}`}
          </button>
          <button 
            className="cancel-btn" 
            onClick={() => navigate(-1)} 
            disabled={loading}
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
}
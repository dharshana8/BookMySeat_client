import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBus } from "../context/BusContext";
import { useAuth } from "../context/AuthContext";
import "./css/SeatSelection.css";

export default function SeatSelection() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { buses, createBooking, holdSeats } = useBus();
  const { user } = useAuth();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [holdTimer, setHoldTimer] = useState(null);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponStatus, setCouponStatus] = useState("");

  const bus = buses.find(b => b.id === id);

  if (!bus) {
    return <div>Bus not found</div>;
  }

  if (!user) {
    alert("Please login to book tickets");
    navigate("/login");
    return null;
  }

  const generateSeats = () => {
    const seats = [];
    const layout = bus.seatLayout || "2+2";
    const [left, right] = layout.split("+").map(Number);
    const totalCols = left + right;
    const rows = Math.ceil(bus.totalSeats / totalCols);

    for (let row = 1; row <= rows; row++) {
      const rowSeats = [];

      // Left side seats
      for (let col = 1; col <= left; col++) {
        const seatNumber = `${row}${String.fromCharCode(64 + col)}`;
        if (seats.length < bus.totalSeats) {
          rowSeats.push({
            number: seatNumber,
            isBooked: bus.bookedSeats.includes(seatNumber),
            isSelected: selectedSeats.includes(seatNumber),
            side: "left"
          });
        }
      }

      // Aisle space
      rowSeats.push({ isAisle: true });

      // Right side seats
      for (let col = 1; col <= right; col++) {
        const seatNumber = `${row}${String.fromCharCode(64 + left + col)}`;
        if (seats.length < bus.totalSeats) {
          rowSeats.push({
            number: seatNumber,
            isBooked: bus.bookedSeats.includes(seatNumber),
            isSelected: selectedSeats.includes(seatNumber),
            side: "right"
          });
        }
      }

      seats.push(rowSeats);
    }

    return seats;
  };

  const handleSeatClick = async (seatNumber) => {
    if (bus.bookedSeats.includes(seatNumber)) return;

    let newSeats;
    if (selectedSeats.includes(seatNumber)) {
      newSeats = selectedSeats.filter(s => s !== seatNumber);
    } else {
      if (selectedSeats.length < 6) {
        newSeats = [...selectedSeats, seatNumber];
      } else {
        alert("Maximum 6 seats can be selected");
        return;
      }
    }
    
    setSelectedSeats(newSeats);
    
    // Hold seats for 10 minutes
    if (newSeats.length > 0) {
      try {
        await holdSeats({ busId: bus.id, seats: newSeats });
        
        // Clear existing timer
        if (holdTimer) clearTimeout(holdTimer);
        
        // Set new timer to clear selection after 10 minutes
        const timer = setTimeout(() => {
          setSelectedSeats([]);
          alert('Seat selection expired. Please select again.');
        }, 10 * 60 * 1000);
        setHoldTimer(timer);
      } catch (err) {
        console.error('Failed to hold seats:', err);
      }
    } else {
      if (holdTimer) clearTimeout(holdTimer);
    }
  };

  const applyCoupon = () => {
    const coupons = {
      "FIRST10": { discount: 10, type: "percentage", minAmount: 200 },
      "SAVE50": { discount: 50, type: "fixed", minAmount: 300 },
      "WEEKEND20": { discount: 20, type: "percentage", minAmount: 400 }
    };

    const coupon = coupons[couponCode.toUpperCase()];
    const totalAmount = selectedSeats.length * bus.fare;

    if (!coupon) {
      setCouponMessage("Invalid coupon code");
      setCouponStatus("error");
      setTimeout(() => setCouponMessage(""), 3000);
      return;
    }

    if (totalAmount < coupon.minAmount) {
      setCouponMessage(`Minimum booking amount should be ₹${coupon.minAmount}`);
      setCouponStatus("error");
      setTimeout(() => setCouponMessage(""), 3000);
      return;
    }

    if (coupon.type === "percentage") {
      setDiscount((totalAmount * coupon.discount) / 100);
    } else {
      setDiscount(coupon.discount);
    }

    setCouponMessage(`Coupon ${couponCode.toUpperCase()} applied! You saved ₹${coupon.type === "percentage" ? Math.round((totalAmount * coupon.discount) / 100) : coupon.discount}`);
    setCouponStatus("success");
    setTimeout(() => setCouponMessage(""), 3000);
  };

  const generatePDF = (booking) => {
    // Create a simple HTML-based PDF content
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px;
            max-width: 600px;
            margin: 0 auto;
            text-align: center;
          }
          .header { 
            text-align: center; 
            color: #d32f2f; 
            margin-bottom: 30px; 
            border-bottom: 2px solid #d32f2f;
            padding-bottom: 20px;
          }
          .section { 
            margin-bottom: 25px; 
            text-align: center;
            background: #f9f9f9;
            padding: 15px;
            border-radius: 8px;
          }
          .section h3 {
            color: #d32f2f;
            margin-bottom: 15px;
            text-align: center;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 5px 0;
          }
          .label { 
            font-weight: bold; 
            color: #333; 
            text-align: left;
          }
          .value { 
            color: #666; 
            text-align: right;
          }
          .divider { 
            border-bottom: 1px solid #ddd; 
            margin: 20px 0; 
          }
          .footer { 
            text-align: center; 
            margin-top: 30px; 
            color: #666; 
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          .booking-id {
            background: #d32f2f;
            color: white;
            padding: 10px 20px;
            border-radius: 20px;
            display: inline-block;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🚌 BookMySeat</h1>
          <h2>BOOKING CONFIRMATION</h2>
          <div class="booking-id">Booking ID: ${booking.id}</div>
        </div>
        
        <div class="section">
          <h3>PASSENGER DETAILS</h3>
          <div class="detail-row">
            <span class="label">Name:</span>
            <span class="value">${booking.user.name}</span>
          </div>
          <div class="detail-row">
            <span class="label">Email:</span>
            <span class="value">${booking.user.email}</span>
          </div>
        </div>
        
        <div class="section">
          <h3>TRAVEL DETAILS</h3>
          <div class="detail-row">
            <span class="label">Route:</span>
            <span class="value">${booking.busDetails.from} → ${booking.busDetails.to}</span>
          </div>
          <div class="detail-row">
            <span class="label">Date:</span>
            <span class="value">${new Date(booking.busDetails.departure).toLocaleDateString()}</span>
          </div>
          <div class="detail-row">
            <span class="label">Departure:</span>
            <span class="value">${new Date(booking.busDetails.departure).toLocaleTimeString()}</span>
          </div>
          <div class="detail-row">
            <span class="label">Arrival:</span>
            <span class="value">${new Date(booking.busDetails.arrival).toLocaleTimeString()}</span>
          </div>
        </div>
        
        <div class="section">
          <h3>BUS DETAILS</h3>
          <div class="detail-row">
            <span class="label">Bus Name:</span>
            <span class="value">${booking.busDetails.name}</span>
          </div>
          <div class="detail-row">
            <span class="label">Operator:</span>
            <span class="value">${booking.busDetails.operator}</span>
          </div>
          <div class="detail-row">
            <span class="label">Bus Number:</span>
            <span class="value">${booking.busDetails.busNumber}</span>
          </div>
          <div class="detail-row">
            <span class="label">Seats:</span>
            <span class="value">${booking.seats.join(", ")}</span>
          </div>
        </div>
        
        <div class="section">
          <h3>PAYMENT DETAILS</h3>
          <div class="detail-row">
            <span class="label">Total Amount:</span>
            <span class="value">₹${booking.payment.totalAmount}</span>
          </div>
          <div class="detail-row">
            <span class="label">Discount:</span>
            <span class="value">₹${booking.payment.discount}</span>
          </div>
          <div class="detail-row">
            <span class="label">Final Amount:</span>
            <span class="value">₹${booking.payment.finalAmount}</span>
          </div>
          <div class="detail-row">
            <span class="label">Payment Status:</span>
            <span class="value">${booking.payment.status}</span>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Booked on:</strong> ${new Date(booking.createdAt).toLocaleString()}</p>
          <p>Thank you for choosing BookMySeat!</p>
          <p>For support: support@bookmyseat.com</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([pdfContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BookMySeat_Ticket_${booking.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      alert("Please select at least one seat");
      return;
    }
    
    setLoading(true);
    try {
      const booking = await createBooking({
        busId: bus.id,
        seats: selectedSeats,
        totalAmount: totalAmount,
        discount: discount
      });
      
      // Clear hold timer on successful booking
      if (holdTimer) clearTimeout(holdTimer);
      
      setCurrentBooking(booking);
      setShowBookingSuccess(true);
    } catch (err) {
      console.error('Booking error:', err);
      const errorMsg = err?.response?.data?.message || err.message || 'Booking failed. Please try again.';
      alert('Payment Failed: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTicket = () => {
    if (currentBooking) {
      generatePDF(currentBooking);
    } else {
      alert('No booking data available');
    }
  };

  const handleCloseModal = () => {
    setShowBookingSuccess(false);
    navigate("/my-account");
  };

  const totalAmount = selectedSeats.length * bus.fare;
  const finalAmount = totalAmount - discount;
  const seatLayout = generateSeats();

  return (
    <div className="seat-selection-page">
      <div className="seat-container">
        <div className="bus-info">
          <h2>{bus.name}</h2>
          <p>{bus.from} → {bus.to}</p>
          <p>{new Date(bus.departure).toLocaleString()}</p>
          <div className="bus-details">
            <span className="bus-type">{bus.type}</span>
            <span className="seat-layout">Layout: {bus.seatLayout}</span>
            <span className="fare">₹{bus.fare} per seat</span>
          </div>
        </div>

        <div className="seat-map-container">
          <div className="seat-legend">
            <div className="legend-item">
              <div className="seat available"></div>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <div className="seat selected"></div>
              <span>Selected</span>
            </div>
            <div className="legend-item">
              <div className="seat booked"></div>
              <span>Booked</span>
            </div>
          </div>

          <div className="bus-layout">
            <div className="driver-section">
              <div className="steering">🚗</div>
              <span>Driver</span>
            </div>

            <div className="seat-grid">
              {seatLayout.map((row, rowIndex) => (
                <div key={rowIndex} className="seat-row">
                  {row.map((seat, seatIndex) => (
                    seat.isAisle ? (
                      <div key={seatIndex} className="aisle"></div>
                    ) : (
                      <div
                        key={seatIndex}
                        className={`seat ${seat.isBooked ? 'booked' : seat.isSelected ? 'selected' : 'available'}`}
                        onClick={() => handleSeatClick(seat.number)}
                      >
                        {seat.number}
                      </div>
                    )
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="booking-summary">
          <h3>Booking Summary</h3>
          <div className="selected-seats">
            <strong>Selected Seats:</strong> {selectedSeats.join(", ") || "None"}
          </div>

          <div className="coupon-section">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <button onClick={applyCoupon} className="apply-coupon">Apply</button>
            {couponMessage && (
              <div className={`coupon-message ${couponStatus}`}>
                {couponMessage}
              </div>
            )}
          </div>

          <div className="amount-breakdown">
            <div className="amount-row">
              <span>Seats ({selectedSeats.length})</span>
              <span>₹{totalAmount}</span>
            </div>
            {discount > 0 && (
              <div className="amount-row discount">
                <span>Discount</span>
                <span>-₹{discount}</span>
              </div>
            )}
            <div className="amount-row total">
              <span>Total Amount</span>
              <span>₹{finalAmount}</span>
            </div>
          </div>

          <button
            className="book-now-btn"
            onClick={handleBooking}
            disabled={selectedSeats.length === 0 || loading}
          >
            {loading ? '⏳ Processing...' : `Pay Now (₹${finalAmount})`}
          </button>
        </div>
      </div>

      {/* Payment Success Modal */}
      {showBookingSuccess && currentBooking && (
        <div className="booking-modal-overlay" style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
          <div className="booking-modal" style={{background: 'white', borderRadius: '16px', padding: '0', maxWidth: '500px', width: '90%', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', border: '3px solid #28a745'}}>
            <div className="modal-header" style={{background: 'linear-gradient(135deg, #28a745, #20c997)', color: 'white', padding: '30px', borderRadius: '13px 13px 0 0', textAlign: 'center'}}>
              <h2 style={{margin: '0 0 15px 0', fontSize: '26px', fontWeight: 'bold'}}>✅ Payment Successful!</h2>
              <p style={{margin: '0', opacity: '0.95', fontSize: '15px', lineHeight: '1.5'}}>Your booking has been confirmed! Booking ID: {currentBooking?.id}</p>
            </div>

            <div className="modal-content" style={{padding: '30px'}}>
              <div className="booking-details" style={{marginBottom: '20px', textAlign: 'center'}}>
                <p><strong>Route:</strong> {bus.from} → {bus.to}</p>
                <p><strong>Seats:</strong> {selectedSeats.join(", ")}</p>
                <p><strong>Amount Paid:</strong> ₹{finalAmount}</p>
              </div>

              <div className="modal-actions" style={{display: 'flex', gap: '15px'}}>
                <button 
                  className="download-btn" 
                  onClick={handleDownloadTicket}
                  style={{flex: 1, background: 'linear-gradient(135deg, #d32f2f, #b71c1c)', color: 'white', border: 'none', padding: '16px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '16px'}}
                >
                  📎 Download Ticket
                </button>
                <button 
                  className="continue-btn" 
                  onClick={handleCloseModal}
                  style={{flex: 1, background: 'linear-gradient(135deg, #28a745, #20c997)', color: 'white', border: 'none', padding: '16px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '16px'}}
                >
                  📄 Continue to My Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
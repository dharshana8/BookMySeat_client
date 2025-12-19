import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBus } from "../context/BusContext";
import { BUS_TYPES, AMENITIES } from "../data/buses";
import MessagePopup from "../Components/MessagePopup";
import "./css/AdminAddBus.css";

export default function AdminAddBus() {
  const navigate = useNavigate();
  const { addBus } = useBus();
  const [form, setForm] = useState({
    name: "",
    from: "",
    to: "",
    departure: "",
    arrival: "",
    fare: "",
    totalSeats: "",
    type: "AC Sleeper",
    operator: "",
    busNumber: "",
    seatLayout: "2+2",
    amenities: [],
    image: "",
    description: ""
  });
  const [error, setError] = useState("");
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    // Sanitize input based on field type
    let sanitizedValue = value;

    if (name === 'fare' || name === 'totalSeats') {
      // Only allow positive numbers
      sanitizedValue = value.replace(/[^0-9]/g, '');
      if (parseInt(sanitizedValue) > 10000) sanitizedValue = '10000'; // Max limit
    } else if (name === 'busNumber') {
      // Only allow alphanumeric characters
      sanitizedValue = value.replace(/[^A-Za-z0-9]/g, '').substring(0, 15);
    } else if (name === 'name' || name === 'operator' || name === 'from' || name === 'to') {
      // Remove dangerous characters
      sanitizedValue = value.replace(/[<>"'&]/g, '').substring(0, 100);
    } else if (name === 'description') {
      // Remove dangerous characters but allow more length
      sanitizedValue = value.replace(/[<>"'&]/g, '').substring(0, 500);
    }

    setForm({ ...form, [name]: sanitizedValue });
  }

  function handleAmenityChange(amenity) {
    const updatedAmenities = form.amenities.includes(amenity)
      ? form.amenities.filter(a => a !== amenity)
      : [...form.amenities, amenity];
    setForm({ ...form, amenities: updatedAmenities });
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    // Comprehensive validation
    if (!form.name || !form.from || !form.to || !form.departure || !form.arrival || !form.fare || !form.totalSeats) {
      setError("Please fill all required fields.");
      setSubmitting(false);
      return;
    }

    // Validate numeric fields
    const fare = parseInt(form.fare);
    const totalSeats = parseInt(form.totalSeats);

    if (isNaN(fare) || fare <= 0 || fare > 10000) {
      setError("Fare must be a valid number between 1 and 10000.");
      setSubmitting(false);
      return;
    }

    if (isNaN(totalSeats) || totalSeats <= 0 || totalSeats > 100) {
      setError("Total seats must be a valid number between 1 and 100.");
      setSubmitting(false);
      return;
    }

    // Validate string lengths
    if (form.name.length < 3 || form.from.length < 2 || form.to.length < 2) {
      setError("Bus name must be at least 3 characters, and locations at least 2 characters.");
      setSubmitting(false);
      return;
    }

    // Validate departure time is not in the past
    const departureTime = new Date(form.departure);
    const now = new Date();

    if (departureTime <= now) {
      setError("Departure time cannot be in the past. Please select a future date and time.");
      setSubmitting(false);
      return;
    }

    // Validate arrival is after departure
    const arrivalTime = new Date(form.arrival);
    if (arrivalTime <= departureTime) {
      setError("Arrival time must be after departure time.");
      setSubmitting(false);
      return;
    }

    try {
      const busData = {
        ...form,
        imageUrl: form.image, // Map image field to imageUrl
        fare: parseInt(form.fare),
        totalSeats: parseInt(form.totalSeats),
        availableSeats: parseInt(form.totalSeats),
        rating: 4.0,
        bookedSeats: [],
        status: "On Time"
      };
      delete busData.image; // Remove the image field

      const result = await addBus(busData);
      setPopup({ show: true, message: result.message, type: "success" });
      setTimeout(() => navigate("/admin"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="add-bus-page">
      <div className="add-bus-container">
        <div className="page-header">
          <h1>Add New Bus</h1>
          <button className="btn-back" onClick={() => navigate("/admin")}>
            ← Back to Dashboard
          </button>
        </div>

        <form className="bus-form" onSubmit={submit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="busName">Bus Name *</label>
              <input
                id="busName"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Express Travels"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="operator">Operator *</label>
              <input
                id="operator"
                name="operator"
                value={form.operator}
                onChange={handleChange}
                placeholder="Express Travels Pvt Ltd"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="busNumber">Bus Number *</label>
              <input
                id="busNumber"
                name="busNumber"
                value={form.busNumber}
                onChange={handleChange}
                placeholder="TN01AB1234"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="busType">Bus Type *</label>
              <select id="busType" name="type" value={form.type} onChange={handleChange}>
                {BUS_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="fromCity">From *</label>
              <input
                id="fromCity"
                name="from"
                value={form.from}
                onChange={handleChange}
                placeholder="Chennai"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="toCity">To *</label>
              <input
                id="toCity"
                name="to"
                value={form.to}
                onChange={handleChange}
                placeholder="Bangalore"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="departure">Departure *</label>
              <input
                id="departure"
                name="departure"
                type="datetime-local"
                value={form.departure}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="arrival">Arrival *</label>
              <input
                id="arrival"
                name="arrival"
                type="datetime-local"
                value={form.arrival}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="fare">Fare (₹) *</label>
              <input
                id="fare"
                name="fare"
                type="number"
                value={form.fare}
                onChange={handleChange}
                placeholder="450"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="totalSeats">Total Seats *</label>
              <input
                id="totalSeats"
                name="totalSeats"
                type="number"
                value={form.totalSeats}
                onChange={handleChange}
                placeholder="40"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="seatLayout">Seat Layout</label>
              <select id="seatLayout" name="seatLayout" value={form.seatLayout} onChange={handleChange}>
                <option value="1+1">1+1 (Premium)</option>
                <option value="2+1">2+1 (Sleeper)</option>
                <option value="2+2">2+2 (Standard)</option>
                <option value="2+3">2+3 (Economy)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="imageUrl">Bus Image URL (Optional)</label>
              <input
                id="imageUrl"
                name="image"
                value={form.image}
                onChange={handleChange}
                placeholder="Leave empty for default image"
              />
              <small style={{ color: '#666', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                Default bus image will be used if left empty
              </small>
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">Bus Description</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Comfortable AC bus with modern amenities..."
                rows="3"
              />
            </div>
          </div>

          <div className="amenities-section">
            <fieldset>
              <legend>Amenities</legend>
              <div className="amenities-grid">
                {AMENITIES.map(amenity => (
                  <label key={amenity} className="checkbox-label" htmlFor={`amenity-${amenity.toLowerCase().replace(/\s+/g, '-')}`}>
                    <input
                      id={`amenity-${amenity.toLowerCase().replace(/\s+/g, '-')}`}
                      type="checkbox"
                      checked={form.amenities.includes(amenity)}
                      onChange={() => handleAmenityChange(amenity)}
                    />
                    {amenity}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate("/admin")}>
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Adding Bus...' : 'Add Bus'}
            </button>
          </div>
        </form>
        
        {popup.show && (
          <MessagePopup
            message={popup.message}
            type={popup.type}
            onClose={() => setPopup({ show: false, message: "", type: "" })}
          />
        )}
      </div>
    </div>
  );
}
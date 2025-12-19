import React, { useState, useEffect, useRef } from "react";
import { useBus } from "../context/BusContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import MessagePopup from "../Components/MessagePopup";
import "./css/AdminAddBus.css";

export default function AdminEditBus() {
  const { allBuses, editBus } = useBus();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    from: "",
    to: "",
    departure: "",
    arrival: "",
    fare: "",
    type: "AC Sleeper",
    totalSeats: 40,
    operator: "",
    busNumber: "",
    amenities: [],
    imageUrl: "",
    description: ""
  });

  const [error, setError] = useState("");
  const [popup, setPopup] = useState({ show: false, message: "", type: "" });
  const [submitting, setSubmitting] = useState(false);

  const initialized = useRef(false);

  useEffect(() => {
    const bus = allBuses.find(b => b.id === id);
    if (bus && !initialized.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: bus.name,
        from: bus.from,
        to: bus.to,
        departure: new Date(bus.departure).toISOString().slice(0, 16),
        arrival: new Date(bus.arrival).toISOString().slice(0, 16),
        fare: bus.fare,
        type: bus.type,
        totalSeats: bus.totalSeats,
        operator: bus.operator,
        busNumber: bus.busNumber,
        amenities: bus.amenities || [],
        imageUrl: bus.imageUrl || "",
        description: bus.description || ""
      });
      initialized.current = true;
    }
  }, [id, allBuses]);

  if (!user || user.role !== "admin") {
    navigate("/login");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const departureDate = new Date(formData.departure);
    const arrivalDate = new Date(formData.arrival);
    const now = new Date();

    if (departureDate <= now) {
      setError("Departure time must be in the future");
      return;
    }

    if (arrivalDate <= departureDate) {
      setError("Arrival time must be after departure time");
      return;
    }

    const updatedBus = {
      ...formData,
      fare: parseInt(formData.fare),
      totalSeats: parseInt(formData.totalSeats),
      departure: departureDate.toISOString(),
      arrival: arrivalDate.toISOString()
    };

    try {
      const result = await editBus(id, updatedBus);
      setPopup({ show: true, message: result.message, type: "success" });
      setTimeout(() => navigate("/admin"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAmenityChange = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const availableAmenities = [
    "WiFi", "AC", "Charging Point", "Entertainment", "Blanket",
    "Pillow", "Water Bottle", "Snacks", "Reading Light", "GPS Tracking"
  ];

  return (
    <div className="admin-add-bus">
      <div className="add-bus-header">
        <h1>Edit Bus</h1>
        <p>Update bus information and schedule</p>
      </div>

      <form onSubmit={handleSubmit} className="add-bus-form">
        {error && <div className="form-error">{error}</div>}

        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="busName">Bus Name</label>
            <input
              id="busName"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="busNumber">Bus Number</label>
            <input
              id="busNumber"
              type="text"
              value={formData.busNumber}
              onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="fromCity">From</label>
            <input
              id="fromCity"
              type="text"
              value={formData.from}
              onChange={(e) => setFormData({ ...formData, from: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="toCity">To</label>
            <input
              id="toCity"
              type="text"
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="departure">Departure Date & Time</label>
            <input
              id="departure"
              type="datetime-local"
              value={formData.departure}
              onChange={(e) => setFormData({ ...formData, departure: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="arrival">Arrival Date & Time</label>
            <input
              id="arrival"
              type="datetime-local"
              value={formData.arrival}
              onChange={(e) => setFormData({ ...formData, arrival: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="fare">Fare (₹)</label>
            <input
              id="fare"
              type="number"
              value={formData.fare}
              onChange={(e) => setFormData({ ...formData, fare: e.target.value })}
              required
              min="1"
            />
          </div>

          <div className="form-group">
            <label htmlFor="busType">Bus Type</label>
            <select
              id="busType"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="AC Sleeper">AC Sleeper</option>
              <option value="Non-AC Sleeper">Non-AC Sleeper</option>
              <option value="AC Seater">AC Seater</option>
              <option value="Non-AC Seater">Non-AC Seater</option>
              <option value="Volvo">Volvo</option>
              <option value="Multi-Axle">Multi-Axle</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="totalSeats">Total Seats</label>
            <input
              id="totalSeats"
              type="number"
              value={formData.totalSeats}
              onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
              required
              min="20"
              max="60"
            />
          </div>

          <div className="form-group">
            <label htmlFor="operator">Operator</label>
            <input
              id="operator"
              type="text"
              value={formData.operator}
              onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
              required
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="imageUrl">Bus Image URL</label>
            <input
              id="imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/bus-image.jpg"
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description about the bus service..."
              rows="3"
            />
          </div>
        </div>

        <div className="amenities-section">
          <fieldset>
            <legend>Amenities</legend>
            <div className="amenities-grid">
              {availableAmenities.map(amenity => (
                <label key={amenity} className="amenity-checkbox" htmlFor={`amenity-${amenity.toLowerCase().replace(/\s+/g, '-')}`}>
                  <input
                    id={`amenity-${amenity.toLowerCase().replace(/\s+/g, '-')}`}
                    type="checkbox"
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => handleAmenityChange(amenity)}
                  />
                  <span>{amenity}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="form-actions">
          <button type="button" onClick={() => navigate("/admin")} className="btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Updating...' : 'Update Bus'}
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
  );
}
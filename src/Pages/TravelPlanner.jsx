import React, { useState } from "react";
import { useBus } from "../context/BusContext";
import "./css/TravelPlanner.css";

export default function TravelPlanner() {
  const { buses } = useBus();
  const [searchData, setSearchData] = useState({
    from: "",
    to: "",
    date: ""
  });
  const [suggestions, setSuggestions] = useState([]);

  const handleSearch = () => {
    if (!searchData.from || !searchData.to || !searchData.date) {
      alert("Please fill all fields");
      return;
    }

    const filtered = buses.filter(bus => 
      bus.from.toLowerCase().includes(searchData.from.toLowerCase()) &&
      bus.to.toLowerCase().includes(searchData.to.toLowerCase())
    );

    setSuggestions(filtered);
  };

  return (
    <div className="travel-planner">
      <div className="planner-header">
        <h2>Travel Planner</h2>
        <p>Plan your journey with available routes</p>
      </div>

      <div className="search-form">
        <div className="form-row">
          <input
            type="text"
            placeholder="From City"
            value={searchData.from}
            onChange={(e) => setSearchData({...searchData, from: e.target.value})}
          />
          <input
            type="text"
            placeholder="To City"
            value={searchData.to}
            onChange={(e) => setSearchData({...searchData, to: e.target.value})}
          />
          <input
            type="date"
            value={searchData.date}
            onChange={(e) => setSearchData({...searchData, date: e.target.value})}
          />
          <button onClick={handleSearch} className="search-btn">
            Search Routes
          </button>
        </div>
      </div>

      {suggestions.length > 0 && (
        <div className="suggestions">
          <h3>Available Routes</h3>
          <div className="routes-list">
            {suggestions.map(bus => (
              <div key={bus.id} className="route-card">
                <div className="route-info">
                  <h4>{bus.name}</h4>
                  <p>{bus.from} → {bus.to}</p>
                  <p>Fare: ₹{bus.fare}</p>
                  <p>Type: {bus.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState } from "react";
import "./css/SearchBar.css";

import places from "../data/places"; // if you have places.js in data folder

export default function SearchBar({ onSearch }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); 
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [activeField, setActiveField] = useState("");

  // Update date to current system date every day
  React.useEffect(() => {
    const updateDate = () => {
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
    };
    
    // Update immediately
    updateDate();
    
    // Update at midnight every day
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timeoutId = setTimeout(() => {
      updateDate();
      // Then update every 24 hours
      const intervalId = setInterval(updateDate, 24 * 60 * 60 * 1000);
      return () => clearInterval(intervalId);
    }, msUntilMidnight);
    
    return () => clearTimeout(timeoutId);
  }, []);

  function handleFromInput(value) {
    setFrom(value);
    setActiveField("from");
    showSuggestions(value, "from");
  }

  function handleToInput(value) {
    setTo(value);
    setActiveField("to");
    showSuggestions(value, "to");
  }

  function showSuggestions(value, type) {
    if (!value.trim()) {
      if (type === "from") setFromSuggestions([]);
      if (type === "to") setToSuggestions([]);
      return;
    }

    const filtered = places.filter((p) =>
      p.toLowerCase().includes(value.toLowerCase())
    );

    if (type === "from") setFromSuggestions(filtered.slice(0, 5));
    if (type === "to") setToSuggestions(filtered.slice(0, 5));
  }

  function pickSuggestion(value, type) {
    if (type === "from") {
      setFrom(value);
      setFromSuggestions([]);
    }
    if (type === "to") {
      setTo(value);
      setToSuggestions([]);
    }
    setActiveField("");
  }

  function swapLocations() {
    const temp = from;
    setFrom(to);
    setTo(temp);
  }

  function handleSearch() {
    if (!from.trim()) {
      alert("Please select departure city");
      return;
    }
    if (!to.trim()) {
      alert("Please select destination city");
      return;
    }
    if (!date) {
      alert("Please select travel date");
      return;
    }
    if (from.toLowerCase() === to.toLowerCase()) {
      alert("Departure and destination cities cannot be the same");
      return;
    }
    
    onSearch({ from: from.trim(), to: to.trim(), date });
  }

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="searchBar-container">
      {/* FROM */}
      <div className="input-wrapper">
        <label htmlFor="fromCity" className="sr-only">From City</label>
        <input
          id="fromCity"
          type="text"
          placeholder="From"
          value={from}
          onChange={(e) => handleFromInput(e.target.value)}
        />

        {activeField === "from" && fromSuggestions.length > 0 && (
          <div className="suggestion-box">
            {fromSuggestions.map((s, i) => (
              <p key={i} onClick={() => pickSuggestion(s, "from")}>
                📍 {s}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* TO */}
      <div className="input-wrapper">
        <label htmlFor="toCity" className="sr-only">To City</label>
        <input
          id="toCity"
          type="text"
          placeholder="To"
          value={to}
          onChange={(e) => handleToInput(e.target.value)}
        />

        {activeField === "to" && toSuggestions.length > 0 && (
          <div className="suggestion-box">
            {toSuggestions.map((s, i) => (
              <p key={i} onClick={() => pickSuggestion(s, "to")}>
                📍 {s}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* SWAP BUTTON */}
      <button type="button" className="swap-btn" onClick={swapLocations} title="Swap cities">
        ⇄
      </button>

      {/* DATE */}
      <label htmlFor="travelDate" className="sr-only">Travel Date</label>
      <input
        id="travelDate"
        type="date"
        className="date-input"
        value={date}
        min={today}
        onChange={(e) => setDate(e.target.value)}
      />

      {/* SEARCH BTN */}
      <button className="search-btn" onClick={handleSearch}>
        Search
      </button>
    </div>
  );
}

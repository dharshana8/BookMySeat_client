import React, { useState } from "react";
import { BUS_TYPES } from "../data/buses";
import "./css/FilterSideBar.css";

export default function FilterSideBar({ onFilterChange }) {
  const [filters, setFilters] = useState({
    type: "",
    minFare: "",
    maxFare: "",
    departureTime: ""
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };



  const clearFilters = () => {
    const emptyFilters = {
      type: "",
      minFare: "",
      maxFare: "",
      departureTime: ""
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  return (
    <div className="filter-sidebar">
      <div className="filter-header">
        <h3>Filters</h3>
        <button className="clear-filters" onClick={clearFilters}>Clear All</button>
      </div>

      {/* Bus Type Filter */}
      <div className="filter-section">
        <h4>Bus Type</h4>
        <div className="filter-options">
          {BUS_TYPES.map(type => (
            <label key={type} className="filter-option">
              <input
                type="radio"
                name="busType"
                value={type}
                checked={filters.type === type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
              />
              {type}
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="filter-section">
        <h4>Price Range</h4>
        <div className="price-inputs">
          <input
            type="number"
            placeholder="Min"
            value={filters.minFare}
            onChange={(e) => handleFilterChange("minFare", e.target.value)}
          />
          <span>to</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxFare}
            onChange={(e) => handleFilterChange("maxFare", e.target.value)}
          />
        </div>
      </div>

      {/* Departure Time Filter */}
      <div className="filter-section">
        <h4>Departure Time</h4>
        <div className="filter-options">
          <label className="filter-option">
            <input
              type="radio"
              name="departureTime"
              value="morning"
              checked={filters.departureTime === "morning"}
              onChange={(e) => handleFilterChange("departureTime", e.target.value)}
            />
            Morning (6 AM - 12 PM)
          </label>
          <label className="filter-option">
            <input
              type="radio"
              name="departureTime"
              value="afternoon"
              checked={filters.departureTime === "afternoon"}
              onChange={(e) => handleFilterChange("departureTime", e.target.value)}
            />
            Afternoon (12 PM - 6 PM)
          </label>
          <label className="filter-option">
            <input
              type="radio"
              name="departureTime"
              value="evening"
              checked={filters.departureTime === "evening"}
              onChange={(e) => handleFilterChange("departureTime", e.target.value)}
            />
            Evening (6 PM - 12 AM)
          </label>
          <label className="filter-option">
            <input
              type="radio"
              name="departureTime"
              value="night"
              checked={filters.departureTime === "night"}
              onChange={(e) => handleFilterChange("departureTime", e.target.value)}
            />
            Night (12 AM - 6 AM)
          </label>
        </div>
      </div>


    </div>
  );
}
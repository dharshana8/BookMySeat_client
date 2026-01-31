import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useBus } from "../context/BusContext";
import SearchBar from "../Components/SearchBar";
import FilterSideBar from "../Components/FilterSideBar";
import BusCard from "../Components/BusCard";
import "./css/SearchResults.css";

export default function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { searchBuses, buses: availableBuses } = useBus();
  const [searchData, setSearchData] = useState(location.state || { from: "", to: "", date: "" });
  const [buses, setBuses] = useState([]);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);


  useEffect(() => {
    if (location.state) {
      setSearchData(location.state);
    }
  }, [location.state]);

  useEffect(() => {
    const performSearch = async () => {
      setLoading(true);
      try {
        console.log("Searching with:", { ...searchData, filters, sortBy });
        const results = await searchBuses({ ...searchData, filters, sortBy });
        console.log("Search results:", results);
        setBuses(results);
      } catch (error) {
        console.error("Search error:", error);
        setBuses([]);
      } finally {
        setLoading(false);
      }
    };

    if (searchData.from && searchData.to && searchData.date) {
      performSearch();
    } else {
      setBuses([]);
    }
  }, [searchData, filters, sortBy, searchBuses]);

  const handleNewSearch = async (data) => {
    setSearchData(data);
    setLoading(true);
    try {
      const results = await searchBuses({ ...data, filters, sortBy });
      setBuses(results);
    } catch (error) {
      console.error("Search error:", error);
      setBuses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
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

  return (
    <div className="search-results-page">
      {/* Search Bar */}
      <div className="search-header">
        <SearchBar onSearch={handleNewSearch} />
      </div>

      {/* Search Info */}
      {searchData.from && searchData.to && searchData.date && (
        <div className="search-info">
          <h2>{searchData.from} → {searchData.to}</h2>
          <p>{formatDate(searchData.date)} • {buses.length} buses found</p>
          <div className="modify-search">
            <button onClick={() => setSearchData({ from: "", to: "", date: "" })} className="modify-btn">
              Modify Search
            </button>
          </div>
        </div>
      )}

      <div className="search-content">
        {/* Results Section - Full Width */}
        <div className="results-section full-width">
          {/* Results Header */}
          <div className="results-header">
            <div className="results-count">
              <strong>{buses.length} buses found</strong>
            </div>
            <div className="sort-options">
              <label htmlFor="sortSelect">Sort by:</label>
              <select id="sortSelect" value={sortBy} onChange={handleSortChange} className="sort-select">
                <option value="">Default</option>
                <option value="rating_desc">Highest Rating</option>
                <option value="departure_asc">Earliest Departure</option>
                <option value="departure_desc">Latest Departure</option>
                <option value="price_asc">Lowest Price</option>
                <option value="price_desc">Highest Price</option>
                <option value="duration_asc">Shortest Duration</option>
              </select>
            </div>
          </div>

          {/* Bus Results */}
          <div className="bus-results">
            {loading ? (
              <div className="loading">Searching buses...</div>
            ) : buses.length > 0 ? (
              <>
                {(showAll ? buses : buses.slice(0, 20)).map(bus => (
                  <BusCard key={bus.id} bus={bus} />
                ))}
                {buses.length > 20 && !showAll && (
                  <div className="see-more-section">
                    <button onClick={() => setShowAll(true)} className="see-more-btn">
                      See More Buses ({buses.length - 20} more)
                    </button>
                  </div>
                )}
              </>
            ) : searchData.from && searchData.to && searchData.date ? (
              <div className="no-results">
                <h3>No buses found for {searchData.from} → {searchData.to}</h3>
                <p>on {formatDate(searchData.date)}</p>

                {(() => {
                  // Check if there are buses for this route on any date
                  const routeBuses = availableBuses.filter(bus =>
                    bus.from.toLowerCase().includes(searchData.from.toLowerCase()) &&
                    bus.to.toLowerCase().includes(searchData.to.toLowerCase())
                  );

                  if (routeBuses.length > 0) {
                    return (
                      <div className="alternative-suggestions">
                        <h4>Buses available for {searchData.from} → {searchData.to} on other dates:</h4>
                        <div className="available-routes">
                          {routeBuses.slice(0, 4).map(bus => (
                            <div key={bus.id} className="route-suggestion-card" onClick={async () => {
                              const busDate = new Date(bus.departure).toISOString().slice(0, 10);
                              setSearchData({ from: bus.from, to: bus.to, date: busDate });
                              setLoading(true);
                              try {
                                const results = await searchBuses({ from: bus.from, to: bus.to, date: busDate, filters, sortBy });
                                setBuses(results);
                              } catch (error) {
                                console.error("Search error:", error);
                                setBuses([]);
                              } finally {
                                setLoading(false);
                              }
                            }}>
                              <h5>{bus.from} → {bus.to}</h5>
                              <p>{bus.name} - {bus.type}</p>
                              <p><strong>Date:</strong> {new Date(bus.departure).toLocaleDateString()}</p>
                              <span className="route-price">₹{bus.fare}</span>
                              <span className="route-time">{new Date(bus.departure).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div className="suggestions">
                        <h4>Try these available routes:</h4>
                        <div className="route-suggestions">
                          {availableBuses.slice(0, 6).map(bus => (
                            <span key={bus.id} className="route-tag" onClick={() => {
                              const busDate = new Date(bus.departure).toISOString().slice(0, 10);
                              handleNewSearch({ from: bus.from, to: bus.to, date: busDate });
                            }}>
                              {bus.from} → {bus.to}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
            ) : (
              <div className="popular-routes-section">
                <h3>Available Buses</h3>
                <p>Book your journey with our featured buses</p>

                <div className="today-buses">
                  {(showAll ? availableBuses : availableBuses.slice(0, 20)).map(bus => (
                    <div key={bus.id} className="bus-showcase">
                      <img src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&h=200&fit=crop" alt={bus.type} className="bus-image" />
                      <div className="bus-showcase-info">
                        <h4>{bus.from} → {bus.to}</h4>
                        <p>{bus.name} - {bus.type}</p>
                        <div className="bus-date-info">
                          <span className="travel-date">📅 {new Date(bus.departure).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                          <span className="departure-time">🕐 {new Date(bus.departure).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="bus-details-mini">
                          <span className="detail-item">🚌 {bus.operator}</span>
                          <span className="detail-item">⭐ {bus.rating.toFixed(1)}</span>
                          <span className="detail-item">🪑 {bus.availableSeats}/{bus.totalSeats} seats</span>
                        </div>
                        <div className="amenities-mini">
                          {bus.amenities?.slice(0, 3).map((amenity, idx) => (
                            <span key={idx} className="amenity-mini">{amenity}</span>
                          ))}
                          {bus.amenities?.length > 3 && <span className="amenity-mini">+{bus.amenities.length - 3}</span>}
                        </div>
                        <span className="showcase-price">₹{bus.fare}</span>
                        <button className="try-booking-btn" onClick={() => {
                          navigate(`/bus/${bus.id}/seats`);
                        }}>
                          Try Booking
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                {!showAll && availableBuses.length > 20 && (
                  <div className="see-more-section">
                    <button onClick={() => setShowAll(true)} className="see-more-btn">
                      See More Buses ({availableBuses.length - 20} more)
                    </button>
                  </div>
                )}

                <h3 style={{ marginTop: '40px' }}>Popular Routes</h3>
                <div className="popular-routes-grid">
                  {(() => {
                    const routes = {};
                    availableBuses.forEach(bus => {
                      const routeKey = `${bus.from}-${bus.to}`;
                      if (!routes[routeKey]) {
                        routes[routeKey] = {
                          from: bus.from,
                          to: bus.to,
                          minFare: bus.fare,
                          count: 1,
                          duration: calculateDuration(bus.departure, bus.arrival)
                        };
                      } else {
                        routes[routeKey].minFare = Math.min(routes[routeKey].minFare, bus.fare);
                        routes[routeKey].count++;
                      }
                    });
                    return Object.values(routes).slice(0, 4).map((route, idx) => (
                      <div key={idx} className="popular-route-card" onClick={() => handleNewSearch({ from: route.from, to: route.to, date: "2026-01-31" })}>
                        <div className="route-info">
                          <h4>{route.from} → {route.to}</h4>
                          <p>Starting from ₹{route.minFare}</p>
                          <span className="route-duration">{route.duration} journey</span>
                        </div>
                        <div className="route-stats">
                          <span className="buses-count">{route.count} buses</span>
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import axios from 'axios';
import { useAuth } from './AuthContext';
const BusContext = createContext();
export const useBus = () => useContext(BusContext);

const API = import.meta.env.PROD 
  ? 'https://bookmyseat-server-1.onrender.com'
  : 'http://localhost:5000';

export function BusProvider({ children }) {
  const [buses, setBuses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { user, token } = useAuth();

  // Initial data load on component mount
  useEffect(() => {
    setRefreshTrigger(1);
  }, []);

  useEffect(() => {
    async function load() {
      if (loading) return;
      setLoading(true);
      try {
        const res = await axios.get(`${API}/api/buses`);
        setBuses(res.data || []);
      } catch (err) { 
        console.error('Failed to load buses:', err);
        setBuses([]);
      }
      finally { setLoading(false); }
    }
    load();
  }, [refreshTrigger]);

  // Load data on component mount and when user changes
  useEffect(() => {
    setRefreshTrigger(prev => prev + 1);
  }, [user]);

  useEffect(() => {
    async function loadBookings() {
      try {
        if (user && token) {
          if (user.role === 'admin') {
            const res = await axios.get(`${API}/api/buses/admin/bookings`, { headers: { Authorization: `Bearer ${token}` } });
            setBookings(res.data || []);
          } else {
            const res = await axios.get(`${API}/api/buses/me/bookings`, { headers: { Authorization: `Bearer ${token}` } });
            setBookings(res.data || []);
          }
        } else {
          setBookings([]);
        }
      } catch (err) { 
        console.error('Failed to load bookings:', err);
        setBookings([]);
      }
    }
    loadBookings();
  }, [user, token, refreshTrigger]);

  async function addBus(bus) {
    try {
      const res = await axios.post(`${API}/api/buses`, bus, { headers: { Authorization: `Bearer ${token}` } });
      // Immediately add to local state
      setBuses(prev => [res.data, ...prev]);
      // Trigger refresh to get updated list from server
      setRefreshTrigger(prev => prev + 1);
      return { success: true, message: 'Bus added successfully!' };
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to add bus');
    }
  }
  async function editBus(id, patch) {
    try {
      const res = await axios.put(`${API}/api/buses/${id}`, patch, { headers: { Authorization: `Bearer ${token}` } });
      setBuses(prev => prev.map(b => b.id === id ? res.data : b));
      setRefreshTrigger(prev => prev + 1);
      return { success: true, message: 'Bus updated successfully!' };
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update bus');
    }
  }
  async function deleteBus(id) {
    try {
      await axios.delete(`${API}/api/buses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setBuses(prev => prev.filter(b => b.id !== id));
      setRefreshTrigger(prev => prev + 1);
      return { success: true, message: 'Bus deleted successfully!' };
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete bus');
    }
  }

  const searchBuses = useCallback(async ({ from, to, date, filters = {}, sortBy = null }) => {
    const params = {};
    if (from) params.from = from;
    if (to) params.to = to;
    if (date) params.date = date;
    if (filters.type) params.type = filters.type;
    if (filters.minFare) params.minFare = filters.minFare;
    if (filters.maxFare) params.maxFare = filters.maxFare;
    try {
      const res = await axios.get(`${API}/api/buses`, { params });
      let resData = res.data;
      if (sortBy === "price_asc") resData.sort((a, b) => a.fare - b.fare);
      if (sortBy === "price_desc") resData.sort((a, b) => b.fare - a.fare);
      if (sortBy === "departure_asc") resData.sort((a, b) => new Date(a.departure) - new Date(b.departure));
      if (sortBy === "rating_desc") resData.sort((a, b) => b.rating - a.rating);
      return resData;
    } catch (err) { return [] }
  }, []);

  async function holdSeats({ busId, seats }) {
    try {
      if (!token) throw new Error('Not authenticated');
      const res = await axios.post(`${API}/api/buses/${busId}/hold`, { seats }, { headers: { Authorization: `Bearer ${token}` } });
      return res.data;
    } catch (err) {
      throw err;
    }
  }

  async function createBooking({ busId, seats, totalAmount, discount = 0 }) {
    try {
      if (!token) throw new Error('Not authenticated');
      const finalAmount = totalAmount - discount;
      const payment = { 
        totalAmount, 
        discount, 
        finalAmount, 
        method: 'Online', 
        status: 'Completed' 
      };
      const res = await axios.post(`${API}/api/buses/${busId}/book`, { seats, payment }, { headers: { Authorization: `Bearer ${token}` } });
      setBookings(prev => [res.data, ...prev]);
      if (res.data.bus) {
        setBuses(prev => prev.map(b => b.id === res.data.bus.id ? res.data.bus : b));
      }
      setRefreshTrigger(prev => prev + 1);
      return res.data;
    } catch (err) { 
      throw err;
    }
  }

  async function getUserBookings() {
    try {
      if (!token) return [];
      const res = await axios.get(`${API}/api/buses/me/bookings`, { headers: { Authorization: `Bearer ${token}` } });
      setBookings(res.data);
      return res.data;
    } catch (err) { return [] }
  }

  async function cancelBooking(bookingId) {
    try {
      if (!token) throw new Error('Not authenticated');
      const res = await axios.post(`${API}/api/buses/bookings/${bookingId}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
      // Refresh bookings
      await getUserBookings();
      setRefreshTrigger(prev => prev + 1);
      return res.data;
    } catch (err) { throw err }
  }

  function addNotification(bookingId, message) {
    setBookings(prev => prev.map(b =>
      b._id === bookingId
        ? { ...b, notifications: [...(b.notifications || []), { message, time: new Date().toISOString() }] }
        : b
    ));
  }

  function clearBookingHistory() {
    setBookings([]);
  }

  async function clearAllBookings() {
    try {
      if (!token) throw new Error('Not authenticated');
      await axios.delete(`${API}/api/buses/admin/bookings/clear`, { headers: { Authorization: `Bearer ${token}` } });
      setBookings([]);
      setRefreshTrigger(prev => prev + 1);
      return { success: true, message: 'All bookings cleared successfully' };
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to clear bookings');
    }
  }

  function refreshBusData() {
    setRefreshTrigger(prev => prev + 1);
  }

  function forceRefresh() {
    setRefreshTrigger(prev => prev + 1);
  }

  async function fetchBuses(params = {}) {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/api/buses`, { params });
      setBuses(res.data || []);
      return res.data || [];
    } catch (err) {
      setBuses([]);
      return [];
    } finally {
      setLoading(false);
    }
  }

  async function updateBusDelay(busId, delayMinutes, reason) {
    try {
      if (!token) throw new Error('Not authenticated');
      const res = await axios.put(`${API}/api/buses/${busId}/delay`, 
        { delayMinutes, reason }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local bus data immediately
      setBuses(prev => prev.map(b => b.id === busId ? res.data.bus : b));
      setRefreshTrigger(prev => prev + 1);
      
      return res.data;
    } catch (err) {
      throw err;
    }
  }

  async function clearBusDelay(busId) {
    try {
      if (!token) throw new Error('Not authenticated');
      const res = await axios.delete(`${API}/api/buses/${busId}/delay`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local bus data immediately
      setBuses(prev => prev.map(b => b.id === busId ? res.data.bus : b));
      setRefreshTrigger(prev => prev + 1);
      
      return res.data;
    } catch (err) {
      throw err;
    }
  }

  async function getDelayHistory() {
    try {
      if (!token) throw new Error('Not authenticated');
      const res = await axios.get(`${API}/api/buses/admin/delays`, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return res.data;
    } catch (err) {
      throw err;
    }
  }

  // Get available buses (show all buses for display)
  const getAvailableBuses = useMemo(() => {
    return buses; // Show all buses regardless of departure time
  }, [buses]);

  // Auto-refresh for admins every 30 seconds to sync data
  useEffect(() => {
    if (user?.role === 'admin') {
      const interval = setInterval(() => {
        setRefreshTrigger(prev => prev + 1);
      }, 30000); // 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [user]);

  const contextValue = useMemo(() => ({
    buses: getAvailableBuses,
    allBuses: buses,
    bookings,
    loading,
    addBus,
    editBus,
    deleteBus,
    searchBuses,
    holdSeats,
    createBooking,
    getUserBookings,
    cancelBooking,
    addNotification,
    clearBookingHistory,
    clearAllBookings,
    refreshBusData,
    forceRefresh,
    fetchBuses,
    updateBusDelay,
    clearBusDelay,
    getDelayHistory
  }), [getAvailableBuses, buses, bookings, loading, searchBuses]);

  return <BusContext.Provider value={contextValue}>{children}</BusContext.Provider>;
}

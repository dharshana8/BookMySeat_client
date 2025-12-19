import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CouponContext = createContext();
export const useCoupon = () => useContext(CouponContext);

const API = import.meta.env.PROD 
  ? 'https://bookmyseat-server-1.onrender.com'
  : 'http://localhost:5000';

export function CouponProvider({ children }) {
  const [coupons, setCoupons] = useState([]);
  const auth = useAuth();
  const token = auth?.token;

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      const res = await axios.get(`${API}/api/coupons`);
      setCoupons(res.data);
    } catch (err) {
      // Silent fail
    }
  };

  const addCoupon = async (coupon) => {
    try {
      const res = await axios.post(`${API}/api/coupons`, coupon, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoupons(prev => [...prev, res.data]);
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to add coupon');
    }
  };

  const updateCoupon = async (id, updates) => {
    try {
      const res = await axios.put(`${API}/api/coupons/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoupons(prev => prev.map(c => c._id === id ? res.data : c));
      return res.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to update coupon');
    }
  };

  const deleteCoupon = async (id) => {
    try {
      await axios.delete(`${API}/api/coupons/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCoupons(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Failed to delete coupon');
    }
  };

  const toggleCouponStatus = async (id) => {
    const coupon = coupons.find(c => c._id === id);
    if (coupon) {
      await updateCoupon(id, { isActive: !coupon.isActive });
    }
  };

  const getActiveCoupons = () => coupons.filter(c => c.isActive);

  return (
    <CouponContext.Provider value={{
      coupons,
      addCoupon,
      updateCoupon,
      deleteCoupon,
      toggleCouponStatus,
      getActiveCoupons,
      loadCoupons
    }}>
      {children}
    </CouponContext.Provider>
  );
}
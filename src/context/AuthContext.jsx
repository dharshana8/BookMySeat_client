import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const LS_KEY = "bb_auth_user";

const API = import.meta.env.PROD 
  ? (import.meta.env.VITE_API_URL_PROD || 'https://your-backend-url.herokuapp.com')
  : (import.meta.env.VITE_API_URL || 'http://localhost:5000');

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || null } catch { return null }
  });

  useEffect(() => { localStorage.setItem(LS_KEY, JSON.stringify(auth)) }, [auth]);

  useEffect(() => {
    const verifyToken = async () => {
      if (auth?.token) {
        try {
          await axios.get(`${API}/api/auth/verify`, {
            headers: { Authorization: `Bearer ${auth.token}` }
          });
        } catch (err) {
          logout();
        }
      }
    };
    verifyToken();
  }, []);

  async function signup({ name, email, password }) {
    try {
      const res = await axios.post(`${API}/api/auth/signup`, { name, email, password });
      const authData = { user: res.data.user, token: res.data.token };
      localStorage.setItem(LS_KEY, JSON.stringify(authData));
      setAuth(authData);
      
      // Force immediate data refresh for new users
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
      return res.data.user;
    } catch (err) {
      if (err.code === 'NETWORK_ERROR' || !err.response) {
        throw new Error('Unable to connect to server. Please check your internet connection.');
      }
      throw err;
    }
  }

  async function login({ email, password }) {
    try {
      const res = await axios.post(`${API}/api/auth/login`, { email, password });
      const authData = { user: res.data.user, token: res.data.token };
      localStorage.setItem(LS_KEY, JSON.stringify(authData));
      setAuth(authData);
      
      // Force immediate data refresh for returning users
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
      return res.data.user;
    } catch (err) {
      if (!err.response) {
        throw new Error('Server connection failed. Please check if server is running.');
      }
      throw err;
    }
  }

  function logout() {
    localStorage.removeItem(LS_KEY);
    setAuth(null);
    // Force navigation to home page after logout
    window.location.href = '/';
  }

  async function updateProfile(patch) {
    // not implemented server-side yet - optimistic local update
    setAuth(prev => ({ ...prev, user: { ...prev.user, ...patch } }));
  }

  return <AuthContext.Provider value={{ user: auth?.user || null, token: auth?.token || null, signup, login, logout, updateProfile }}>{children}</AuthContext.Provider>;
}

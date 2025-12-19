import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { BusProvider } from "./context/BusContext.jsx";
import { CouponProvider } from "./context/CouponContext.jsx";
import Header from "./Components/Header.jsx";
import Home from "./Pages/Home.jsx";
import Auth from "./Pages/Auth.jsx";
import SearchResults from "./Pages/SearchResults.jsx";
import SeatSelection from "./Pages/SeatSelection.jsx";
import Payment from "./Pages/Payment.jsx";
import MyAccount from "./Pages/MyAccount.jsx";
import AdminDashBoard from "./Pages/AdminDashBoard.jsx";
import AdminAddBus from "./Pages/AdminAddBus.jsx";
import AdminEditBus from "./Pages/AdminEditBus.jsx";
import ProtectedRoute from "./Components/ProtectedRoute.jsx";

export default function App() {
  return (
    <AuthProvider>
      <BusProvider>
        <CouponProvider>
          <BrowserRouter>
            <Header />

            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/search" element={<SearchResults />} />

              {/* Seat Selection (protected) */}
              <Route path="/bus/:id/seats" element={<ProtectedRoute><SeatSelection /></ProtectedRoute>} />
              
              {/* Payment (protected) */}
              <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />

              {/* User Account (public but shows login prompt if not authenticated) */}
              <Route path="/my-account" element={<MyAccount />} />

              {/* Admin Pages (protected; components check for admin role) */}
              <Route path="/admin" element={<ProtectedRoute><AdminDashBoard /></ProtectedRoute>} />
              <Route path="/admin/add" element={<ProtectedRoute><AdminAddBus /></ProtectedRoute>} />
              <Route path="/admin/edit/:id" element={<ProtectedRoute><AdminEditBus /></ProtectedRoute>} />
              <Route path="/admin/manage" element={<ProtectedRoute><AdminAddBus /></ProtectedRoute>} />
            </Routes>
          </BrowserRouter>
        </CouponProvider>
      </BusProvider>
    </AuthProvider>
  );
}

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatorProfile from './pages/CreatorProfile';
import Dashboard from './pages/Dashboard';
import Finances from './pages/Finances';
import PaymentTest from './pages/PaymentTest';
import PaymentSuccess from './pages/PaymentSuccess';

export default function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/finances" element={<Finances />} />
        <Route path="/:username" element={<CreatorProfile />} />
        <Route path="/payment/test" element={<PaymentTest />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
      </Routes>
    </>
  );
}
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { MinimalHeader } from './components/ui/minimal-header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatorProfile from './pages/CreatorProfile';
import Dashboard from './pages/Dashboard';
import Finances from './pages/Finances';
import PaymentTest from './pages/PaymentTest';
import PaymentSuccess from './pages/PaymentSuccess';
// Import dashboard sub-pages
import Icons from './pages/dashboard/Icons';
import Withdraws from './pages/dashboard/Withdraws';
import Donations from './pages/dashboard/Donations';
import Documents from './pages/dashboard/Documents';
import Settings from './pages/dashboard/Settings';

export default function AppRoutes() {
  return (
    <>
      <MinimalHeader />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/icons" element={<Icons />} />
        <Route path="/dashboard/withdraws" element={<Withdraws />} />
        <Route path="/dashboard/donations" element={<Donations />} />
        <Route path="/dashboard/documents" element={<Documents />} />
        <Route path="/dashboard/settings" element={<Settings />} />
        <Route path="/dashboard/finances" element={<Finances />} />
        <Route path="/:username" element={<CreatorProfile />} />
        <Route path="/payment/test" element={<PaymentTest />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
      </Routes>
    </>
  );
}
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreatorProfile from './pages/CreatorProfile';
import Dashboard from './pages/Dashboard';
import Finances from './pages/Finances';
import Settings from './pages/Settings';
import PaymentTest from './pages/PaymentTest';
import PaymentSuccess from './pages/PaymentSuccess';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import { AuthProvider } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { PaymentsProvider } from './contexts/PaymentsContext';
import { PayoutProvider } from './contexts/PayoutContext';

function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <PaymentsProvider>
          <PayoutProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-gray-50">
                <Navbar />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/dashboard/finances" element={<Finances />} />
                  <Route path="/dashboard/settings" element={<Settings />} />
                  <Route path="/:username" element={<CreatorProfile />} />
                  <Route path="/payment/test" element={<PaymentTest />} />
                  <Route path="/payment/success" element={<PaymentSuccess />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<Terms />} />
                </Routes>
                <Toaster position="top-center" />
              </div>
            </BrowserRouter>
          </PayoutProvider>
        </PaymentsProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}

export default App
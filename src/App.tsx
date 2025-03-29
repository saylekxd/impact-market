import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { MinimalHeader } from './components/ui/minimal-header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import CreatorProfile from './pages/CreatorProfile';
import Dashboard from './pages/Dashboard';
import Finances from './pages/Finances';
import Settings from './pages/dashboard/Settings';
import Icons from './pages/dashboard/Icons';
import Withdraws from './pages/dashboard/Withdraws';
import PaymentTest from './pages/PaymentTest';
import PaymentSuccess from './pages/PaymentSuccess';
import About from './pages/About';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Terms from './pages/Terms';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { PaymentsProvider } from './contexts/PaymentsContext';
import { PayoutProvider } from './contexts/PayoutContext';
import StripeProvider from './components/StripeProvider';
import Donations from './pages/dashboard/Donations';
import Documents from './pages/dashboard/Documents';

// Wrapped App component to use hooks
function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  
  // Check if the current route is a dashboard route
  const isDashboardRoute = location.pathname.startsWith('/dashboard');
  // Check if the current route is a creator profile route
  const isCreatorProfileRoute = location.pathname.startsWith('/creator/') || /^\/[^/]+$/.test(location.pathname); // Matches /:username
  const isOnboardingRoute = location.pathname.startsWith('/onboarding');

  // Determine if the header should be shown
  let showHeader;
  if (isCreatorProfileRoute) {
    // Never show header on creator profile pages
    showHeader = false;
  } else {
    // Original logic for other pages: 
    // Show header if user is not logged in OR if they are logged in but
    // NOT on dashboard or onboarding.
    showHeader = !user || (user && !isDashboardRoute && !isOnboardingRoute);
  }
  
  return (
    <div className="min-h-screen">
      {showHeader && <MinimalHeader />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/finances" element={<Finances />} />
        <Route path="/dashboard/settings" element={<Settings />} />
        <Route path="/dashboard/icons" element={<Icons />} />
        <Route path="/dashboard/withdraws" element={<Withdraws />} />
        <Route path="/dashboard/donations" element={<Donations />} />
        <Route path="/dashboard/documents" element={<Documents />} />
        <Route path="/:username" element={<CreatorProfile />} />
        <Route path="/payment/test" element={<PaymentTest />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
      <Toaster position="top-center" />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProfileProvider>
        <PaymentsProvider>
          <PayoutProvider>
            <StripeProvider>
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </StripeProvider>
          </PayoutProvider>
        </PaymentsProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}

export default App
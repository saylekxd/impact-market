import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { MinimalHeader } from './components/ui/minimal-header';
import { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { PaymentsProvider } from './contexts/PaymentsContext';
import { PayoutProvider } from './contexts/PayoutContext';
import StripeProvider from './components/StripeProvider';

// Lazy load page components
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const CreatorProfile = lazy(() => import('./pages/CreatorProfile'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Finances = lazy(() => import('./pages/Finances'));
const Settings = lazy(() => import('./pages/dashboard/Settings'));
const Icons = lazy(() => import('./pages/dashboard/Icons'));
const Withdraws = lazy(() => import('./pages/dashboard/Withdraws'));
const PaymentTest = lazy(() => import('./pages/PaymentTest'));
const PaymentSuccess = lazy(() => import('./pages/PaymentSuccess'));
const About = lazy(() => import('./pages/About'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Terms = lazy(() => import('./pages/Terms'));
const Donations = lazy(() => import('./pages/dashboard/Donations'));
const Documents = lazy(() => import('./pages/dashboard/Documents'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
  </div>
);

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
      <Suspense fallback={<PageLoader />}>
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
      </Suspense>
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
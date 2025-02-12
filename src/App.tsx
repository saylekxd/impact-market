import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AppRoutes from './AppRoutes.tsx';
import { AuthProvider } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { PaymentsProvider } from './contexts/PaymentsContext';
import { PayoutProvider } from './contexts/PayoutContext';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProfileProvider>
          <PaymentsProvider>
            <PayoutProvider>
              <div className="min-h-screen bg-gray-50">
                <AppRoutes />
                <Toaster position="top-center" />
              </div>
            </PayoutProvider>
          </PaymentsProvider>
        </ProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
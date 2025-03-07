import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../pages/dashboard/components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../lib/auth';
import { toast } from 'react-hot-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = async () => {
    const result = await auth.logout();
    if (result.success) {
      navigate('/');
    } else {
      toast.error(result.error || 'Błąd podczas wylogowywania');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-64 mb-8 md:mb-0">
            <Sidebar onLogout={handleLogout} />
          </div>
          <div className="flex-1 md:pl-8">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
} 
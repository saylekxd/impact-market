import React from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../pages/dashboard/components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../lib/auth';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

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
    <div className="h-screen flex bg-[#dcddd7] text-[#FF8C3B]">
      {/* Sidebar */}
      <div className="w-64 shrink-0">
        <motion.div 
          className="h-full"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Sidebar onLogout={handleLogout} />
        </motion.div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto pt-2">
        <motion.div 
          className="p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
} 
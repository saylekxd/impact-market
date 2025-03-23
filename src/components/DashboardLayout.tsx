import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar, { MobileBottomNav } from '../pages/dashboard/components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../lib/auth';
import { toast } from 'react-hot-toast';
import { Menu } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  
  // Check screen size on mount and resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
      setIsTablet(window.innerWidth >= 640 && window.innerWidth < 1024); // md to lg breakpoint
      
      // Auto-collapse sidebar on tablet
      if (window.innerWidth >= 640 && window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    
    // Set initial values
    checkScreenSize();
    
    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    // Clean up
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
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

  const toggleMobileSidebar = () => {
    if (isMobile) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    }
  };

  return (
    <div className="h-screen flex bg-[#dcddd7] text-[#FF8C3B] overflow-hidden">
      {/* Sidebar - desktop and tablet */}
      {!isMobile && (
        <div className={`${isCollapsed ? 'w-20' : 'w-64'} shrink-0 transition-all duration-300`}>
          <div className="h-full">
            <Sidebar 
              onLogout={handleLogout} 
              isCollapsed={isCollapsed}
            />
          </div>
        </div>
      )}

      {/* Mobile sidebar - slide in from left */}
      {isMobile && isMobileSidebarOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <Sidebar 
            onLogout={handleLogout}
            isMobile={true}
            toggleSidebar={() => setIsMobileSidebarOpen(false)}
          />
        </>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile header */}
        {isMobile && (
          <div className="bg-[rgb(26,26,26)] text-white p-4 flex items-center justify-between">
            <button 
              className="p-1 rounded-lg hover:bg-white/10 transition-colors"
              onClick={toggleMobileSidebar}
              aria-label="Menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <span className="text-lg font-bold">Panel twórcy</span>
            <div className="w-6" /> {/* Empty spacer for balance */}
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto pt-2">
          <div className="p-8 pb-20">
            {children}
          </div>
        </div>
        
        {/* Mobile bottom navigation */}
        {isMobile && <MobileBottomNav onLogout={handleLogout} />}
      </div>
    </div>
  );
} 
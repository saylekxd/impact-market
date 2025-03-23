import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserCircle, Wallet, Settings, LogOut, Image, Heart, FileText, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  onLogout: () => void;
  isCollapsed?: boolean;
  toggleSidebar?: () => void;
  isMobile?: boolean;
}

export default function Sidebar({ onLogout, isCollapsed = false, toggleSidebar, isMobile = false }: SidebarProps) {
  const location = useLocation();

  const menuItems = [
    { name: 'Profil', icon: <UserCircle className="h-5 w-5" />, path: '/dashboard' },
    { name: 'Ikony', icon: <Image className="h-5 w-5" />, path: '/dashboard/icons' },
    { name: 'Wypłaty', icon: <Wallet className="h-5 w-5" />, path: '/dashboard/withdraws' },
    { name: 'Darowizny', icon: <Heart className="h-5 w-5" />, path: '/dashboard/donations' },
    { name: 'Dokumenty', icon: <FileText className="h-5 w-5" />, path: '/dashboard/documents' },
    { name: 'Ustawienia', icon: <Settings className="h-5 w-5" />, path: '/dashboard/settings' }
  ];

  // If sidebar is completely hidden on mobile, return null
  if (isMobile && isCollapsed) {
    return null;
  }

  // Only trigger animations on sidebar mount, not on route changes
  return (
    <div 
      className={`h-full bg-[rgb(26,26,26)] text-white ${
        isMobile ? 'fixed z-50 w-64 shadow-xl rounded-r-xl' : 'rounded-r-xl'
      } ${isCollapsed && !isMobile ? 'w-20' : 'w-64'} overflow-hidden transition-all duration-300`}
      style={{ 
        transform: isMobile ? undefined : 'none', 
        opacity: 1
      }}
    >
      <div className="h-full flex flex-col p-5">
        <div 
          className="flex items-center justify-between flex-shrink-0 mb-8 pl-2"
        >
          {!isCollapsed && <span className="text-xl font-bold tracking-tight">Panel twórcy</span>}
        </div>
        
        <nav className="flex-1 space-y-1">
          {menuItems.map((item, index) => (
            <div
              key={item.path}
            >
              <Link
                to={item.path}
                className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center px-2' : 'px-4'} py-3 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-white/10 font-medium'
                    : 'hover:bg-white/5'
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                <span className={`${isCollapsed && !isMobile ? 'w-8 h-8 flex items-center justify-center' : 'mr-3'}`}>
                  {React.cloneElement(item.icon, { className: isCollapsed ? 'h-6 w-6' : 'h-5 w-5' })}
                </span>
                {(!isCollapsed || isMobile) && <span>{item.name}</span>}
              </Link>
            </div>
          ))}
        </nav>
        
        <div 
          className="flex-shrink-0 pt-4 mt-8 border-t border-white/10"
        >
          <button
            onClick={onLogout}
            className={`flex items-center ${isCollapsed && !isMobile ? 'justify-center px-2' : 'px-4'} py-3 rounded-lg w-full hover:bg-white/5 transition-all duration-200`}
            title={isCollapsed ? "Wyloguj się" : undefined}
          >
            <span className={`${isCollapsed && !isMobile ? 'w-8 h-8 flex items-center justify-center' : 'mr-3'}`}>
              <LogOut className={isCollapsed ? 'h-6 w-6' : 'h-5 w-5'} />
            </span>
            {(!isCollapsed || isMobile) && <span>Wyloguj się</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

// Mobile bottom navigation for smaller screens
export function MobileBottomNav({ onLogout }: { onLogout: () => void }) {
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const menuItems = [
    { name: 'Profil', icon: <UserCircle className="h-6 w-14" />, path: '/dashboard' },
    { name: 'Ikony', icon: <Image className="h-6 w-14" />, path: '/dashboard/icons' },
    { name: 'Wypłaty', icon: <Wallet className="h-6 w-14" />, path: '/dashboard/withdraws' },
    { name: 'Darowizny', icon: <Heart className="h-6 w-14" />, path: '/dashboard/donations' }
  ];

  return (
    <>
      <div 
        className="fixed bottom-0 left-0 right-0 bg-[rgb(26,26,26)] text-white shadow-lg z-50"
        style={{ transform: 'none' }}
      >
        <div className="flex justify-between p-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center p-2 rounded-lg ${
                location.pathname === item.path
                  ? 'bg-white/10 font-medium'
                  : 'hover:bg-white/5'
              }`}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.name}</span>
            </Link>
          ))}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-white/5"
          >
            <LogOut className="h-6 w-6" />
            <span className="text-xs mt-1">Wyloguj</span>
          </button>
        </div>
      </div>

      {/* Logout confirmation dialog */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div 
            className="bg-white rounded-lg p-6 max-w-sm w-full text-gray-900"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <h3 className="text-lg font-medium mb-4">Czy na pewno chcesz się wylogować?</h3>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
              >
                Anuluj
              </button>
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Wyloguj
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
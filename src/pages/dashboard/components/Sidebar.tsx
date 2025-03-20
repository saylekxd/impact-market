import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserCircle, Wallet, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
  onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const location = useLocation();

  const menuItems = [
    { name: 'Profil', icon: <UserCircle className="h-5 w-5" />, path: '/dashboard' },
    { name: 'Finanse', icon: <Wallet className="h-5 w-5" />, path: '/dashboard/finances' },
    { name: 'Ustawienia', icon: <Settings className="h-5 w-5" />, path: '/dashboard/settings' }
  ];

  return (
    <div className="h-full bg-[rgb(26,26,26)] text-white rounded-r-xl overflow-hidden">
      <div className="h-full flex flex-col p-5">
        <motion.div 
          className="flex items-center flex-shrink-0 mb-8 pl-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-xl font-bold tracking-tight">Panel twórcy</span>
        </motion.div>
        
        <nav className="flex-1 space-y-1">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Link
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-white/10 font-medium'
                    : 'hover:bg-white/5'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </motion.div>
          ))}
        </nav>
        
        <motion.div 
          className="flex-shrink-0 pt-4 mt-8 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <button
            onClick={onLogout}
            className="flex items-center px-4 py-3 rounded-lg w-full hover:bg-white/5 transition-all duration-200"
          >
            <LogOut className="mr-3 h-5 w-5" />
            <span>Wyloguj się</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
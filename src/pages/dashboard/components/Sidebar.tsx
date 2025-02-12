import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserCircle, Wallet, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const location = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="h-full flex flex-col">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <span className="text-xl font-semibold text-gray-800">Panel twórcy</span>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            <Link
              to="/dashboard"
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                location.pathname === '/dashboard'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <UserCircle className="mr-3 h-6 w-6" />
              Profil
            </Link>
            <Link
              to="/dashboard/finances"
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                location.pathname === '/dashboard/finances'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Wallet className="mr-3 h-6 w-6" />
              Finanse
            </Link>
            <Link
              to="/dashboard/settings"
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                location.pathname === '/dashboard/settings'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Settings className="mr-3 h-6 w-6" />
              Ustawienia
            </Link>
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <button
            onClick={onLogout}
            className="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <LogOut className="mr-3 h-6 w-6" />
            Wyloguj się
          </button>
        </div>
      </div>
    </div>
  );
}
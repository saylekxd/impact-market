import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, LogOut, User, ShoppingCart } from 'lucide-react';
import { auth } from '../lib/auth';
import { toast } from 'react-hot-toast';

export default function Navbar() {
  const { user } = useAuth();

  const handleLogout = async () => {
    const result = await auth.logout();
    if (!result.success) {
      toast.error(result.error);
    }
  };

  return (
    <nav className="bg-gradient-to-r from-[#2D1B69] to-[#1a1047] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-white hover:text-[#FF9F2D] transition-colors duration-200"
            >
              <ShoppingCart className="w-8 h-8 text-[#FF9F2D]" />
              <span className="font-bold text-xl">
                Impact<span className="text-[#FF9F2D]">market.pl</span>
              </span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
                >
                  <User className="w-5 h-5" />
                  <span>Panel</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Wyloguj</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors duration-200"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Zaloguj</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center px-4 py-2 rounded-full bg-[#FF9F2D] text-white hover:bg-[#f39729] transition-all duration-200 transform hover:scale-105"
                >
                  Zarejestruj się
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
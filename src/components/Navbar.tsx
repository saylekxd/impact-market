import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, LogOut, User, Home } from 'lucide-react';
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
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center text-gray-800 hover:text-gray-600">
              <Home className="w-6 h-6 mr-2" />
              <span className="font-semibold text-lg">TipTwórca</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center text-gray-600 hover:text-gray-800"
                >
                  <User className="w-5 h-5 mr-1" />
                  <span>Panel</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-gray-600 hover:text-gray-800"
                >
                  <LogOut className="w-5 h-5 mr-1" />
                  <span>Wyloguj</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center text-gray-600 hover:text-gray-800"
                >
                  <LogIn className="w-5 h-5 mr-1" />
                  <span>Zaloguj</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
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
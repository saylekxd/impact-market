import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import { Shield, Key, Bell } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState({
    emailOnDonation: true,
    emailOnPayout: true,
    marketingEmails: false,
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Simulate loading settings
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [user, navigate]);

  const handleToggleNotification = (setting: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    
    toast.success('Ustawienia powiadomień zaktualizowane');
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <p className="text-xl text-gray-600">Ładowanie...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Ustawienia</h1>
          <p className="mt-1 text-sm text-gray-500">
            Zarządzaj ustawieniami swojego konta
          </p>
        </div>

        {/* Bezpieczeństwo */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-8">
            <div className="flex items-center mb-6">
              <Shield className="h-6 w-6 text-gray-400 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Bezpieczeństwo</h2>
            </div>
            
            <div className="space-y-4">
              <button
                className="w-full sm:w-auto flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => toast.success('Link do zmiany adresu e-mail został wysłany')}
              >
                Zmień adres e-mail
              </button>
              
              <button
                className="w-full sm:w-auto flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => toast.success('Link do zmiany hasła został wysłany')}
              >
                Zmień hasło
              </button>
            </div>
          </div>
        </div>

        {/* API */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-8">
            <div className="flex items-center mb-6">
              <Key className="h-6 w-6 text-gray-400 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Klucze API</h2>
            </div>
            
            <p className="mb-4 text-gray-600">
              Uzyskaj klucz API, aby integrować swoją stronę z naszą platformą
            </p>
            
            <button
              className="w-full sm:w-auto flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => toast.success('Klucz API wygenerowany')}
            >
              Generuj klucz API
            </button>
          </div>
        </div>

        {/* Powiadomienia */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex items-center mb-6">
              <Bell className="h-6 w-6 text-gray-400 mr-3" />
              <h2 className="text-xl font-bold text-gray-900">Powiadomienia</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Powiadomienia o wpłatach</h3>
                  <p className="text-sm text-gray-500">Otrzymuj e-mail, gdy ktoś Cię wesprze</p>
                </div>
                <button 
                  className={`${
                    notifications.emailOnDonation 
                      ? 'bg-blue-600' 
                      : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  onClick={() => handleToggleNotification('emailOnDonation')}
                >
                  <span 
                    className={`${
                      notifications.emailOnDonation ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  ></span>
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Powiadomienia o wypłatach</h3>
                  <p className="text-sm text-gray-500">Otrzymuj e-mail, gdy Twoja wypłata zostanie zrealizowana</p>
                </div>
                <button 
                  className={`${
                    notifications.emailOnPayout 
                      ? 'bg-blue-600' 
                      : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  onClick={() => handleToggleNotification('emailOnPayout')}
                >
                  <span 
                    className={`${
                      notifications.emailOnPayout ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  ></span>
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">E-maile marketingowe</h3>
                  <p className="text-sm text-gray-500">Otrzymuj informacje o nowych funkcjach i promocjach</p>
                </div>
                <button 
                  className={`${
                    notifications.marketingEmails 
                      ? 'bg-blue-600' 
                      : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                  onClick={() => handleToggleNotification('marketingEmails')}
                >
                  <span 
                    className={`${
                      notifications.marketingEmails ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  ></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 
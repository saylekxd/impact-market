import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function PaymentCancel() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto redirect after 10 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-xl p-8">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-red-100 rounded-full scale-150 opacity-30"></div>
              <XCircle className="h-20 w-20 text-red-500 relative z-10" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Płatność anulowana
          </h2>
          
          <p className="text-gray-600 mb-8">
            Twoja płatność została anulowana. Możesz spróbować ponownie lub wrócić na stronę główną.
          </p>
          
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 justify-center">
            <button
              onClick={handleGoHome}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Wróć na stronę główną
            </button>
          </div>
          
          <p className="text-sm text-gray-400 mt-8">
            Automatyczne przekierowanie za kilka sekund...
          </p>
        </div>
      </div>
    </div>
  );
} 
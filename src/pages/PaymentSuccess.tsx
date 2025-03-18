import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Parse URL params to get creator info
  const searchParams = new URLSearchParams(location.search);
  const creatorUsername = searchParams.get('username');
  const amount = searchParams.get('amount');
  const formattedAmount = amount ? (parseInt(amount) / 100).toFixed(2) : null;
  
  // Auto-redirect after 5 seconds
  useEffect(() => {
    if (creatorUsername) {
      const timer = setTimeout(() => {
        navigate(`/${creatorUsername}?donation_success=true`);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [creatorUsername, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white shadow rounded-lg overflow-hidden p-8 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Płatność zakończona pomyślnie!</h1>
            
            {formattedAmount && (
              <p className="text-lg text-gray-700 mb-4">
                Dziękujemy za wsparcie w wysokości {formattedAmount} PLN
              </p>
            )}
            
            <p className="text-gray-600 mb-8">
              Twoja wpłata została zrealizowana. Zostaniesz przekierowany z powrotem do profilu twórcy za 5 sekund.
            </p>
            
            {creatorUsername ? (
              <Link
                to={`/${creatorUsername}?donation_success=true`}
                className="inline-block px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Wróć do profilu twórcy
              </Link>
            ) : (
              <Link
                to="/"
                className="inline-block px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Wróć do strony głównej
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
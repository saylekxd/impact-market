import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccess() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Dziękujemy za wsparcie!
          </h2>
          <p className="text-gray-600 mb-4">
            Twoja płatność została zrealizowana pomyślnie.
          </p>
          <p className="text-sm text-gray-500">
            Za chwilę zostaniesz przekierowany na stronę główną.
          </p>
        </div>
      </div>
    </div>
  );
}
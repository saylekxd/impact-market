import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { payments } from '../lib/payments';
import { toast } from 'react-hot-toast';

export default function PaymentTest() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const sessionId = searchParams.get('sessionId');

  useEffect(() => {
    if (!sessionId) {
      toast.error('Nieprawidłowa sesja płatności');
      navigate('/');
      return;
    }

    // Symulacja procesu płatności
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Symuluj sukces płatności
          payments.updatePaymentStatus(sessionId, 'completed')
            .then(() => {
              toast.success('Płatność zakończona sukcesem!');
              navigate('/payment/success');
            })
            .catch(() => {
              toast.error('Wystąpił błąd podczas przetwarzania płatności');
              navigate('/');
            });
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionId, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Symulacja płatności
          </h2>
          <div className="animate-pulse mb-6">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
          <p className="text-gray-600 mb-4">
            Trwa przetwarzanie płatności...
          </p>
          <p className="text-sm text-gray-500">
            Automatyczne przekierowanie za {countdown} sekund
          </p>
        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface PaymentDetails {
  id: string;
  status: string;
  amount?: number;
  currency?: string;
  created_at?: string;
}

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'verified' | 'error'>(
    'pending'
  );

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!sessionId) {
        setLoading(false);
        setVerificationStatus('error');
        return;
      }

      try {
        // First verify the session with Stripe
        try {
          const verifyResponse = await fetch(`/api/check-session-status?session_id=${sessionId}`);
          if (verifyResponse.ok) {
            const verifyData = await verifyResponse.json();
            if (verifyData.status === 'complete') {
              setVerificationStatus('verified');
            } else {
              console.warn('Payment not verified:', verifyData);
              // Continue anyway to show user-friendly info
            }
          } else {
            console.error('Error verifying payment session');
          }
        } catch (verifyError) {
          console.error('Error checking session:', verifyError);
          // Continue to show the success page anyway
        }

        // Get payment details from the database based on session ID
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('stripe_session_id', sessionId)
          .single();

        if (error) {
          console.error('Error fetching payment details:', error);
        } else if (data) {
          setPaymentDetails(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();

    // Auto redirect after 10 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate, sessionId]);

  const handleGoHome = () => {
    navigate('/');
  };

  const formatCurrency = (amount?: number, currency = 'PLN') => {
    if (!amount) return '';
    
    // Convert from cents to actual currency amount
    const value = amount / 100;
    
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: currency,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white shadow-xl rounded-xl p-8">
        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Pobieranie szczegółów płatności...</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className={`absolute inset-0 rounded-full scale-150 opacity-30 animate-pulse ${
                  verificationStatus === 'error' ? 'bg-yellow-100' : 'bg-green-100'
                }`}></div>
                {verificationStatus === 'error' ? (
                  <AlertTriangle className="h-20 w-20 text-yellow-500 relative z-10" />
                ) : (
                  <CheckCircle className="h-20 w-20 text-green-500 relative z-10" />
                )}
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {verificationStatus === 'error' 
                ? 'Płatność oczekuje na potwierdzenie' 
                : 'Płatność zakończona pomyślnie!'}
            </h2>
            
            <div className="my-6 py-4 bg-gray-50 rounded-lg">
              {paymentDetails ? (
                <>
                  <p className="text-2xl font-bold text-green-600 mb-1">
                    {formatCurrency(paymentDetails.amount, paymentDetails.currency)}
                  </p>
                  <p className="text-gray-500 text-sm">
                    ID transakcji: {paymentDetails.id?.substring(0, 8)}...
                  </p>
                  {paymentDetails.created_at && (
                    <p className="text-gray-500 text-sm">
                      Data: {new Date(paymentDetails.created_at).toLocaleString()}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-gray-600">
                  Dziękujemy za Twoje wsparcie!
                </p>
              )}
            </div>
            
            <p className="text-gray-600 mb-6">
              {verificationStatus === 'error' 
                ? 'Otrzymaliśmy informację o Twojej płatności. Pełne potwierdzenie może zająć kilka minut.'
                : 'Twoja płatność została zrealizowana pomyślnie. Wkrótce zostaniesz przekierowany na stronę główną.'}
            </p>
            
            <button
              onClick={handleGoHome}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Wróć na stronę główną
            </button>
            
            <p className="text-sm text-gray-400 mt-8">
              Automatyczne przekierowanie za kilka sekund...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
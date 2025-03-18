import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';
import { createPaymentIntent, testApiConnection } from '../lib/stripe';
import { CheckCircle } from 'lucide-react';

interface StripePaymentFormProps {
  amount: number;
  currency: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  onProcessingChange?: (isProcessing: boolean) => void;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

// Prevent duplicate payment intents
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

export default function StripePaymentForm({ 
  amount, 
  currency,
  onPaymentSuccess,
  onPaymentError,
  onProcessingChange
}: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  
  // Prevent duplicate API calls
  const paymentIntentRequested = useRef(false);
  const debouncedAmount = useDebounce(amount, 500);

  // Test API connection only ONCE
  useEffect(() => {
    let isMounted = true;
    
    const checkApiConnection = async () => {
      try {
        console.log('Checking API connection...');
        const result = await testApiConnection();
        if (!isMounted) return;
        
        if (result.success) {
          setApiStatus('connected');
          console.log('API connection successful');
        } else {
          setApiStatus('error');
          console.error('API connection failed:', result.message);
          setPaymentError(`Payment service unavailable: ${result.message}`);
        }
      } catch (error) {
        if (!isMounted) return;
        setApiStatus('error');
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Error checking API connection:', errorMessage);
        setPaymentError(`Payment service unavailable: ${errorMessage}`);
      }
    };

    checkApiConnection();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Create payment intent ONLY when amount changes (debounced)
  const createIntent = useCallback(async () => {
    if (
      apiStatus !== 'connected' || 
      debouncedAmount <= 0 || 
      isProcessing || 
      clientSecret || 
      paymentIntentRequested.current
    ) {
      return;
    }
    
    // Set flag to prevent duplicate requests
    paymentIntentRequested.current = true;
    
    try {
      setIsProcessing(true);
      if (onProcessingChange) {
        onProcessingChange(true);
      }
      
      console.log(`Creating payment intent for amount: ${debouncedAmount}`);
      const result = await createPaymentIntent(debouncedAmount, currency);
      
      if (result.error) {
        setPaymentError(result.error);
        onPaymentError(result.error);
      } else if (result.clientSecret) {
        setClientSecret(result.clientSecret);
        setPaymentError(null);
        console.log('Payment intent created successfully');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create payment intent';
      setPaymentError(errorMessage);
      onPaymentError(errorMessage);
    } finally {
      setIsProcessing(false);
      if (onProcessingChange) {
        onProcessingChange(false);
      }
    }
  }, [
    apiStatus, 
    debouncedAmount, 
    isProcessing, 
    clientSecret, 
    currency, 
    onPaymentError, 
    onProcessingChange
  ]);

  // Only create intent when debounced amount changes
  useEffect(() => {
    if (debouncedAmount > 0 && apiStatus === 'connected' && !clientSecret) {
      createIntent();
    }
    
    // Reset the flag when amount changes
    return () => {
      paymentIntentRequested.current = false;
    };
  }, [debouncedAmount, apiStatus, clientSecret, createIntent]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      toast.error('Payment system is not ready yet');
      return;
    }

    // Set processing state
    setIsProcessing(true);
    setPaymentStatus('processing');
    if (onProcessingChange) {
      onProcessingChange(true);
    }

    try {
      // Get card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      console.log('Confirming card payment...');
      // Confirm payment with card element
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (error) {
        throw new Error(error.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        console.log('Payment successful!', paymentIntent.id);
        toast.success('Payment successful!');
        
        // Set payment success state
        setPaymentStatus('success');
        
        // Notify parent component
        onPaymentSuccess(paymentIntent.id);
        
        // Clear form and reset state after 2 seconds to allow time to see success message
        setTimeout(() => {
          if (elements.getElement(CardElement)) {
            elements.getElement(CardElement)?.clear();
          }
        }, 2000);
      } else {
        throw new Error(`Payment status: ${paymentIntent.status}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      console.error('Payment error:', errorMessage);
      setPaymentError(errorMessage);
      setPaymentStatus('error');
      onPaymentError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
      if (onProcessingChange) {
        onProcessingChange(false);
      }
    }
  };

  if (apiStatus === 'checking') {
    return (
      <div className="stripe-payment-form">
        <div className="p-4 bg-gray-100 rounded text-center">
          <p>Connecting to payment service...</p>
        </div>
      </div>
    );
  }

  // Show success UI instead of the form when payment is successful
  if (paymentStatus === 'success') {
    return (
      <div className="stripe-payment-success p-6 text-center">
        <div className="mb-4 flex justify-center">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-600 mb-4">
          Thank you for your payment of {(amount / 100).toFixed(2)} {currency}
        </p>
        <p className="text-sm text-gray-500">
          Redirecting you back to the profile...
        </p>
      </div>
    );
  }

  return (
    <div className="stripe-payment-form">
      {paymentError && (
        <div className="text-red-500 mb-4 p-3 bg-red-50 rounded">
          {paymentError}
        </div>
      )}
      
      {apiStatus === 'error' ? (
        <div className="p-4 bg-red-100 rounded text-center">
          <p>Payment service is currently unavailable. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Reload page
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 border border-gray-300 rounded-lg">
            <CardElement options={CARD_ELEMENT_OPTIONS} />
          </div>
          
          <button
            type="submit"
            disabled={!stripe || !clientSecret || isProcessing}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
              isProcessing || !stripe || !clientSecret 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isProcessing ? 'Processing...' : `Pay ${(amount / 100).toFixed(2)} ${currency}`}
          </button>
          
          {clientSecret && (
            <div className="text-xs text-gray-500 text-center mt-2">
              Payment ready for processing
            </div>
          )}
        </form>
      )}
    </div>
  );
} 
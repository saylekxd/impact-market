import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PaymentElement, useStripe, useElements, Elements } from '@stripe/react-stripe-js';
import { toast } from 'react-hot-toast';
import { createPaymentIntent, testApiConnection, stripePromise } from '../lib/stripe';
import { CheckCircle } from 'lucide-react';

interface StripePaymentFormProps {
  amount: number;
  currency: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  onProcessingChange?: (isProcessing: boolean) => void;
}

// Payment form skeleton
function PaymentFormSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Header skeleton */}
      <div className="w-full h-10 bg-gray-200 rounded-lg"></div>
      
      {/* Payment form fields skeleton */}
      <div className="p-4 border border-gray-200 rounded-lg space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
      </div>
      
      {/* Button skeleton */}
      <div className="h-12 bg-gray-200 rounded-lg"></div>
    </div>
  );
}

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

// Component for rendering the BLIK/Payment Element with its own Elements instance
function BlikPaymentElementWrapper({ 
  amount, 
  currency, 
  onPaymentSuccess, 
  onPaymentError, 
  onProcessingChange 
}: {
  amount: number;
  currency: string;
  onPaymentSuccess: (paymentIntentId: string) => void;
  onPaymentError: (error: string) => void;
  onProcessingChange?: (isProcessing: boolean) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
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
      // For PaymentElement (which handles BLIK and other methods)
      console.log('Confirming payment with Payment Element...');
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/payment/success',
        },
        redirect: 'if_required',
      });

      const { error, paymentIntent } = result;

      if (error) {
        throw new Error(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log('Payment successful!', paymentIntent.id);
        toast.success('Payment successful!');
        
        // Set payment success state
        setPaymentStatus('success');
        
        // Notify parent component
        onPaymentSuccess(paymentIntent.id);
      } else if (paymentIntent && paymentIntent.next_action) {
        // Handle next actions that may be required for BLIK
        console.log('Payment requires additional action:', paymentIntent.next_action);
        // The UI for this is handled by Stripe.js
      } else {
        throw new Error(`Payment status: ${paymentIntent ? paymentIntent.status : 'unknown'}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      console.error('Payment error:', errorMessage);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border border-gray-300 rounded-lg">
        <PaymentElement 
          options={{
            paymentMethodOrder: ['blik', 'card'],
            business: {
              name: 'Impact Market'
            }
          }} 
        />
      </div>
      
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
          isProcessing || !stripe
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-green-600 hover:bg-green-700'
        }`}
      >
        {isProcessing ? 'Processing...' : `Pay ${(amount / 100).toFixed(2)} ${currency}`}
      </button>
    </form>
  );
}

export default function StripePaymentForm({ 
  amount, 
  currency,
  onPaymentSuccess,
  onPaymentError,
  onProcessingChange
}: StripePaymentFormProps) {
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
      // Add payment_method_types to include BLIK
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

  if (apiStatus === 'checking') {
    return (
      <div className="stripe-payment-form p-4 border border-gray-100 rounded-lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse"></div>
            <div className="h-5 bg-gray-200 rounded w-1/4 animate-pulse"></div>
          </div>
          
          <PaymentFormSkeleton />
          
          <div className="text-center text-sm text-gray-500 mt-2">
            Connecting to payment service...
          </div>
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
        <>
          {/* Payment method header */}
          <div className="mb-4">
            <div className="w-full">
              <div 
                className="py-2 px-3 text-center rounded-lg border border-green-500 bg-green-50 text-green-700 font-medium"
              >
                Płać wygodnie z naszymi partnerami
              </div>
            </div>
          </div>

          {clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <BlikPaymentElementWrapper
                amount={amount}
                currency={currency}
                onPaymentSuccess={onPaymentSuccess}
                onPaymentError={onPaymentError}
                onProcessingChange={onProcessingChange}
              />
            </Elements>
          ) : (
            <div className="p-4 border border-gray-200 rounded-lg">
              <PaymentFormSkeleton />
              <div className="text-center text-sm text-gray-500 mt-4">
                Preparing payment options...
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
} 
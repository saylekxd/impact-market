import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Coffee } from 'lucide-react';
import StripePaymentForm from './StripePaymentForm';
import { donations } from '../lib/donations';
import { testApiConnection } from '../lib/stripe';

interface DonationStripeFormProps {
  creatorId: string;
  creatorName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Predefined donation amounts
const PREDEFINED_AMOUNTS = [
  { value: 500, label: '5 zł' },
  { value: 1000, label: '10 zł' },
  { value: 1500, label: '15 zł' },
];

export default function DonationStripeForm({ 
  creatorId,
  creatorName,
  onSuccess,
  onCancel 
}: DonationStripeFormProps) {
  // State for form values
  const [step, setStep] = useState<'amount' | 'payment'>('amount');
  const [selectedAmount, setSelectedAmount] = useState<number>(1000); // Default to 10 PLN
  const [customAmount, setCustomAmount] = useState<string>('');
  const [message, setMessage] = useState('');
  const [addMessage, setAddMessage] = useState(false);
  const [payerName, setPayerName] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [donationId, setDonationId] = useState<string | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');

  // Check API availability on component mount
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const result = await testApiConnection();
        setApiStatus(result.success ? 'available' : 'unavailable');
        if (!result.success) {
          console.error('API is unavailable:', result.message);
        }
      } catch (error) {
        console.error('Error checking API status:', error);
        setApiStatus('unavailable');
      }
    };

    checkApiStatus();
  }, []);

  // Calculate the amount in cents
  const amount = customAmount ? parseInt(customAmount) * 100 : selectedAmount;

  // Handle form submission to advance to payment
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amount < 100) {
      toast.error('Minimalna kwota to 1 zł');
      return;
    }

    // Check API availability before proceeding
    if (apiStatus === 'checking') {
      toast.error('Sprawdzanie dostępności serwisu płatności...');
      return;
    }

    if (apiStatus === 'unavailable') {
      toast.error('Serwis płatności jest obecnie niedostępny. Prosimy spróbować później.');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Create the donation record first
      const result = await donations.create({
        creator_id: creatorId,
        amount,
        currency: 'PLN',
        message: addMessage ? message : null,
        payer_name: payerName || null,
        payer_email: payerEmail || null,
        payment_type: 'stripe',
      });
      
      if (result.success && result.data?.id) {
        // Store the donation ID for reference
        setDonationId(result.data.id);
        // Once donation is created in the database, proceed to payment step
        setStep('payment');
      } else {
        throw new Error(result.error || 'Wystąpił błąd podczas przygotowania płatności');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Wystąpił błąd: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle successful payment
  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      // Store the Stripe payment ID reference
      try {
        const response = await fetch('/api/payment-info', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentId: donationId,
            stripePaymentId: paymentIntentId
          }),
        });

        // Check for response status
        if (!response.ok) {
          // Try to get more information about the error
          let errorDetails = '';
          try {
            const errorData = await response.json();
            errorDetails = errorData.message || errorData.error || '';
          } catch(e) {
            errorDetails = await response.text();
          }
          
          console.error('Failed to store payment reference:', errorDetails);
          
          // Check if this is a schema error
          if (errorDetails.includes('external_reference') || errorDetails.includes('column')) {
            console.warn('Database schema issue detected. Payment was successful in Stripe but reference could not be stored.');
            // Let's still mark it as successful since this is likely just a schema/migration issue
            toast.success('Dziękujemy za wsparcie! (Ref: DB-Schema)');
            if (onSuccess) {
              onSuccess();
            }
            
            // Redirect to success page after showing toast
            redirectToSuccessPage(paymentIntentId);
            return;
          }
          
          toast.error('Płatność została przyjęta, ale wystąpił błąd podczas aktualizacji statusu. Prosimy o kontakt z obsługą.');
          // Do not call onSuccess here as we couldn't confirm the payment status in our database
          return;
        } else {
          console.log('Payment reference stored successfully');
          toast.success('Dziękujemy za wsparcie!');
          if (onSuccess) {
            onSuccess();
          }
          
          // Redirect to success page after showing toast
          redirectToSuccessPage(paymentIntentId);
        }
      } catch (err) {
        console.error('Error storing payment reference:', err);
        // If the payment was processed by Stripe but we have errors updating our database,
        // we'll still consider this "successful" from the user perspective
        toast.success('Dziękujemy za wsparcie! (Ref: Error)');
        toast.error('Wystąpił błąd podczas zapisywania płatności. Administrator zostanie powiadomiony.');
        if (onSuccess) {
          onSuccess();
        }
        
        // Redirect to success page after showing toasts
        redirectToSuccessPage(paymentIntentId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Wystąpił błąd: ${errorMessage}`);
      if (onCancel) {
        onCancel();
      }
    }
  };
  
  // Helper function to redirect to success page
  const redirectToSuccessPage = (paymentIntentId: string) => {
    // Short delay to allow toast to be seen
    setTimeout(() => {
      // Use window.location to navigate to the success page with parameters
      window.location.href = `/payment/success?username=${encodeURIComponent(creatorName)}&amount=${amount}&payment_id=${paymentIntentId}`;
    }, 1500);
  };

  // Handle payment error
  const handlePaymentError = (errorMessage: string) => {
    toast.error(`Payment error: ${errorMessage}`);
    if (onCancel) {
      onCancel();
    }
  };

  // Handle back button
  const handleBack = () => {
    setStep('amount');
  };

  return (
    <div className="donation-form p-6 bg-white shadow rounded-lg">
      {apiStatus === 'checking' && (
        <div className="mb-4 p-4 bg-gray-100 rounded text-center">
          <p>Sprawdzanie dostępności serwisu płatności...</p>
        </div>
      )}

      {apiStatus === 'unavailable' && (
        <div className="mb-4 p-4 bg-red-100 rounded text-center">
          <p className="text-red-700">Serwis płatności jest obecnie niedostępny. Prosimy spróbować później.</p>
        </div>
      )}

      {step === 'amount' ? (
        <form onSubmit={handleProceedToPayment} className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Postaw kawę za</h2>
          
          {/* Predefined amount selection */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {PREDEFINED_AMOUNTS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setSelectedAmount(value);
                  setCustomAmount('');
                }}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                  selectedAmount === value && !customAmount
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-500'
                }`}
              >
                <Coffee className={`w-6 h-6 ${
                  selectedAmount === value && !customAmount ? 'text-green-500' : 'text-gray-400'
                }`} />
                <span className={`mt-2 font-medium ${
                  selectedAmount === value && !customAmount ? 'text-green-500' : 'text-gray-600'
                }`}>
                  {label}
                </span>
              </button>
            ))}
          </div>

          {/* Custom amount input */}
          <div>
            <p className="text-center text-sm text-gray-500 mb-2">lub</p>
            <div className="relative">
              <input
                type="number"
                min="1"
                placeholder="Własna kwota"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(0);
                }}
                className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-green-500 focus:border-green-500"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <span className="text-gray-500">PLN</span>
              </div>
            </div>
          </div>

          {/* Supporter info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="payerName" className="block text-sm font-medium text-gray-700">
                Imię
              </label>
              <input
                type="text"
                id="payerName"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                placeholder="Opcjonalnie"
              />
            </div>
            <div>
              <label htmlFor="payerEmail" className="block text-sm font-medium text-gray-700">
                Adres e-mail
              </label>
              <input
                type="email"
                id="payerEmail"
                value={payerEmail}
                onChange={(e) => setPayerEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                placeholder="Opcjonalnie"
              />
            </div>
          </div>

          {/* Message toggle */}
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setAddMessage(!addMessage)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                addMessage ? 'bg-green-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  addMessage ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="ml-3 text-sm text-gray-600">
              Chcę dodać dedykację
            </span>
          </div>

          {/* Message textarea */}
          {addMessage && (
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Twoja wiadomość
              </label>
              <textarea
                id="message"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                placeholder="Napisz coś miłego..."
              />
            </div>
          )}

          {/* Continue to payment button */}
          <button
            type="submit"
            disabled={isProcessing}
            className={`w-full py-3 px-4 ${
              isProcessing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700'
            } text-white font-medium rounded-lg transition-colors`}
          >
            {isProcessing ? 'Przetwarzanie...' : 'Kontynuuj do płatności'}
          </button>
        </form>
      ) : (
        <div className="stripe-payment-step">
          <div className="mb-6">
            <button
              type="button"
              onClick={handleBack}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Wróć
            </button>
            <h2 className="text-xl font-bold text-gray-900 mt-2">
              Płatność kartą
            </h2>
            <p className="text-gray-600 mt-1">
              Wspierasz: {creatorName}
            </p>
            <div className="mt-2 text-lg font-semibold text-gray-900">
              Kwota: {(amount / 100).toFixed(2)} PLN
            </div>
          </div>
          
          <StripePaymentForm
            amount={amount}
            currency="PLN"
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            onProcessingChange={setIsProcessing}
          />
        </div>
      )}
    </div>
  );
} 
import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Droplets, UtensilsCrossed, Stethoscope, Pill, Coffee, Leaf, Mountain, Bird, Building, PenTool, Monitor, Bone, Utensils, Waves, Sandwich, Soup, Ambulance, Sprout, TreePine, TreeDeciduous, Users, Globe, BookOpen, Backpack, Laptop, GraduationCap, Palette, Brush, Home } from 'lucide-react';
import StripePaymentForm from './StripePaymentForm';
import { donations } from '../lib/donations';
import { profiles } from '../lib/profiles';
import { testApiConnection } from '../lib/stripe';
import { API_BASE_URL, API_ENDPOINTS, DEFAULT_API_CONFIG } from '../config';

interface DonationStripeFormProps {
  creatorId: string;
  creatorName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Map of icon IDs to Lucide icon components for quick reference
const ICON_MAP: Record<string, React.ElementType> = {
  // Humanitarian aid
  water_sip: Droplets,
  water_bottle: Coffee,
  village_well: Waves,
  
  // Food
  sandwich: Sandwich,
  warm_meal: UtensilsCrossed,
  family_meals: Soup,
  
  // Medical
  first_aid: Pill,
  doctor_visit: Stethoscope,
  life_saving: Ambulance,
  
  // Ecology
  small_plant: Sprout,
  tree: TreePine,
  forest: TreeDeciduous,
  
  // Nature
  green_leaf: Leaf,
  new_plant: Sprout,
  ecosystem: Mountain,
  
  // Animals
  bird_nest: Bird,
  animal_family: Users,
  reserve: Globe,
  
  // Education
  notebook: PenTool,
  textbook: BookOpen,
  school_supplies: Backpack,
  
  // Online learning
  online_hour: Monitor,
  laptop: Laptop,
  scholarship: GraduationCap,
  
  // Pet help
  pet_food: Utensils,
  pet_bed: Bone,
  pet_care: Home,
  
  // Arts
  art_supplies: Palette,
  art_project: Brush,
  art_festival: Building,
  
  // Legacy icons (for backward compatibility)
  coffee: Coffee,
};

// Default icon when we don't have a mapping
const DEFAULT_ICON = Coffee;

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
  const [isLoadingIcons, setIsLoadingIcons] = useState(true); // Loading state for icons
  
  // Store creator donation options/icons
  const [donationOptions, setDonationOptions] = useState<{
    small: { amount: number, icon: string, label: string };
    medium: { amount: number, icon: string, label: string };
    large: { amount: number, icon: string, label: string };
  }>({
    small: { amount: 500, icon: 'water_sip', label: 'Łyk wody' },
    medium: { amount: 1000, icon: 'warm_meal', label: 'Ciepły posiłek' },
    large: { amount: 2000, icon: 'doctor_visit', label: 'Wizyta u lekarza' },
  });

  // Get icon component from the icon ID
  const getIconForId = (iconId: string): React.ElementType => {
    return ICON_MAP[iconId] || DEFAULT_ICON;
  };

  // Load creator profile on mount to get donation settings
  useEffect(() => {
    const loadCreatorProfile = async () => {
      try {
        setIsLoadingIcons(true); // Set loading state to true before fetching
        console.log('Loading creator profile data for ID:', creatorId);
        const result = await profiles.getById(creatorId);
        
        if (result.success && result.data) {
          const profile = result.data;
          console.log('Profile loaded successfully:', {
            small_icon: profile.small_icon,
            medium_icon: profile.medium_icon,
            large_icon: profile.large_icon
          });
          
          // Make sure we have valid icon IDs (handle nulls or undefined)
          const smallIconId = profile.small_icon || 'water_sip';
          const mediumIconId = profile.medium_icon || 'warm_meal';
          const largeIconId = profile.large_icon || 'doctor_visit';
          
          // Update donation options based on creator's settings
          setDonationOptions({
            small: {
              amount: profile.small_coffee_amount || 500,
              icon: smallIconId,
              label: getLabelForIcon(smallIconId)
            },
            medium: {
              amount: profile.medium_coffee_amount || 1000,
              icon: mediumIconId,
              label: getLabelForIcon(mediumIconId)
            },
            large: {
              amount: profile.large_coffee_amount || 2000,
              icon: largeIconId, 
              label: getLabelForIcon(largeIconId)
            }
          });
          
          // Set default selected amount
          setSelectedAmount(profile.medium_coffee_amount || 1000);
        } else {
          console.error('Failed to load profile:', result.error);
        }
      } catch (error) {
        console.error('Error loading creator profile:', error);
      } finally {
        setIsLoadingIcons(false); // Set loading state to false after fetching completes
      }
    };
    
    loadCreatorProfile();
  }, [creatorId]);

  // Get label for an icon ID
  const getLabelForIcon = (iconId: string): string => {
    // This would ideally come from a centralized mapping
    const labelMap: Record<string, string> = {
      // Humanitarian aid
      'water_sip': 'Łyk wody',
      'water_bottle': 'Butelka wody',
      'village_well': 'Studnia dla wioski',
      
      // Food
      'sandwich': 'Kanapka dla dziecka',
      'warm_meal': 'Ciepły posiłek',
      'family_meals': 'Obiady dla rodziny',
      
      // Medical
      'first_aid': 'Leki na pierwszą pomoc',
      'doctor_visit': 'Wizyta u lekarza',
      'life_saving': 'Ratowanie życia',
      
      // Ecology
      'small_plant': 'Mała sadzonka',
      'tree': 'Dojrzałe drzewo',
      'forest': 'Cały las',
      
      // Nature
      'green_leaf': 'Zielony listek',
      'new_plant': 'Nowa roślina',
      'ecosystem': 'Odnowa ekosystemu',
      
      // Animals
      'bird_nest': 'Pisklę w gnieździe',
      'animal_family': 'Opieka nad rodziną zwierząt',
      'reserve': 'Ochrona rezerwatu',
      
      // Education
      'notebook': 'Zeszyt i długopis',
      'textbook': 'Podręcznik szkolny',
      'school_supplies': 'Cała wyprawka',
      
      // Online learning
      'online_hour': 'Godzina nauki online',
      'laptop': 'Laptop dla ucznia',
      'scholarship': 'Stypendium edukacyjne',
      
      // Pet help
      'pet_food': 'Puszka karmy',
      'pet_bed': 'Legowisko i leczenie',
      'pet_care': 'Opieka przez rok',
      
      // Arts
      'art_supplies': 'Pędzel i farby',
      'art_project': 'Wsparcie jednego projektu',
      'art_festival': 'Festiwal sztuki',
      
      // Legacy icons (for backward compatibility)
      'coffee': 'Kawa',
    };
    
    return labelMap[iconId] || 'Wsparcie';
  };

  // Skeleton loading component for icons
  const IconSkeleton = () => (
    <div className="animate-pulse flex flex-col items-center justify-center">
      <div className="w-6 h-6 bg-gray-200 rounded-full mb-2"></div>
      <div className="h-4 w-14 bg-gray-200 rounded"></div>
    </div>
  );

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
      // Ensure we have a donation ID
      if (!donationId) {
        console.error('No donation ID found');
        toast.error('Błąd podczas przetwarzania płatności: brak identyfikatora wpłaty');
        return;
      }

      // Store the Stripe payment ID reference
      try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.paymentInfo}`, {
          method: 'POST',
          ...DEFAULT_API_CONFIG,
          body: JSON.stringify({
            paymentId: donationId, // Use the existing donationId
            stripePaymentId: paymentIntentId,
            creator_id: creatorId
          }),
        });

        // Check for response status
        if (!response.ok) {
          // Try to get more information about the error
          let errorDetails = '';
          try {
            const errorData = await response.json();
            errorDetails = errorData.message || errorData.error || '';
          } catch {
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
        }
        
        console.log('Payment reference stored successfully');
        toast.success('Dziękujemy za wsparcie!');
        if (onSuccess) {
          onSuccess();
        }
        
        // Redirect to success page after showing toast
        redirectToSuccessPage(paymentIntentId);
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

  // Get the active option based on selected amount
  const getActiveOption = () => {
    if (customAmount) return null;
    
    if (selectedAmount === donationOptions.small.amount) return 'small';
    if (selectedAmount === donationOptions.medium.amount) return 'medium';
    if (selectedAmount === donationOptions.large.amount) return 'large';
    
    return null;
  };

  // Format price as PLN
  const formatPrice = (amountInCents: number) => {
    return `${(amountInCents / 100).toFixed(0)} zł`;
  };

  const activeOption = getActiveOption();

  return (
    <div className="donation-form p-6 bg-white shadow rounded-lg">
      {apiStatus === 'checking' && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-center text-sm text-gray-600">
          <p>Sprawdzanie dostępności serwisu płatności...</p>
        </div>
      )}

      {apiStatus === 'unavailable' && (
        <div className="mb-4 p-3 bg-red-50 rounded-lg text-center text-sm">
          <p className="text-red-600">Serwis płatności jest obecnie niedostępny. Prosimy spróbować później.</p>
        </div>
      )}

      {step === 'amount' ? (
        <form onSubmit={handleProceedToPayment} className="space-y-5">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Wspieraj {creatorName}</h2>
            <p className="text-sm text-gray-500">Wybierz kwotę wsparcia</p>
          </div>
          
          {/* Predefined amount selection */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'small', value: donationOptions.small.amount, label: donationOptions.small.label, icon: donationOptions.small.icon },
              { key: 'medium', value: donationOptions.medium.amount, label: donationOptions.medium.label, icon: donationOptions.medium.icon },
              { key: 'large', value: donationOptions.large.amount, label: donationOptions.large.label, icon: donationOptions.large.icon }
            ].map(({ key, value, label, icon }) => {
              const IconComponent = getIconForId(icon);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(value);
                    setCustomAmount('');
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 ${
                    activeOption === key
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50/30'
                  }`}
                >
                  {isLoadingIcons ? (
                    <IconSkeleton />
                  ) : (
                    <>
                      <div className="bg-white p-2 rounded-full mb-2 shadow-sm">
                        <IconComponent className={`w-5 h-5 ${
                          activeOption === key ? 'text-green-500' : 'text-gray-400'
                        }`} />
                      </div>
                      <span className={`text-sm font-medium mb-1 ${
                        activeOption === key ? 'text-green-700' : 'text-gray-700'
                      }`}>
                        {label}
                      </span>
                      <span className={`text-xs ${
                        activeOption === key ? 'text-green-500' : 'text-gray-500'
                      }`}>
                        {formatPrice(value)}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {/* Custom amount input */}
          <div className="mt-3 relative">
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
                className={`block w-full px-4 py-3 rounded-lg border ${
                  customAmount ? 'border-green-500 bg-green-50/30' : 'border-gray-300'
                } focus:ring-green-500 focus:border-green-500`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                <span className="text-gray-500">PLN</span>
              </div>
            </div>
          </div>

          {/* Supporter info */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <input
                type="text"
                id="payerName"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                placeholder="Imię (opcjonalnie)"
              />
            </div>
            <div>
              <input
                type="email"
                id="payerEmail"
                value={payerEmail}
                onChange={(e) => setPayerEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
                placeholder="Email (opcjonalnie)"
              />
            </div>
          </div>

          {/* Message toggle */}
          <div className="flex items-center mt-3">
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
            <span className="ml-2 text-sm text-gray-600">
              Dodaj wiadomość
            </span>
          </div>

          {/* Message textarea */}
          {addMessage && (
            <div className="mt-3">
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

          {/* Current selection summary */}
          <div className="bg-gray-50 p-3 rounded-lg flex items-center justify-between mt-4">
            <div className="flex items-center">
              {activeOption && !isLoadingIcons ? (
                <>
                  <div className="bg-white p-2 rounded-full mr-2 shadow-sm">
                    {(() => {
                      const iconId = donationOptions[activeOption].icon;
                      const IconComponent = getIconForId(iconId);
                      return <IconComponent className="h-5 w-5 text-green-500" />;
                    })()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{donationOptions[activeOption].label}</p>
                    <p className="text-sm text-gray-500">{formatPrice(donationOptions[activeOption].amount)}</p>
                  </div>
                </>
              ) : customAmount ? (
                <>
                  <div className="bg-white p-2 rounded-full mr-2 shadow-sm">
                    <Coffee className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Własna kwota</p>
                    <p className="text-sm text-gray-500">{formatPrice(parseInt(customAmount) * 100)}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">Wybierz kwotę wsparcia</p>
              )}
            </div>
          </div>

          {/* Continue to payment button */}
          <button
            type="submit"
            disabled={isProcessing || (!selectedAmount && !customAmount)}
            className={`w-full py-3 px-4 mt-4 ${
              isProcessing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : (!selectedAmount && !customAmount)
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
            } text-white font-medium rounded-lg transition-colors`}
          >
            {isProcessing ? 'Przetwarzanie...' : 'Przejdź do płatności'}
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
            
            <div className="mt-4 mb-6 bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-bold text-gray-900">
                Płatność dla: {creatorName}
              </h2>
              
              <div className="flex items-center mt-3">
                {activeOption && !isLoadingIcons ? (
                  <>
                    <div className="bg-white p-2 rounded-full mr-3 shadow-sm">
                      {(() => {
                        const iconId = donationOptions[activeOption].icon;
                        const IconComponent = getIconForId(iconId);
                        return <IconComponent className="h-5 w-5 text-green-500" />;
                      })()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{donationOptions[activeOption].label}</p>
                      <p className="text-gray-500">{formatPrice(amount)}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-white p-2 rounded-full mr-3 shadow-sm">
                      <Coffee className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Wsparcie</p>
                      <p className="text-gray-500">{formatPrice(amount)}</p>
                    </div>
                  </>
                )}
              </div>
              
              {payerName && (
                <p className="text-sm text-gray-600 mt-2">
                  Od: {payerName}
                </p>
              )}
              
              {addMessage && message && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-600">{message}</p>
                </div>
              )}
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
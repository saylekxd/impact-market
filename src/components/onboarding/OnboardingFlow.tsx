import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { useScreenSize } from "@/components/hooks/use-screen-size";
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

// Import step components
import AccountTypeSelection from './AccountTypeSelection';
import PersonalDataForm from './PersonalDataForm';
import PhoneVerification from './PhoneVerification';
import BankAccountForm from '../../components/BankAccountForm';
import IconSelectionForm from './IconSelectionForm';

// Define steps for the onboarding flow
type OnboardingStep = 
  | 'account_type' 
  | 'personal_data' 
  | 'phone_verification' 
  | 'icon_selection'
  | 'bank_account' 
  | 'completed';

interface OnboardingFlowProps {
  userId: string;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ userId }) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('account_type');
  const [accountType, setAccountType] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const screenSize = useScreenSize();

  // Calculate progress based on current step
  useEffect(() => {
    switch (currentStep) {
      case 'account_type':
        setProgress(20);
        break;
      case 'personal_data':
        setProgress(40);
        break;
      case 'phone_verification':
        setProgress(60);
        break;
      case 'icon_selection':
        setProgress(80);
        break;
      case 'bank_account':
      case 'completed':
        setProgress(100);
        break;
    }
  }, [currentStep]);

  // Handle back navigation
  const handleBack = () => {
    switch (currentStep) {
      case 'personal_data':
        setCurrentStep('account_type');
        break;
      case 'phone_verification':
        setCurrentStep('personal_data');
        break;
      case 'icon_selection':
        setCurrentStep('phone_verification');
        break;
      case 'bank_account':
        setCurrentStep('icon_selection');
        break;
      default:
        break;
    }
  };

  // Load user data and determine starting step
  useEffect(() => {
    const loadUserData = async () => {
      setLoading(true);
      try {
        // Check if user has account type set
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('account_type')
          .eq('id', userId)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          throw profileError;
        }

        // If account type is set, load that and determine the next step
        if (profileData?.account_type) {
          setAccountType(profileData.account_type);
          
          // Check if personal data exists
          const { data: personalData, error: personalDataError } = await supabase
            .from('personal_data')
            .select('*')
            .eq('user_id', userId)
            .single();
            
          if (!personalDataError || personalDataError.code === 'PGRST116') {
            // If we have personal data or just no data yet, proceed to personal data step
            setCurrentStep('account_type');
          } else {
            throw personalDataError;
          }
        } else {
          // No account type set, start at account type selection
          setCurrentStep('account_type');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error('Failed to load your profile data');
        setCurrentStep('account_type');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId]);

  // Handle account type selection completion
  const handleAccountTypeCompleted = async () => {
    try {
      // Reload the account type from the database
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('account_type')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      
      if (profileData?.account_type) {
        setAccountType(profileData.account_type);
      }
      
      setCurrentStep('personal_data');
    } catch (error) {
      console.error('Error loading account type:', error);
      setCurrentStep('personal_data');
    }
  };

  // Handle personal data completion
  const handlePersonalDataCompleted = async () => {
    try {
      const { data, error } = await supabase
        .from('personal_data')
        .select('phone_number')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      
      if (data?.phone_number) {
        setPhoneNumber(data.phone_number);
      }
      
      setCurrentStep('phone_verification');
    } catch (error) {
      console.error('Error fetching phone number:', error);
      setCurrentStep('phone_verification');
    }
  };

  // Handle phone verification completion
  const handlePhoneVerificationCompleted = () => {
    setCurrentStep('icon_selection');
  };

  // Handle icon selection completion
  const handleIconSelectionCompleted = () => {
    setCurrentStep('bank_account');
  };

  // Handle bank account completion
  const handleBankAccountCompleted = () => {
    setCurrentStep('completed');
    toast.success('Onboarding completed successfully!');
  };

  // Handle completion and redirect to dashboard
  const handleOnboardingCompleted = () => {
    navigate('/dashboard');
  };

  // Render the correct step based on currentStep
  const renderStep = () => {
    switch (currentStep) {
      case 'account_type':
        return (
          <AccountTypeSelection 
            userId={userId} 
            onCompleted={handleAccountTypeCompleted} 
          />
        );
      case 'personal_data':
        return (
          <PersonalDataForm 
            userId={userId} 
            accountType={accountType} 
            onCompleted={handlePersonalDataCompleted} 
          />
        );
      case 'phone_verification':
        return (
          <PhoneVerification 
            userId={userId} 
            phoneNumber={phoneNumber} 
            onCompleted={handlePhoneVerificationCompleted} 
            onChangePhone={() => setCurrentStep('personal_data')}
          />
        );
      case 'icon_selection':
        return (
          <IconSelectionForm
            userId={userId}
            accountType={accountType}
            onCompleted={handleIconSelectionCompleted}
          />
        );
      case 'bank_account':
        return (
          <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white">Dane Konta Bankowego</h2>
              <p className="mt-2 text-gray-400">
                Dodaj swoje konto bankowe, aby otrzymywać płatności
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm shadow-sm rounded-lg p-6 md:p-8">
              <BankAccountForm onCompleted={handleBankAccountCompleted} />
              <div className="mt-8 flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBankAccountCompleted}
                  className="w-full md:w-auto px-8 py-3 rounded-md text-white font-medium border border-gray-600 hover:border-gray-500 transition-colors duration-200 flex items-center justify-center"
                >
                  Dodam później
                </motion.button>
              </div>
            </div>
          </div>
        );
      case 'completed':
        return (
          <div className="max-w-md mx-auto py-8 px-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-10 w-10 text-green-500" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M5 13l4 4L19 7" 
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Konfiguracja Zakończona!</h2>
              <p className="text-gray-300 mb-6">
                Twoje konto zostało w pełni skonfigurowane i jest gotowe do użycia.
              </p>
              <button 
                onClick={handleOnboardingCompleted}
                className="px-6 py-3 bg-[#FF9F2D] text-white rounded-md hover:bg-[#f39729]"
              >
                Przejdź do Panelu
              </button>
            </div>
          </div>
        );
      default:
        return <div>Ładowanie...</div>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#1a1a1a]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF9F2D]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white overflow-y-auto">
      {/* Progress bar */}
      <div className="sticky top-0 z-20 bg-[#1a1a1a] pt-4 sm:pt-6 px-3 sm:px-4 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Back button */}
          {currentStep !== 'account_type' && currentStep !== 'completed' && (
            <button
              onClick={handleBack}
              className="flex items-center text-gray-400 hover:text-white mb-3 sm:mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Wstecz
            </button>
          )}

          {/* Step indicators - Hide on very small screens */}
          <div className="hidden sm:grid grid-cols-5 gap-2 mb-6">
            <div className={`p-1 text-center text-xs ${currentStep === 'account_type' || progress >= 20 ? 'text-[#FF9F2D]' : 'text-gray-500'}`}>
              Typ Konta
            </div>
            <div className={`p-1 text-center text-xs ${currentStep === 'personal_data' || progress >= 40 ? 'text-[#FF9F2D]' : 'text-gray-500'}`}>
              Dane Osobowe
            </div>
            <div className={`p-1 text-center text-xs ${currentStep === 'phone_verification' || progress >= 60 ? 'text-[#FF9F2D]' : 'text-gray-500'}`}>
              Weryfikacja
            </div>
            <div className={`p-1 text-center text-xs ${currentStep === 'icon_selection' || progress >= 80 ? 'text-[#FF9F2D]' : 'text-gray-500'}`}>
              Wybór Ikony
            </div>
            <div className={`p-1 text-center text-xs ${currentStep === 'bank_account' || currentStep === 'completed' ? 'text-[#FF9F2D]' : 'text-gray-500'}`}>
              Konto Bankowe
            </div>
          </div>

          {/* Current step indicator for mobile */}
          <div className="block sm:hidden mb-3">
            <span className="text-sm text-gray-400">
              {currentStep === 'account_type' && 'Typ Konta'}
              {currentStep === 'personal_data' && 'Dane Osobowe'}
              {currentStep === 'phone_verification' && 'Weryfikacja'}
              {currentStep === 'icon_selection' && 'Wybór Ikony'}
              {currentStep === 'bank_account' && 'Konto Bankowe'}
              {currentStep === 'completed' && 'Zakończono'}
            </span>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs sm:text-sm text-gray-400 mb-1">
              <span>Postęp Rejestracji</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-1.5 sm:h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#FF9F2D] rounded-full transition-all duration-500 ease-in-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Render the current step */}
      <div className="relative z-10 pb-6 sm:pb-10">
        {renderStep()}
      </div>
    </div>
  );
};

export default OnboardingFlow; 
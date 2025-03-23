import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Loader2, CheckCircle, ArrowRight } from 'lucide-react';

export interface PhoneVerificationProps {
  userId: string;
  phoneNumber: string;
  onCompleted: () => void;
  onChangePhone: () => void;
}

export const PhoneVerification: React.FC<PhoneVerificationProps> = ({
  userId,
  phoneNumber,
  onCompleted,
  onChangePhone,
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  // Check if phone is already verified
  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('user_verifications')
          .select('phone_verified')
          .eq('user_id', userId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking verification status:', error);
          return;
        }

        if (data?.phone_verified) {
          setIsVerified(true);
        }
      } catch (error) {
        console.error('Error checking verification status:', error);
      }
    };

    checkVerificationStatus();
  }, [userId]);

  // Countdown timer for resend SMS
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatPhoneNumber = (phone: string) => {
    // Basic formatting - in a real app, you'd want a more robust solution
    if (!phone) return '';
    const lastDigits = phone.slice(-4);
    return `****-****-${lastDigits}`;
  };

  const sendVerificationCode = async () => {
    setLoading(true);
    try {
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setVerificationSent(true);
      setCountdown(60);
      toast.success('Kod weryfikacyjny został wysłany!');
    } catch (error) {
      console.error('Error sending verification code:', error);
      toast.error('Nie udało się wysłać kodu weryfikacyjnego.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length < 4) {
      toast.error('Proszę wprowadzić prawidłowy kod weryfikacyjny');
      return;
    }

    setLoading(true);
    try {
      // Simulating API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const isValid = verificationCode === '1234';

      if (isValid) {
        const { error } = await supabase
          .from('user_verifications')
          .upsert({
            user_id: userId,
            phone_verified: true,
            phone_verified_at: new Date().toISOString(),
          });

        if (error) throw error;

        setIsVerified(true);
        toast.success('Numer telefonu został pomyślnie zweryfikowany!');
        onCompleted();
      } else {
        toast.error('Nieprawidłowy kod weryfikacyjny. Spróbuj ponownie.');
      }
    } catch (error) {
      console.error('Error verifying code:', error);
      toast.error('Nie udało się zweryfikować kodu. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  if (isVerified) {
    return (
      <div className="max-w-md mx-auto py-8 px-4">
        <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Telefon Zweryfikowany</h2>
          <p className="text-gray-300 mb-6">
            Twój numer telefonu {formatPhoneNumber(phoneNumber)} został pomyślnie zweryfikowany.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCompleted}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#FF9F2D] hover:bg-[#f39729]"
          >
            Kontynuuj <ArrowRight className="ml-2 h-4 w-4" />
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8">
        <h2 className="text-2xl font-bold text-white mb-2 text-center">Weryfikacja Numeru Telefonu</h2>
        <p className="text-gray-300 mb-6 text-center">
          Musimy zweryfikować Twój numer telefonu ze względów bezpieczeństwa
        </p>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-300">Twój Telefon</label>
            <button 
              onClick={onChangePhone} 
              className="text-sm text-[#FF9F2D] hover:text-[#f39729]"
            >
              Zmień
            </button>
          </div>
          <div className="p-3 rounded-md bg-white/10 text-white">
            {phoneNumber || 'Nie podano numeru telefonu'}
          </div>
        </div>

        {!verificationSent ? (
          <div className="text-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={sendVerificationCode}
              disabled={loading || !phoneNumber}
              className="w-full flex justify-center items-center space-x-2 px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#FF9F2D] hover:bg-[#f39729] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              <span>{loading ? 'Wysyłanie...' : 'Wyślij Kod Weryfikacyjny'}</span>
            </motion.button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
                Wprowadź Kod Weryfikacyjny
              </label>
              <input
                type="text"
                id="code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                placeholder="Wprowadź 6-cyfrowy kod"
                className="mt-1 block w-full rounded-md border-gray-300/20 bg-white/5 text-white shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] sm:text-sm"
                maxLength={6}
              />
              <p className="mt-2 text-sm text-gray-400">
                {countdown > 0
                  ? `Możesz poprosić o nowy kod za ${countdown} sekund`
                  : "Nie otrzymałeś kodu?"}
                {countdown === 0 && (
                  <button
                    onClick={sendVerificationCode}
                    disabled={loading}
                    className="ml-2 text-[#FF9F2D] hover:text-[#f39729] disabled:opacity-50"
                  >
                    Wyślij ponownie
                  </button>
                )}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={verifyCode}
              disabled={loading || !verificationCode}
              className="w-full flex justify-center items-center space-x-2 px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#FF9F2D] hover:bg-[#f39729] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              <span>{loading ? 'Weryfikacja...' : 'Zweryfikuj'}</span>
            </motion.button>
          </div>
        )}

        <div className="mt-6 text-xs text-center text-gray-500">
          <p>
            W tej wersji demo użyj kodu <span className="font-mono text-[#FF9F2D]">1234</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhoneVerification; 
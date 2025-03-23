import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { Loader2, User, Building, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

interface PersonalData {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
  phone_number: string;
  organization_name: string;
  tax_id: string;
  business_type: string;
  nonprofit_id: string;
  mission_statement: string;
  professional_category: string;
  portfolio_url: string;
}

interface ProfileData {
  id: string;
  account_type: string;
}

type FormErrors = {
  [key: string]: string;
};

export default function PersonalDataManagement() {
  const { user } = useAuth();
  const [personalData, setPersonalData] = useState<PersonalData | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<PersonalData>>({});
  const [errors, setErrors] = useState<FormErrors>({});
  
  // Phone verification modal state
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        // Get account type first
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, account_type')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        setProfileData(profileData);
        
        // Get personal data
        const { data, error } = await supabase
          .from('personal_data')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error) {
          if (error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
            throw error;
          }
        } else {
          setPersonalData(data);
          setFormData(data);
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        toast.error("Błąd podczas pobierania danych osobowych");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user]);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    // Check required fields based on account type
    if (profileData?.account_type === 'individual') {
      if (!formData.first_name?.trim()) newErrors.first_name = 'Imię jest wymagane';
      if (!formData.last_name?.trim()) newErrors.last_name = 'Nazwisko jest wymagane';
    } else if (profileData?.account_type === 'nonprofit') {
      if (!formData.organization_name?.trim()) newErrors.organization_name = 'Nazwa organizacji jest wymagana';
      if (!formData.nonprofit_id?.trim()) newErrors.nonprofit_id = 'Numer KRS jest wymagany';
    } else if (profileData?.account_type === 'business') {
      if (!formData.organization_name?.trim()) newErrors.organization_name = 'Nazwa firmy jest wymagana';
      if (!formData.tax_id?.trim()) newErrors.tax_id = 'NIP jest wymagany';
    }
    
    // Common validation
    if (!formData.address?.trim()) newErrors.address = 'Adres jest wymagany';
    if (!formData.city?.trim()) newErrors.city = 'Miasto jest wymagane';
    if (!formData.postal_code?.trim()) newErrors.postal_code = 'Kod pocztowy jest wymagany';
    if (!formData.country?.trim()) newErrors.country = 'Kraj jest wymagany';
    
    // Phone validation
    const phoneRegex = /^\+?[0-9\s]{9,15}$/;
    if (!formData.phone_number?.trim()) {
      newErrors.phone_number = 'Numer telefonu jest wymagany';
    } else if (!phoneRegex.test(formData.phone_number.trim())) {
      newErrors.phone_number = 'Nieprawidłowy format numeru telefonu';
    }
    
    // Postal code validation (Polish format)
    const postalRegex = /^[0-9]{2}-[0-9]{3}$/;
    if (formData.postal_code && !postalRegex.test(formData.postal_code.trim())) {
      newErrors.postal_code = 'Nieprawidłowy format kodu pocztowego (00-000)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for phone_number to trigger verification
    if (name === 'phone_number' && personalData?.phone_number !== value) {
      setNewPhoneNumber(value);
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!validateForm()) {
      toast.error('Proszę poprawić błędy w formularzu');
      return;
    }
    
    // Check if phone number has changed
    if (personalData?.phone_number !== formData.phone_number && formData.phone_number) {
      setNewPhoneNumber(formData.phone_number);
      setShowVerificationModal(true);
      return;
    }
    
    await savePersonalData();
  };
  
  const savePersonalData = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const dataToUpdate = {
        ...formData,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };
      
      let result;
      if (personalData?.id) {
        result = await supabase
          .from('personal_data')
          .update(dataToUpdate)
          .eq('id', personalData.id);
      } else {
        result = await supabase
          .from('personal_data')
          .insert([{ ...dataToUpdate, created_at: new Date().toISOString() }]);
      }
      
      if (result.error) throw result.error;
      
      toast.success('Dane osobowe zostały zaktualizowane');
      setIsEditing(false);
      
      // Reload updated data
      const { data, error } = await supabase
        .from('personal_data')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error) throw error;
      setPersonalData(data);
      
    } catch (error: any) {
      console.error("Error saving data:", error);
      toast.error("Nie udało się zapisać danych osobowych");
    } finally {
      setSaving(false);
    }
  };
  
  const sendVerificationCode = async () => {
    if (!newPhoneNumber) return;
    
    setSendingCode(true);
    try {
      // Here you would normally call your API to send a verification code
      // For this implementation, we'll simulate it with a timeout
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, you would call your backend:
      // const { data, error } = await supabase.functions.invoke('send-verification-sms', {
      //   body: { phoneNumber: newPhoneNumber }
      // });
      
      // if (error) throw error;
      
      toast.success(`Kod weryfikacyjny został wysłany na numer ${newPhoneNumber}`);
    } catch (error: any) {
      console.error("Error sending verification code:", error);
      toast.error("Nie udało się wysłać kodu weryfikacyjnego");
    } finally {
      setSendingCode(false);
    }
  };
  
  const verifyPhoneNumber = async () => {
    if (!verificationCode || !newPhoneNumber) return;
    
    setVerifyingCode(true);
    try {
      // Here you would normally verify the code with your API
      // For this implementation, we'll accept any 4-digit code
      
      if (verificationCode.length !== 4 || !/^\d+$/.test(verificationCode)) {
        throw new Error("Nieprawidłowy kod weryfikacyjny");
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update form data with verified phone number
      setFormData(prev => ({ ...prev, phone_number: newPhoneNumber }));
      
      // Close modal and save data
      setShowVerificationModal(false);
      setVerificationCode('');
      
      await savePersonalData();
      
      toast.success("Numer telefonu został zweryfikowany i zapisany");
    } catch (error: any) {
      console.error("Error verifying code:", error);
      toast.error(error.message || "Nie udało się zweryfikować kodu");
    } finally {
      setVerifyingCode(false);
    }
  };

  if (loading) {
    return (
      <div className="py-4 text-center text-gray-500">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p>Ładowanie danych osobowych...</p>
      </div>
    );
  }

  // Data view mode
  if (!isEditing) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold tracking-tight text-black">Dane osobowe</h2>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 rounded-lg bg-black text-white hover:bg-black/80 transition-colors"
          >
            Edytuj dane
          </button>
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profileData?.account_type === 'individual' && (
              <>
                <div>
                  <h3 className="flex items-center text-sm font-medium text-gray-500 mb-1">
                    <User className="h-4 w-4 mr-1" />
                    Imię
                  </h3>
                  <p className="text-sm text-gray-900">{personalData?.first_name || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Nazwisko</h3>
                  <p className="text-sm text-gray-900">{personalData?.last_name || '-'}</p>
                </div>
              </>
            )}
            
            {(profileData?.account_type === 'nonprofit' || profileData?.account_type === 'business') && (
              <>
                <div>
                  <h3 className="flex items-center text-sm font-medium text-gray-500 mb-1">
                    <Building className="h-4 w-4 mr-1" />
                    Nazwa organizacji
                  </h3>
                  <p className="text-sm text-gray-900">{personalData?.organization_name || '-'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">
                    {profileData?.account_type === 'nonprofit' ? 'KRS' : 'NIP'}
                  </h3>
                  <p className="text-sm text-gray-900">
                    {profileData?.account_type === 'nonprofit' 
                      ? (personalData?.nonprofit_id || '-')
                      : (personalData?.tax_id || '-')}
                  </p>
                </div>
              </>
            )}
            
            {/* Common fields */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Adres</h3>
              <p className="text-sm text-gray-900">{personalData?.address || '-'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Miasto</h3>
              <p className="text-sm text-gray-900">{personalData?.city || '-'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Kod pocztowy</h3>
              <p className="text-sm text-gray-900">{personalData?.postal_code || '-'}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Kraj</h3>
              <p className="text-sm text-gray-900">{personalData?.country || '-'}</p>
            </div>
            
            <div>
              <h3 className="flex items-center text-sm font-medium text-gray-500 mb-1">
                <Phone className="h-4 w-4 mr-1" />
                Telefon
              </h3>
              <p className="text-sm text-gray-900">{personalData?.phone_number || '-'}</p>
            </div>
            
            {profileData?.account_type === 'nonprofit' && personalData?.mission_statement && (
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Misja organizacji</h3>
                <p className="text-sm text-gray-900">{personalData.mission_statement}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Edit form mode
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold tracking-tight text-black">Edycja danych osobowych</h2>
        <button
          onClick={() => setIsEditing(false)}
          className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
        >
          Anuluj
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg p-6 border border-gray-200">
        {/* Fields for individual */}
        {profileData?.account_type === 'individual' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                Imię
              </label>
              <input
                type="text"
                id="first_name"
                name="first_name"
                value={formData.first_name || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] sm:text-sm ${
                  errors.first_name ? 'border-red-300' : ''
                }`}
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-600">{errors.first_name}</p>
              )}
            </div>
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                Nazwisko
              </label>
              <input
                type="text"
                id="last_name"
                name="last_name"
                value={formData.last_name || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] sm:text-sm ${
                  errors.last_name ? 'border-red-300' : ''
                }`}
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-600">{errors.last_name}</p>
              )}
            </div>
          </div>
        )}
        
        {/* Fields for organizations (nonprofit or business) */}
        {(profileData?.account_type === 'nonprofit' || profileData?.account_type === 'business') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="organization_name" className="block text-sm font-medium text-gray-700">
                Nazwa organizacji
              </label>
              <input
                type="text"
                id="organization_name"
                name="organization_name"
                value={formData.organization_name || ''}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] sm:text-sm ${
                  errors.organization_name ? 'border-red-300' : ''
                }`}
              />
              {errors.organization_name && (
                <p className="mt-1 text-sm text-red-600">{errors.organization_name}</p>
              )}
            </div>
            
            {profileData?.account_type === 'nonprofit' ? (
              <div>
                <label htmlFor="nonprofit_id" className="block text-sm font-medium text-gray-700">
                  Numer KRS
                </label>
                <input
                  type="text"
                  id="nonprofit_id"
                  name="nonprofit_id"
                  value={formData.nonprofit_id || ''}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] sm:text-sm ${
                    errors.nonprofit_id ? 'border-red-300' : ''
                  }`}
                />
                {errors.nonprofit_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.nonprofit_id}</p>
                )}
              </div>
            ) : (
              <div>
                <label htmlFor="tax_id" className="block text-sm font-medium text-gray-700">
                  NIP
                </label>
                <input
                  type="text"
                  id="tax_id"
                  name="tax_id"
                  value={formData.tax_id || ''}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] sm:text-sm ${
                    errors.tax_id ? 'border-red-300' : ''
                  }`}
                />
                {errors.tax_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.tax_id}</p>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Common fields for all account types */}
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">
            Adres
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address || ''}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] sm:text-sm ${
              errors.address ? 'border-red-300' : ''
            }`}
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              Miasto
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] sm:text-sm ${
                errors.city ? 'border-red-300' : ''
              }`}
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
              Kod pocztowy
            </label>
            <input
              type="text"
              id="postal_code"
              name="postal_code"
              value={formData.postal_code || ''}
              onChange={handleInputChange}
              placeholder="00-000"
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] sm:text-sm ${
                errors.postal_code ? 'border-red-300' : ''
              }`}
            />
            {errors.postal_code && (
              <p className="mt-1 text-sm text-red-600">{errors.postal_code}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Kraj
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country || ''}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] sm:text-sm ${
                errors.country ? 'border-red-300' : ''
              }`}
            />
            {errors.country && (
              <p className="mt-1 text-sm text-red-600">{errors.country}</p>
            )}
          </div>
        </div>
        
        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
            Numer telefonu
          </label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number || ''}
            onChange={handleInputChange}
            placeholder="+48 123 456 789"
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] sm:text-sm ${
              errors.phone_number ? 'border-red-300' : ''
            }`}
          />
          {errors.phone_number && (
            <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Zmiana numeru telefonu wymaga weryfikacji przez kod SMS
          </p>
        </div>
        
        {/* Mission statement for nonprofit organizations */}
        {profileData?.account_type === 'nonprofit' && (
          <div>
            <label htmlFor="mission_statement" className="block text-sm font-medium text-gray-700">
              Misja organizacji
            </label>
            <textarea
              id="mission_statement"
              name="mission_statement"
              rows={3}
              value={formData.mission_statement || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] sm:text-sm"
            />
          </div>
        )}
        
        {/* Submit button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 rounded-md text-white font-medium flex items-center justify-center space-x-2 bg-[#FF9F2D] hover:bg-[#f39729] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{saving ? 'Zapisywanie...' : 'Zapisz zmiany'}</span>
          </button>
        </div>
      </form>
      
      {/* Phone number verification modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-medium text-gray-900 mb-4">Weryfikacja numeru telefonu</h3>
            <p className="text-sm text-gray-500 mb-4">
              Aby zaktualizować numer telefonu, musisz go zweryfikować. Poniżej możesz wysłać kod weryfikacyjny na nowy numer.
            </p>
            
            <div className="mb-4">
              <label htmlFor="new_phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                Nowy numer telefonu
              </label>
              <input
                type="tel"
                id="new_phone_number"
                value={newPhoneNumber}
                onChange={(e) => setNewPhoneNumber(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] sm:text-sm"
                placeholder="+48 123 456 789"
              />
            </div>
            
            <div className="flex justify-end mb-4">
              <button
                type="button"
                onClick={sendVerificationCode}
                disabled={sendingCode || !newPhoneNumber}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 text-sm flex items-center"
              >
                {sendingCode && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
                {sendingCode ? 'Wysyłanie...' : 'Wyślij kod weryfikacyjny'}
              </button>
            </div>
            
            <div className="mb-6">
              <label htmlFor="verification_code" className="block text-sm font-medium text-gray-700 mb-1">
                Kod weryfikacyjny
              </label>
              <input
                type="text"
                id="verification_code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] sm:text-sm"
                placeholder="1234"
                maxLength={4}
              />
              <p className="mt-1 text-xs text-gray-500">
                Wprowadź 4-cyfrowy kod otrzymany w wiadomości SMS
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowVerificationModal(false)}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 text-sm"
              >
                Anuluj
              </button>
              <button
                type="button"
                onClick={verifyPhoneNumber}
                disabled={verifyingCode || !verificationCode}
                className="px-4 py-2 rounded bg-[#FF9F2D] text-white hover:bg-[#f39729] disabled:opacity-50 text-sm flex items-center"
              >
                {verifyingCode && <Loader2 className="h-3 w-3 animate-spin mr-2" />}
                {verifyingCode ? 'Weryfikacja...' : 'Potwierdź'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 
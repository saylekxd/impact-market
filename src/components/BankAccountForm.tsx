import React, { useState, useEffect } from 'react';
import { usePayouts } from '../contexts/PayoutContext';
import { toast } from 'react-hot-toast';
import { Pencil } from 'lucide-react';

export default function BankAccountForm() {
  const { bankAccount, saveBankAccount, loading: contextLoading } = usePayouts();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState({
    account_number: '',
    bank_name: '',
    swift_code: '',
  });
  const [formData, setFormData] = useState({
    account_number: '',
    bank_name: '',
    swift_code: '',
  });

  // Aktualizuj formularz gdy dane bankowe zostaną załadowane
  useEffect(() => {
    if (bankAccount) {
      setFormData({
        account_number: bankAccount.account_number || '',
        bank_name: bankAccount.bank_name || '',
        swift_code: bankAccount.swift_code || '',
      });
    }
  }, [bankAccount]);

  const validateForm = () => {
    const newErrors = {
      account_number: '',
      bank_name: '',
      swift_code: '',
    };
    let isValid = true;

    // Validate account number (Polish IBAN format)
    const accountNumberRegex = /^PL\d{26}$/;
    if (!formData.account_number) {
      newErrors.account_number = 'Numer konta jest wymagany';
      isValid = false;
    } else if (!accountNumberRegex.test(formData.account_number.replace(/\s/g, ''))) {
      newErrors.account_number = 'Nieprawidłowy format numeru konta (wymagany format: PL + 26 cyfr)';
      isValid = false;
    }

    // Validate bank name
    if (!formData.bank_name) {
      newErrors.bank_name = 'Nazwa banku jest wymagana';
      isValid = false;
    } else if (formData.bank_name.length < 2) {
      newErrors.bank_name = 'Nazwa banku jest za krótka';
      isValid = false;
    }

    // Validate SWIFT/BIC code
    const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
    if (!formData.swift_code) {
      newErrors.swift_code = 'Kod SWIFT/BIC jest wymagany';
      isValid = false;
    } else if (!swiftRegex.test(formData.swift_code)) {
      newErrors.swift_code = 'Nieprawidłowy format kodu SWIFT/BIC';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Proszę poprawić błędy w formularzu');
      return;
    }

    setLoading(true);
    
    try {
      const success = await saveBankAccount(formData);
      if (success) {
        setIsEditing(false);
        toast.success('Dane bankowe zostały zapisane.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (contextLoading) {
    return (
      <div className="py-4 text-center text-gray-500">
        Ładowanie danych bankowych...
      </div>
    );
  }

  // Jeśli mamy już dane bankowe i nie jesteśmy w trybie edycji, pokazujemy podgląd
  if (bankAccount && !isEditing) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium text-gray-900">Twoje dane bankowe</h3>
            <button
              onClick={() => setIsEditing(true)}
              className="text-[#FF9F2D] hover:text-[#f39729] flex items-center gap-1"
            >
              <Pencil className="h-4 w-4" />
              <span>Edytuj</span>
            </button>
          </div>
          
          <dl className="grid grid-cols-1 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">Numer konta</dt>
              <dd className="mt-1 text-sm text-gray-900">{bankAccount.account_number}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Nazwa banku</dt>
              <dd className="mt-1 text-sm text-gray-900">{bankAccount.bank_name}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Kod SWIFT/BIC</dt>
              <dd className="mt-1 text-sm text-gray-900">{bankAccount.swift_code}</dd>
            </div>
          </dl>
        </div>
      </div>
    );
  }

  // Formularz do dodawania/edycji danych
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="account_number" className="block text-sm font-medium text-gray-700">
          Numer konta
        </label>
        <input
          type="text"
          id="account_number"
          name="account_number"
          required
          value={formData.account_number}
          onChange={handleInputChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] sm:text-sm ${
            errors.account_number ? 'border-red-300' : ''
          }`}
          placeholder="PL00 0000 0000 0000 0000 0000 0000"
        />
        {errors.account_number && (
          <p className="mt-1 text-sm text-red-600">{errors.account_number}</p>
        )}
      </div>

      <div>
        <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700">
          Nazwa banku
        </label>
        <input
          type="text"
          id="bank_name"
          name="bank_name"
          required
          value={formData.bank_name}
          onChange={handleInputChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] sm:text-sm ${
            errors.bank_name ? 'border-red-300' : ''
          }`}
          placeholder="Nazwa banku"
        />
        {errors.bank_name && (
          <p className="mt-1 text-sm text-red-600">{errors.bank_name}</p>
        )}
      </div>

      <div>
        <label htmlFor="swift_code" className="block text-sm font-medium text-gray-700">
          Kod SWIFT/BIC
        </label>
        <input
          type="text"
          id="swift_code"
          name="swift_code"
          required
          value={formData.swift_code}
          onChange={handleInputChange}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF9F2D] focus:ring-[#FF9F2D] sm:text-sm ${
            errors.swift_code ? 'border-red-300' : ''
          }`}
          placeholder="BREXPLPWXXX"
        />
        {errors.swift_code && (
          <p className="mt-1 text-sm text-red-600">{errors.swift_code}</p>
        )}
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#FF9F2D] hover:bg-[#f39729] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9F2D] disabled:opacity-50"
        >
          {loading ? 'Zapisywanie...' : bankAccount ? 'Zapisz zmiany' : 'Zapisz dane bankowe'}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setFormData({
                account_number: bankAccount?.account_number || '',
                bank_name: bankAccount?.bank_name || '',
                swift_code: bankAccount?.swift_code || '',
              });
              setErrors({
                account_number: '',
                bank_name: '',
                swift_code: '',
              });
            }}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF9F2D]"
          >
            Anuluj
          </button>
        )}
      </div>
    </form>
  );
}
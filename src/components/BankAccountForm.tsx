import React, { useState, useEffect } from 'react';
import { usePayouts } from '../contexts/PayoutContext';
import { toast } from 'react-hot-toast';
import { Pencil } from 'lucide-react';

export default function BankAccountForm() {
  const { bankAccount, saveBankAccount, loading: contextLoading } = usePayouts();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
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
          required
          value={formData.account_number}
          onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="PL00 0000 0000 0000 0000 0000 0000"
        />
      </div>

      <div>
        <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700">
          Nazwa banku
        </label>
        <input
          type="text"
          id="bank_name"
          required
          value={formData.bank_name}
          onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Nazwa banku"
        />
      </div>

      <div>
        <label htmlFor="swift_code" className="block text-sm font-medium text-gray-700">
          Kod SWIFT/BIC
        </label>
        <input
          type="text"
          id="swift_code"
          required
          value={formData.swift_code}
          onChange={(e) => setFormData({ ...formData, swift_code: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="BREXPLPWXXX"
        />
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
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
            }}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Anuluj
          </button>
        )}
      </div>
    </form>
  );
}
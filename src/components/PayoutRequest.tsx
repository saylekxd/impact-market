import React, { useState } from 'react';
import { usePayouts } from '../contexts/PayoutContext';

interface PayoutRequestProps {
  availableBalance: number;
}

export default function PayoutRequest({ availableBalance }: PayoutRequestProps) {
  const { requestPayout } = usePayouts();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const amountInCents = Math.round(parseFloat(amount) * 100);
      if (isNaN(amountInCents) || amountInCents <= 0) {
        throw new Error('Nieprawidłowa kwota');
      }

      if (amountInCents > availableBalance) {
        throw new Error('Niewystarczające środki');
      }

      await requestPayout(amountInCents);
      setAmount('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
          Kwota do wypłaty
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <input
            type="number"
            id="amount"
            required
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="block w-full pr-12 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="0.00"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">PLN</span>
          </div>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          Dostępne środki: {(availableBalance / 100).toFixed(2)} PLN
        </p>
      </div>

      <button
        type="submit"
        disabled={loading || !amount || parseFloat(amount) * 100 > availableBalance}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Przetwarzanie...' : 'Złóż wniosek o wypłatę'}
      </button>
    </form>
  );
}
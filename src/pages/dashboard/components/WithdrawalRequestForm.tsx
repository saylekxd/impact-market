import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Building } from 'lucide-react';
import type { Database } from '../../../lib/database.types';

type BankAccount = Database['public']['Tables']['bank_accounts']['Row'];

interface WithdrawalRequestFormProps {
  bankAccount: BankAccount | null;
  availableBalance: number;
  pendingWithdrawals: number;
  formatCurrency: (amount: number) => string;
  onRequestWithdrawal: (amountInCents: number, amount: string, bankAccountId?: string) => void;
}

export default function WithdrawalRequestForm({
  bankAccount,
  availableBalance,
  pendingWithdrawals,
  formatCurrency,
  onRequestWithdrawal
}: WithdrawalRequestFormProps) {
  const [amount, setAmount] = useState('');
  const [amountError, setAmountError] = useState('');
  const [selectedBankAccount, setSelectedBankAccount] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset error
    setAmountError('');
    
    // Validate amount
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setAmountError('Wprowadź prawidłową kwotę');
      return;
    }
    
    const amountInCents = Math.floor(Number(amount) * 100);
    
    if (amountInCents > availableBalance) {
      setAmountError('Kwota przekracza dostępne środki');
      return;
    }
    
    if (amountInCents < 1000) { // Minimum 10 PLN
      setAmountError('Minimalna kwota wypłaty to 10 PLN');
      return;
    }
    
    // If validation passes, show confirmation dialog
    onRequestWithdrawal(amountInCents, amount, selectedBankAccount || undefined);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center mb-4">
          <ArrowRight className="h-6 w-6 text-gray-500 mr-2" />
          <h2 className="text-xl font-bold tracking-tight text-black">Złóż wniosek o wypłatę</h2>
        </div>
        <p className="text-gray-600 mb-6">
          Wprowadź kwotę, którą chcesz wypłacić na swoje konto bankowe
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex justify-between">
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                Kwota wypłaty (PLN)
              </label>
              <span className="text-sm text-gray-500">
                Dostępne: {formatCurrency(availableBalance)}
                {pendingWithdrawals > 0 && ` (${formatCurrency(pendingWithdrawals)} oczekuje)`}
              </span>
            </div>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">zł</span>
              </div>
              <input
                type="text"
                name="amount"
                id="amount"
                className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 sm:text-sm border-gray-300 rounded-md ${
                  amountError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
                }`}
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setAmountError(''); // Clear error on change
                }}
                required
              />
            </div>
            {amountError && (
              <p className="mt-2 text-sm text-red-600">{amountError}</p>
            )}
            <p className="mt-2 text-xs text-gray-500">
              Minimalna kwota wypłaty: 10 PLN
            </p>
          </div>
          
          {/* Bank account selector */}
          <div>
            <label htmlFor="bankAccount" className="block text-sm font-medium text-gray-700">
              Konto bankowe
            </label>
            <div className="mt-1 bg-gray-50 p-3 rounded-md border border-gray-200">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-0.5">
                  <Building className="h-5 w-5 text-gray-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{bankAccount?.bank_name}</p>
                  <p className="text-sm text-gray-500">{bankAccount?.account_number}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={availableBalance <= 0}
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
            >
              Dalej
            </button>
            {availableBalance <= 0 && (
              <p className="mt-2 text-sm text-red-600">
                Nie masz wystarczających środków do wypłaty
              </p>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  );
} 
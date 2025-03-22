import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Database } from '../../../lib/database.types';

type BankAccount = Database['public']['Tables']['bank_accounts']['Row'];

interface ConfirmationDialogProps {
  amount: string;
  bankAccount: BankAccount | null;
  submitting: boolean;
  formatCurrency: (amount: number) => string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationDialog({
  amount,
  bankAccount,
  submitting,
  formatCurrency,
  onConfirm,
  onCancel
}: ConfirmationDialogProps) {
  const amountInCents = Math.floor(Number(amount) * 100);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl"
      >
        <div className="text-center mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Potwierdź wypłatę</h3>
          <p className="text-gray-600">
            Czy na pewno chcesz zlecić wypłatę na kwotę {formatCurrency(amountInCents)}?
          </p>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Kwota:</span>
            <span className="text-sm font-medium">{formatCurrency(amountInCents)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-500">Bank:</span>
            <span className="text-sm font-medium">{bankAccount?.bank_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Numer konta:</span>
            <span className="text-sm font-medium">{bankAccount?.account_number}</span>
          </div>
        </div>
        
        <div className="flex flex-col space-y-3">
          <button
            onClick={onConfirm}
            disabled={submitting}
            className="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-black/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full mr-2"></div>
                Przetwarzanie...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Potwierdź wypłatę
              </>
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={submitting}
            className="inline-flex justify-center items-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Anuluj
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
} 
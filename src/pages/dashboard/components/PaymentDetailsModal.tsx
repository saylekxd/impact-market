import React from 'react';
import { motion } from 'framer-motion';
import { X as CloseIcon } from 'lucide-react';
import { Database } from '../../../lib/database.types';

type Payment = Database['public']['Tables']['payments']['Row'];

type PaymentDetailsModalProps = {
  payment: Payment | null;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
};

const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
  payment,
  onClose,
  formatCurrency,
}) => {
  if (!payment) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-center justify-center min-h-screen p-4 text-center">
        <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="relative inline-block w-full max-w-lg bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all"
        >
          <div className="absolute top-4 right-4">
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Zamknij</span>
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="space-y-6">
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-gray-500">ID transakcji</span>
                <span className="text-base font-medium text-orange-500 font-mono">{payment.id}</span>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-sm text-gray-500">DATA</span>
                <div>
                  <div className="text-base font-medium text-gray-900">
                    {new Date(payment.created_at).toLocaleDateString('pl-PL')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(payment.created_at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-sm text-gray-500">STATUS</span>
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full w-fit
                  ${payment.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-red-100 text-red-800'}`}>
                  {payment.status === 'completed' ? 'Zakończona' : 
                   payment.status === 'pending' ? 'W trakcie' : 'Anulowana'}
                </span>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-sm text-gray-500">KWOTA</span>
                <div>
                  <div className="text-2xl font-bold text-orange-500">{formatCurrency(payment.amount)}</div>
                  <div className="text-sm text-gray-500">{payment.payment_type || 'stripe'}</div>
                </div>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-sm text-gray-500">DARCZYŃCA</span>
                <span className="text-base text-gray-900">{payment.payer_name || 'Anonimowy darczyńca'}</span>
              </div>

              <div className="flex flex-col space-y-1">
                <span className="text-sm text-gray-500">WIADOMOŚĆ</span>
                <span className="text-base text-gray-500 italic">{payment.message || 'Brak wiadomości'}</span>
              </div>
            </div>

            <div className="mt-8 text-right">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Zamknij
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PaymentDetailsModal; 
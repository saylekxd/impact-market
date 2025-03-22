import React from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import type { Database } from '../../../lib/database.types';

type Payout = Database['public']['Tables']['payouts']['Row'] & {
  bank_accounts?: {
    account_number: string;
    bank_name: string;
  };
};

interface WithdrawalHistoryProps {
  payouts: Payout[];
  formatCurrency: (amount: number) => string;
}

export default function WithdrawalHistory({ payouts, formatCurrency }: WithdrawalHistoryProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.5 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center mb-4">
          <Clock className="h-6 w-6 text-gray-500 mr-2" />
          <h2 className="text-xl font-bold tracking-tight text-black">Historia wypłat</h2>
        </div>
        
        {payouts && payouts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kwota
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payouts.slice(0, 5).map((payout, index) => (
                  <motion.tr 
                    key={payout.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payout.created_at).toLocaleDateString('pl-PL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(payout.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payout.status === 'completed' ? 'bg-green-100 text-green-800' : 
                        payout.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        payout.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {payout.status === 'completed' ? 'Zrealizowana' : 
                         payout.status === 'pending' ? 'Oczekująca' :
                         payout.status === 'rejected' ? 'Odrzucona' : 
                         payout.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 font-medium">Nie masz jeszcze żadnych wypłat</p>
            <p className="text-sm text-gray-400 mt-2">
              Wypłaty pojawią się tutaj po ich zleceniu
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
} 
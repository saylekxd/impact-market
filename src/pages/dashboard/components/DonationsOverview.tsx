import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, ArrowUpRight, ArrowDownRight, BarChart3 } from 'lucide-react';

type DonationsOverviewProps = {
  totalAmount: number;
  lastMonthAmount: number;
  transactionCount: number;
  uniqueDonors: number;
  formatCurrency: (amount: number) => string;
  dateRangeLabel: string;
};

const DonationsOverview: React.FC<DonationsOverviewProps> = ({
  totalAmount,
  lastMonthAmount,
  transactionCount,
  uniqueDonors,
  formatCurrency,
  dateRangeLabel,
}) => {
  useEffect(() => {
    console.log('DonationsOverview rendered with props:', {
      totalAmount,
      lastMonthAmount,
      transactionCount,
      uniqueDonors,
      dateRangeLabel
    });
  }, [totalAmount, lastMonthAmount, transactionCount, uniqueDonors, dateRangeLabel]);

  // Check if we have meaningful data
  const hasData = totalAmount > 0 || lastMonthAmount > 0 || transactionCount > 0;
  
  // Calculate metrics
  const averageDonation = transactionCount > 0 ? totalAmount / transactionCount : 0;
  
  // Calculate month-over-month change percentage
  let changePercentage = 0;
  if (lastMonthAmount > 0 && totalAmount > 0) {
    changePercentage = ((totalAmount - lastMonthAmount) / lastMonthAmount) * 100;
  }
  
  // Determine direction of change
  const isPositiveChange = changePercentage >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Heart className="h-6 w-6 text-orange-500 mr-2" />
          <h2 className="text-xl font-bold tracking-tight text-black">Przegląd darowizn</h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly comparison chart */}
          <div className="lg:col-span-2 bg-gray-50 rounded-xl p-5">
            <h3 className="text-sm font-medium text-gray-500 mb-4">
              Porównanie miesięczne {dateRangeLabel !== 'Wszystkie' ? `(${dateRangeLabel})` : ''}
            </h3>
            
            {hasData ? (
              <div className="flex items-end space-x-2 h-40 mb-3">
                <div className="flex flex-col items-center flex-1">
                  <div className="w-full bg-gray-200 rounded-t-sm relative" style={{ 
                    height: `${lastMonthAmount ? '100%' : '5%'}`,
                    minHeight: '4px'
                  }}>
                    <div className="absolute inset-0 bg-gray-400 rounded-t-sm"></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Poprzedni</p>
                  <p className="text-sm font-medium">{formatCurrency(lastMonthAmount)}</p>
                </div>
                
                <div className="flex flex-col items-center flex-1">
                  <div className="w-full bg-gray-200 rounded-t-sm relative" style={{ 
                    height: `${lastMonthAmount ? 
                      Math.min(100, Math.max(5, (totalAmount / Math.max(1, lastMonthAmount)) * 100)) + '%' 
                      : '5%'}`,
                    minHeight: '4px'
                  }}>
                    <div className="absolute inset-0 bg-orange-500 rounded-t-sm"></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Bieżący</p>
                  <p className="text-sm font-medium">{formatCurrency(totalAmount)}</p>
                </div>
                
                <div className="flex flex-col items-center flex-1">
                  <div className="w-full bg-gray-200 rounded-t-sm relative" style={{ 
                    height: `${lastMonthAmount ? 
                      Math.min(100, Math.max(5, (totalAmount / Math.max(1, lastMonthAmount)) * 100)) + '%' 
                      : '5%'}`,
                    minHeight: '4px'
                  }}>
                    <div className="absolute inset-0 bg-amber-400 rounded-t-sm"></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Ostatnie 30 dni</p>
                  <p className="text-sm font-medium">{formatCurrency(totalAmount)}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 mb-3">
                <BarChart3 className="h-10 w-10 text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">Brak danych do wyświetlenia</p>
                <p className="text-gray-400 text-xs text-center mt-1">
                  Gdy otrzymasz pierwsze darowizny, zobaczysz tu miesięczne porównanie.
                </p>
              </div>
            )}
          </div>
          
          {/* Stats highlights */}
          <div className="rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-medium text-orange-700 mb-4">
                Kluczowe wskaźniki {dateRangeLabel !== 'Wszystkie' ? `(${dateRangeLabel})` : ''}
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Liczba transakcji:</span>
                  <span className="font-medium text-gray-900">{transactionCount}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Zrealizowane darowizny:</span>
                  <span className="font-medium text-gray-900">{transactionCount}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Średnia darowizna:</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(averageDonation)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Unikalnych darczyńców:</span>
                  <span className="font-medium text-gray-900">{uniqueDonors}</span>
                </div>
              </div>
            </div>
            
            {changePercentage !== 0 && (
              <div className="mt-4 pt-4 border-t border-orange-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-orange-700">Miesięczny wzrost:</span>
                  <span className={`font-medium flex items-center ${isPositiveChange ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositiveChange ? (
                      <ArrowUpRight className="h-4 w-4 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(changePercentage).toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DonationsOverview; 
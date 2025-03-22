import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { BarChart4, Calendar, TrendingUp, ArrowUp, Hourglass, Clock, DollarSign } from 'lucide-react';
import type { Database } from '../../../lib/database.types';

type Payout = Database['public']['Tables']['payouts']['Row'];

interface WithdrawalStatisticsProps {
  payouts: Payout[];
  totalWithdrawn: number;
  formatCurrency: (amount: number) => string;
}

export default function WithdrawalStatistics({
  payouts,
  totalWithdrawn,
  formatCurrency
}: WithdrawalStatisticsProps) {
  const completedPayouts = payouts.filter(p => p.status === 'completed');
  const pendingPayouts = payouts.filter(p => p.status === 'pending');
  
  const averageWithdrawal = completedPayouts.length > 0 
    ? totalWithdrawn / completedPayouts.length 
    : 0;
  

  const lastWithdrawalDate = completedPayouts.length > 0
    ? completedPayouts.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0].created_at
    : null;
    
  const totalPendingAmount = pendingPayouts.reduce((sum, payout) => sum + payout.amount, 0);

  // Group payouts by month for chart data
  const monthlyData = useMemo(() => {
    const monthlyMap = new Map();
    
    // Initialize with last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(monthKey, {
        month: new Date(date).toLocaleDateString('pl-PL', { month: 'short', year: 'numeric' }),
        amount: 0
      });
    }
    
    // Fill in actual data
    completedPayouts.forEach(payout => {
      const date = new Date(payout.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyMap.has(monthKey)) {
        const current = monthlyMap.get(monthKey);
        monthlyMap.set(monthKey, {
          ...current,
          amount: current.amount + payout.amount
        });
      }
    });
    
    return Array.from(monthlyMap.values());
  }, [completedPayouts]);

  // Calculate max value for proper scaling
  const maxValue = useMemo(() => {
    const amounts = monthlyData.map(d => d.amount);
    return amounts.length > 0 ? Math.max(...amounts, 1) : 1;
  }, [monthlyData]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.6 }}
      className="bg-white rounded-xl shadow-sm overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center mb-4">
          <BarChart4 className="h-6 w-6 text-gray-500 mr-2" />
          <h2 className="text-xl font-bold tracking-tight text-black">Statystyki wypłat</h2>
        </div>
        
        {/* Primary stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatItem 
            icon={<DollarSign className="h-5 w-5" />}
            title="Suma wypłat"
            value={formatCurrency(totalWithdrawn)}
            delay={0.1}
          />
          <StatItem 
            icon={<TrendingUp className="h-5 w-5" />}
            title="Średnia wypłata"
            value={completedPayouts.length > 0 ? formatCurrency(averageWithdrawal) : "0,00 zł"}
            delay={0.15}
          />
          <StatItem 
            icon={<BarChart4 className="h-5 w-5" />}
            title="Liczba wypłat"
            value={`${completedPayouts.length}`}
            delay={0.2}
          />
          <StatItem 
            icon={<Calendar className="h-5 w-5" />}
            title="Ostatnia wypłata"
            value={lastWithdrawalDate ? new Date(lastWithdrawalDate).toLocaleDateString('pl-PL') : "Brak"}
            delay={0.25}
          />
        </div>
        
        {/* Pending withdrawals section */}
        <div className="mb-6">
          <div className="flex items-center mb-3">
            <Hourglass className="h-5 w-5 text-amber-500 mr-2" />
            <h3 className="text-md font-semibold text-gray-700">Wypłaty oczekujące</h3>
          </div>
          <div className="bg-amber-50 rounded-lg p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Liczba oczekujących</p>
                <p className="text-xl font-semibold">
                  {pendingPayouts.length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Łączna kwota</p>
                <p className="text-xl font-semibold">
                  {formatCurrency(totalPendingAmount)}
                </p>
              </div>
            </div>
            {pendingPayouts.length > 0 && (
              <p className="text-xs text-gray-500 mt-3">
                Wypłaty oczekujące są przetwarzane w ciągu 1-3 dni roboczych.
              </p>
            )}
          </div>
        </div>
        
        {/* Monthly withdrawal chart - Simplified version */}
        <div>
          <div className="flex items-center mb-3">
            <Clock className="h-5 w-5 text-orange-400 mr-2" />
            <h3 className="text-md font-semibold text-gray-700">Historia miesięczna</h3>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-end">
              {monthlyData.map((data, index) => {
                // Simple calculation for bar height
                const MAX_HEIGHT = 140; // Maximum height in pixels
                const barHeight = data.amount > 0 
                  ? Math.max(20, (data.amount / maxValue) * MAX_HEIGHT) 
                  : 4;
                
                return (
                  <div key={index} className="flex flex-col items-center" style={{ flex: '1' }}>
                    <div className="pb-1">
                      <div 
                        className="bg-orange-400 rounded-t-sm w-8 mx-auto"
                        style={{ 
                          height: `${barHeight}px`,
                          minHeight: '4px',
                          transition: 'height 0.5s ease-out'
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {data.month}
                    </p>
                    <p className="text-xs text-gray-700 font-medium mt-1">
                      {data.amount > 0 ? formatCurrency(data.amount) : '-'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Stat item component for consistency with Dashboard
type StatItemProps = {
  icon: React.ReactNode;
  title: string;
  value: string;
  delay?: number;
};

const StatItem: React.FC<StatItemProps> = ({ icon, title, value, delay = 0 }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-gray-50 rounded-lg p-4"
    >
      <div className="flex items-center mb-1">
        <div className="text-gray-500 mr-2">
          {icon}
        </div>
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      </div>
      <p className="text-xl font-semibold text-black">
        {value}
      </p>
    </motion.div>
  );
}; 
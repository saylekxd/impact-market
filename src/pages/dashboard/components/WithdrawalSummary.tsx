import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, AlertTriangle, ArrowUpRight } from 'lucide-react';

interface WithdrawalSummaryProps {
  availableBalance: number;
  totalWithdrawn: number;
  pendingWithdrawals: number;
  pendingCount: number;
  formatCurrency: (amount: number) => string;
}

export default function WithdrawalSummary({
  availableBalance,
  totalWithdrawn,
  pendingWithdrawals,
  pendingCount,
  formatCurrency
}: WithdrawalSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Available Balance */}
      <StatCard 
        icon={<Wallet className="h-6 w-6" />}
        title="Dostępne środki"
        value={formatCurrency(availableBalance)}
        delay={0.1}
      >
        {pendingWithdrawals > 0 && (
          <div className="mt-1 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Oczekujące wypłaty:</span>
              <span className="font-medium">−{formatCurrency(pendingWithdrawals)}</span>
            </div>
          </div>
        )}
      </StatCard>
      
      {/* Total Withdrawn */}
      <StatCard 
        icon={<TrendingUp className="h-6 w-6" />}
        title="Wypłacono łącznie"
        value={formatCurrency(totalWithdrawn)}
        indicator="up"
        delay={0.15}
      >
        <p className="mt-1 text-sm text-gray-500">
          Suma wszystkich zrealizowanych wypłat
        </p>
      </StatCard>
      
      {/* Pending Withdrawals */}
      <StatCard 
        icon={<AlertTriangle className="h-6 w-6" />}
        title="Oczekujące wypłaty"
        value={formatCurrency(pendingWithdrawals)}
        delay={0.2}
      >
        <div className="flex items-baseline">
          <p className="text-sm text-gray-500">
            ({pendingCount} {pendingCount === 1 ? 'wniosek' : 
              pendingCount < 5 ? 'wnioski' : 'wniosków'})
          </p>
        </div>
      </StatCard>
    </div>
  );
}

// StatCard component matching Dashboard.tsx style
type StatCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string;
  indicator?: 'up' | 'down';
  delay?: number;
  children?: React.ReactNode;
};

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  title, 
  value, 
  indicator, 
  delay = 0,
  children 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-white rounded-xl shadow-sm overflow-hidden p-5"
    >
      <div className="flex items-center">
        <div className="flex-shrink-0 text-gray-500">
          {icon}
        </div>
        <div className="ml-4 w-0 flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            {title}
          </p>
          <div className="flex items-baseline">
            <p className="text-2xl font-bold tracking-tight text-black">
              {value}
            </p>
            {indicator && (
              <span className={`ml-2 flex items-center text-sm font-medium ${
                indicator === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {indicator === 'up' ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowUpRight className="h-4 w-4 transform rotate-180" />
                )}
              </span>
            )}
          </div>
          {children}
        </div>
      </div>
    </motion.div>
  );
}; 
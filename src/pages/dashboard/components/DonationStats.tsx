import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Users, Calendar, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// StatCard component to match Dashboard styling
type StatCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string;
  indicator?: 'up' | 'down';
  delay?: number;
};

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, indicator, delay = 0 }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-white rounded-xl shadow-sm overflow-hidden p-5"
    >
      <div className="flex items-center">
        <div className="flex-shrink-0 text-orange-500">
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
                  <ArrowDownRight className="h-4 w-4" />
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

type DonationStatsProps = {
  totalAmount: number;
  uniqueDonors: number;
  periodAmount: number;
  transactionCount: number;
  formatCurrency: (amount: number) => string;
  lastMonthAmount?: number;
};

const DonationStats: React.FC<DonationStatsProps> = ({
  totalAmount,
  uniqueDonors,
  periodAmount,
  transactionCount,
  formatCurrency,
  lastMonthAmount = 0
}) => {
  useEffect(() => {
    console.log('DonationStats component rendered with props:', {
      totalAmount,
      uniqueDonors,
      periodAmount,
      transactionCount,
      lastMonthAmount
    });
  }, [totalAmount, uniqueDonors, periodAmount, transactionCount, lastMonthAmount]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        icon={<CreditCard className="h-6 w-6" />}
        title="Suma wszystkich darowizn"
        value={formatCurrency(totalAmount)}
        delay={0.1}
      />
      <StatCard 
        icon={<Users className="h-6 w-6" />}
        title="Unikalnych darczyńców"
        value={uniqueDonors.toString()}
        delay={0.2}
      />
      <StatCard 
        icon={<Calendar className="h-6 w-6" />}
        title="Suma w wybranym okresie"
        value={formatCurrency(periodAmount)}
        indicator={lastMonthAmount > 0 ? 'up' : lastMonthAmount < 0 ? 'down' : undefined}
        delay={0.3}
      />
      <StatCard 
        icon={<TrendingUp className="h-6 w-6" />}
        title="Liczba transakcji"
        value={transactionCount.toString()}
        delay={0.4}
      />
    </div>
  );
};

export default DonationStats; 
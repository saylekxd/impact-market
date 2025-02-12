import React from 'react';
import { TrendingUp, Users, Coffee, Calendar } from 'lucide-react';

interface DashboardStatsProps {
  totalAmount: number;
  donorsCount: number;
  lastMonthAmount: number;
  currentMonthAmount: number;
  monthlyGrowth: number;
}

export default function DashboardStats({
  totalAmount,
  donorsCount,
  lastMonthAmount,
  currentMonthAmount,
  monthlyGrowth,
}: DashboardStatsProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount / 100);
  };

  const getCurrentMonthName = () => {
    return new Intl.DateTimeFormat('pl-PL', { month: 'long' }).format(new Date());
  };

  const getLastMonthName = () => {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return new Intl.DateTimeFormat('pl-PL', { month: 'long' }).format(lastMonth);
  };

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Coffee className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Łączne wsparcie
                </dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {formatAmount(totalAmount)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {getCurrentMonthName()} (aktualny)
                </dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {formatAmount(currentMonthAmount)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Calendar className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  {getLastMonthName()}
                </dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {formatAmount(lastMonthAmount)}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-6 w-6 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Liczba wspierających
                </dt>
                <dd className="text-lg font-semibold text-gray-900">
                  {donorsCount}
                </dd>
                <dd className="text-sm text-gray-500">
                  {monthlyGrowth > 0 ? '+' : ''}{monthlyGrowth.toFixed(1)}% m/m
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
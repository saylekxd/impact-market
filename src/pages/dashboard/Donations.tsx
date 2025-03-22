import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../contexts/ProfileContext';
import DashboardLayout from '../../components/DashboardLayout';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { Database } from '../../lib/database.types';
import { Heart, TrendingUp, Clock, Users, ArrowUpRight, ArrowDownRight, CreditCard, Calendar, Filter, ArrowLeft, ArrowRight } from 'lucide-react';

// Define the type for payments
type Payment = Database['public']['Tables']['payments']['Row'];

export default function Donations() {
  const { user } = useAuth();
  const { profile, loading: profileLoading, loadProfile } = useProfile();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState({
    uniqueDonors: 0,
    totalDonations: 0,
    currentMonthAmount: 0,
    previousMonthAmount: 0,
    last30DaysAmount: 0,
    growthPercentage: 0,
    donationsCount: 0,
    allTransactionsCount: 0
  });
  
  // Add date range filtering
  const [dateRange, setDateRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
    label: string;
  }>({
    startDate: null,
    endDate: null,
    label: 'Wszystkie'
  });
  
  // Available date ranges
  const dateRanges = [
    { label: 'Wszystkie', value: 'all' },
    { label: 'Dzisiaj', value: 'today' },
    { label: 'Ostatnie 7 dni', value: '7days' },
    { label: 'Ostatnie 30 dni', value: '30days' },
    { label: 'Ten miesiąc', value: 'thisMonth' },
    { label: 'Poprzedni miesiąc', value: 'lastMonth' },
    { label: 'Ten rok', value: 'thisYear' }
  ];
  
  // Check if payment is within selected date range
  const isPaymentInDateRange = (payment: Payment) => {
    if (!dateRange.startDate && !dateRange.endDate) return true;
    
    const paymentDate = new Date(payment.created_at);
    
    if (dateRange.startDate && paymentDate < dateRange.startDate) return false;
    if (dateRange.endDate && paymentDate > dateRange.endDate) return false;
    
    return true;
  };
  
  // Filter payments by date range
  const filteredPayments = useMemo(() => {
    return payments.filter(isPaymentInDateRange);
  }, [payments, dateRange]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 2,
    }).format(amount / 100);
  };

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        // Load profile data
        await loadProfile();
        
        // Load payments history
        const { data, error } = await supabase
          .from('payments')
          .select('*')
          .eq('creator_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        setPayments(data || []);
      } catch (error) {
        console.error('Error loading donations data:', error);
        toast.error('Nie udało się załadować danych');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [user, loadProfile]);
  
  // Calculate filtered stats - this will update when date range changes
  useEffect(() => {
    if (payments.length > 0) {
      calculateFilteredStats(filteredPayments);
    }
  }, [filteredPayments]);
  
  // Calculate filtered stats - this will update when date range changes
  const calculateFilteredStats = (filteredPayments: Payment[]) => {
    // Get all transactions count from filtered payments
    const allTransactionsCount = filteredPayments.length;
    
    // Filter completed payments
    const completedPayments = filteredPayments.filter(p => p.status === 'completed');
    
    // Calculate total donations from filtered payments - only used for the current filter period
    const filteredTotalAmount = completedPayments.reduce((sum, p) => sum + p.amount, 0);
    
    // Count unique donors - treat each anonymous donation as a unique donor
    const uniqueDonorCount = completedPayments.reduce((count, payment) => {
      // If there's an email and it's not already counted, count it
      if (payment.payer_email) {
        return count.add(payment.payer_email);
      } else {
        // For anonymous donors (no email), use a unique identifier based on payment ID
        return count.add(`anonymous-${payment.id}`);
      }
    }, new Set<string>()).size;
    
    // Get current date
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Current month donations
    const currentMonthDonations = completedPayments
      .filter(p => {
        const date = new Date(p.created_at);
        return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
      })
      .reduce((sum, p) => sum + p.amount, 0);
    
    // Previous month donations
    const previousMonthDonations = completedPayments
      .filter(p => {
        const date = new Date(p.created_at);
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return date.getFullYear() === prevYear && date.getMonth() === prevMonth;
      })
      .reduce((sum, p) => sum + p.amount, 0);
    
    // Calculate growth percentage
    const monthlyGrowth = previousMonthDonations === 0
      ? 0 
      : ((currentMonthDonations - previousMonthDonations) / previousMonthDonations) * 100;
    
    // Last 30 days donations
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const last30DaysAmount = completedPayments
      .filter(p => new Date(p.created_at) >= thirtyDaysAgo)
      .reduce((sum, p) => sum + p.amount, 0);
    
    setStats({
      uniqueDonors: uniqueDonorCount,
      totalDonations: profile?.total_donations || 0, // Use total_donations from profile
      currentMonthAmount: currentMonthDonations,
      previousMonthAmount: previousMonthDonations,
      last30DaysAmount: last30DaysAmount,
      growthPercentage: monthlyGrowth,
      donationsCount: completedPayments.length,
      allTransactionsCount: allTransactionsCount
    });
  };
  
  // Function to update date range
  const handleDateRangeChange = (rangeValue: string) => {
    const now = new Date();
    let start: Date | null = null;
    let end: Date | null = null;
    let label = 'Własny zakres';
    
    switch (rangeValue) {
      case 'all':
        // No date filtering
        label = 'Wszystkie';
        break;
      case 'today':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = now;
        label = 'Dzisiaj';
        break;
      case '7days':
        start = new Date();
        start.setDate(now.getDate() - 7);
        end = now;
        label = 'Ostatnie 7 dni';
        break;
      case '30days':
        start = new Date();
        start.setDate(now.getDate() - 30);
        end = now;
        label = 'Ostatnie 30 dni';
        break;
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = now;
        label = 'Ten miesiąc';
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        label = 'Poprzedni miesiąc';
        break;
      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1);
        end = now;
        label = 'Ten rok';
        break;
    }
    
    setDateRange({ startDate: start, endDate: end, label });
  };
  
  if (loading || profileLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-2 border-orange-500 border-t-transparent animate-spin"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-black">Darowizny</h1>
          <p className="mt-1 text-gray-500">
            Zobacz statystyki otrzymanych darowizn i zarządzaj swoim wsparciem.
          </p>
        </motion.div>
        
        {/* Date range filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-orange-500 mr-2" />
              <span className="text-sm font-medium">Filtruj według okresu:</span>
            </div>
            <div className="text-sm text-gray-500">
              {dateRange.startDate && dateRange.endDate ? (
                <span>
                  {dateRange.startDate.toLocaleDateString()} - {dateRange.endDate.toLocaleDateString()}
                </span>
              ) : (
                <span>{dateRange.label}</span>
              )}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {dateRanges.map(range => (
              <button
                key={range.value}
                onClick={() => handleDateRangeChange(range.value)}
                className={`text-sm px-3 py-1.5 rounded-md transition-colors ${
                  dateRange.label === range.label 
                    ? 'bg-orange-100 text-orange-700 font-medium' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </motion.div>
        
        {/* Stats Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon={<CreditCard className="h-6 w-6" />}
            title="Suma wszystkich darowizn"
            value={formatCurrency(stats.totalDonations)}
            delay={0.1}
          />
          <StatCard 
            icon={<Users className="h-6 w-6" />}
            title="Unikalnych darczyńców"
            value={stats.uniqueDonors.toString()}
            delay={0.2}
          />
          <StatCard 
            icon={<Calendar className="h-6 w-6" />}
            title="Suma w wybranym okresie"
            value={formatCurrency(filteredPayments.reduce((sum, p) => sum + p.amount, 0))}
            indicator={stats.growthPercentage > 0 ? 'up' : stats.growthPercentage < 0 ? 'down' : undefined}
            delay={0.3}
          />
          <StatCard 
            icon={<TrendingUp className="h-6 w-6" />}
            title="Liczba transakcji"
            value={stats.allTransactionsCount.toString()}
            delay={0.4}
          />
        </div>
        
        {/* Donations Overview - Detailed Statistics */}
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
                  Porównanie miesięczne {dateRange.label !== 'Wszystkie' ? `(${dateRange.label})` : ''}
                </h3>
                <div className="flex items-end space-x-2 h-40 mb-3">
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-full bg-gray-200 rounded-t-sm relative" style={{ 
                      height: `${stats.previousMonthAmount ? '100%' : '5%'}`,
                      minHeight: '4px'
                    }}>
                      <div className="absolute inset-0 bg-gray-400 rounded-t-sm"></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Poprzedni</p>
                    <p className="text-sm font-medium">{formatCurrency(stats.previousMonthAmount)}</p>
                  </div>
                  
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-full bg-gray-200 rounded-t-sm relative" style={{ 
                      height: `${stats.previousMonthAmount ? 
                        Math.min(100, Math.max(5, (stats.currentMonthAmount / stats.previousMonthAmount) * 100)) + '%' 
                        : '5%'}`,
                      minHeight: '4px'
                    }}>
                      <div className="absolute inset-0 bg-orange-500 rounded-t-sm"></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Bieżący</p>
                    <p className="text-sm font-medium">{formatCurrency(stats.currentMonthAmount)}</p>
                  </div>
                  
                  <div className="flex flex-col items-center flex-1">
                    <div className="w-full bg-gray-200 rounded-t-sm relative" style={{ 
                      height: `${stats.previousMonthAmount ? 
                        Math.min(100, Math.max(5, (stats.last30DaysAmount / stats.previousMonthAmount) * 100)) + '%' 
                        : '5%'}`,
                      minHeight: '4px'
                    }}>
                      <div className="absolute inset-0 bg-amber-400 rounded-t-sm"></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Ostatnie 30 dni</p>
                    <p className="text-sm font-medium">{formatCurrency(stats.last30DaysAmount)}</p>
                  </div>
                </div>
              </div>
              
              {/* Stats highlights */}
              <div className="rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 p-5 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-medium text-orange-700 mb-4">
                    Kluczowe wskaźniki {dateRange.label !== 'Wszystkie' ? `(${dateRange.label})` : ''}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Liczba transakcji:</span>
                      <span className="font-medium text-gray-900">{stats.allTransactionsCount}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Zrealizowane darowizny:</span>
                      <span className="font-medium text-gray-900">{stats.donationsCount}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Średnia darowizna:</span>
                      <span className="font-medium text-gray-900">
                        {stats.donationsCount ? formatCurrency(stats.totalDonations / stats.donationsCount) : "0 PLN"}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Unikalnych darczyńców:</span>
                      <span className="font-medium text-gray-900">{stats.uniqueDonors}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-orange-100">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-orange-700">Miesięczny wzrost:</span>
                    <span className={`font-medium flex items-center ${stats.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {stats.growthPercentage >= 0 ? (
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                      )}
                      {Math.abs(stats.growthPercentage).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Recent Donations - Updated to use filtered payments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Clock className="h-6 w-6 text-amber-500 mr-2" />
                <h2 className="text-xl font-bold tracking-tight text-black">
                  {dateRange.label !== 'Wszystkie' 
                    ? `Darowizny: ${dateRange.label}` 
                    : 'Ostatnie darowizny'}
                </h2>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">
                  Pokazuje {Math.min(filteredPayments.length, 5)} z {filteredPayments.length} transakcji
                </span>
                <button
                  onClick={() => {}} // To be implemented with full donor history
                  className="px-4 py-2 text-sm rounded-lg text-orange-600 hover:bg-orange-50 transition-colors"
                >
                  Zobacz wszystkie
                </button>
              </div>
            </div>
            
            {filteredPayments.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <Heart className="h-12 w-12 text-orange-300 mx-auto mb-3 opacity-50" />
                <p className="text-gray-600 font-medium">Brak darowizn w wybranym okresie</p>
                <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
                  Spróbuj wybrać inny zakres dat lub sprawdź, czy Twój profil jest udostępniony.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kwota
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Od
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Wiadomość
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredPayments.slice(0, 5).map((payment, index) => (
                      <motion.tr 
                        key={payment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
                        className="hover:bg-orange-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {payment.payer_name || 'Anonim'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : payment.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {payment.status === 'completed' ? 'Zakończona' : 
                             payment.status === 'pending' ? 'Oczekująca' : payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">
                          {payment.message || '-'}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Placeholder for Top Donors - will be implemented next */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden p-6"
        >
          <div className="flex items-center mb-4">
            <Users className="h-6 w-6 text-amber-500 mr-2" />
            <h2 className="text-xl font-bold tracking-tight text-black">Najhojniejsi darczyńcy</h2>
          </div>
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <p className="text-gray-500">
              Ta funkcja zostanie wkrótce zaimplementowana
            </p>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

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
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../contexts/ProfileContext';
import DashboardLayout from '../../components/DashboardLayout';
import { motion } from 'framer-motion';
import { Database } from '../../lib/database.types';
import { useDonations } from '../../hooks/useDonations';

// Import components
import DonationStats from './components/DonationStats';
import DateRangeFilter from './components/DateRangeFilter';
import DonationsOverview from './components/DonationsOverview';
import TopDonors from './components/TopDonors';
import DonationHistory from './components/DonationHistory';
import PaymentDetailsModal from './components/PaymentDetailsModal';
import DonationGoals from './components/DonationGoals';

// Define the type for payments
type Payment = Database['public']['Tables']['payments']['Row'];

export default function Donations() {
  console.log('Donations component rendering');
  const { user } = useAuth();
  const { profile, loading: profileLoading, loadProfile } = useProfile();
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  
  // Debug user info
  useEffect(() => {
    console.log('User auth state:', { userId: user?.id, isLoggedIn: !!user });
    console.log('Profile state:', { 
      profileLoaded: !!profile, 
      loading: profileLoading,
      username: profile?.username
    });
  }, [user, profile, profileLoading]);
  
  const {
    payments,
    topDonors,
    donorVisibilitySettings,
    anonymousDonations,
    filteredPayments,
    stats,
    loading,
    dateRange,
    handleDateRangeChange,
    formatCurrency,
    loadPaymentsAndTopDonors,
  } = useDonations(user?.id);
  
  // Debug donations data
  useEffect(() => {
    console.log('Donations data state from hook:', {
      paymentsLoaded: payments?.length > 0,
      paymentsCount: payments?.length,
      topDonorsLoaded: topDonors?.length > 0,
      filteredPaymentsCount: filteredPayments?.length,
      statsLoaded: stats.totalAmount > 0 || stats.uniqueDonors > 0,
      loading,
      stats
    });
  }, [payments, topDonors, filteredPayments, stats, loading]);
  
  // If profile is loaded but we don't have payments data, try to refresh
  useEffect(() => {
    // Only attempt to reload data once to prevent infinite loops
    const shouldReload = 
      user && 
      profile && 
      !loading && 
      !profileLoading && 
      payments.length === 0 && 
      stats.totalAmount === 0;
      
    if (shouldReload) {
      console.log('No payments data found, triggering data reload');
      loadPaymentsAndTopDonors();
    }
  }, [user, profile, loading, profileLoading, payments, stats]);
  
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
  
  // Check if we need to show a fallback for no data
  const hasData = !!stats && (stats.totalAmount > 0 || stats.uniqueDonors > 0 || stats.totalCount > 0);
  
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
          {!hasData && (
            <div className="mt-4 bg-amber-50 text-amber-700 p-4 rounded-lg">
              <p className="font-medium">Brak danych</p>
              <p className="text-sm">Nie znaleziono żadnych darowizn dla Twojego konta. Gdy otrzymasz wsparcie, tutaj pojawią się statystyki.</p>
            </div>
          )}
        </motion.div>
        
        {/* Date Range Filter */}
        <DateRangeFilter 
          dateRange={dateRange}
          onDateRangeChange={handleDateRangeChange}
        />
        
        {/* Stats Overview */}
        <DonationStats 
          totalAmount={stats.totalAmount || 0}
          uniqueDonors={stats.uniqueDonors || 0}
          periodAmount={filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0)}
          transactionCount={stats.totalCount || 0}
          formatCurrency={formatCurrency}
          lastMonthAmount={stats.lastMonthAmount || 0}
        />
        
        {/* Donation Goals */}
        <DonationGoals
          userId={user?.id || ''}
          formatCurrency={formatCurrency}
        />
        
        {/* Donations Overview */}
        <DonationsOverview 
          totalAmount={stats.totalAmount || 0}
          lastMonthAmount={stats.lastMonthAmount || 0}
          transactionCount={stats.totalCount || 0}
          uniqueDonors={stats.uniqueDonors || 0}
          formatCurrency={formatCurrency}
          dateRangeLabel={dateRange.label}
        />
        
        {/* Top Donors */}
        <TopDonors 
          topDonors={topDonors || []}
          donorVisibilitySettings={donorVisibilitySettings}
          formatCurrency={formatCurrency}
          userId={user?.id || ''}
          onSettingsUpdated={loadPaymentsAndTopDonors}
          anonymousDonations={anonymousDonations}
        />
        
        {/* Donation History */}
        <DonationHistory 
          payments={payments || []}
          filteredPayments={filteredPayments || []}
          dateRangeLabel={dateRange.label}
          formatCurrency={formatCurrency}
          smallCoffeeAmount={profile?.small_coffee_amount || 1500}
          mediumCoffeeAmount={profile?.medium_coffee_amount || 5000}
          onSelectPayment={setSelectedPayment}
          onDateRangeChange={handleDateRangeChange}
        />
        
        {/* Payment Details Modal */}
        <PaymentDetailsModal 
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          formatCurrency={formatCurrency}
        />
      </div>
    </DashboardLayout>
  );
} 
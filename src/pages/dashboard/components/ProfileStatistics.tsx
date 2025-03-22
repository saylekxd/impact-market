import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProfile } from '../../../contexts/ProfileContext';
import { usePayments } from '../../../contexts/PaymentsContext';
import { usePayouts } from '../../../contexts/PayoutContext';
import { useNavigate } from 'react-router-dom';
import { CreditCard, TrendingUp, Bell, ExternalLink, Clock, Download, ArrowRight, ChevronUp, ChevronDown, Info } from 'lucide-react';

interface ProfileStats {
  totalReceived: number;
  totalWithdrawn: number;
  pendingWithdrawals: number;
  recentDonors: string[];
  currentMonthDonations: number;
  previousMonthDonations: number;
  monthlyGrowth: number;
  last7DaysDonations: number;
  donorCount: number;
}

export default function ProfileStatistics() {
  const { profile } = useProfile();
  const { payments } = usePayments();
  const { payouts, loadPayouts } = usePayouts();
  const navigate = useNavigate();
  const [stats, setStats] = useState<ProfileStats>({
    totalReceived: 0,
    totalWithdrawn: 0,
    pendingWithdrawals: 0,
    recentDonors: [],
    currentMonthDonations: 0,
    previousMonthDonations: 0,
    monthlyGrowth: 0,
    last7DaysDonations: 0,
    donorCount: 0,
  });
  
  // Note: This is a placeholder for the actual notification system
  // A full implementation would include an API for fetching notifications
  const [hasNotifications] = useState(true);
  
  useEffect(() => {
    // Calculate various statistics from payments and payouts
    const calculateStats = () => {
      // Prepare date references
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      const last7DaysStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      // Filter payments by status
      const completedPayments = payments.filter(p => p.status === 'completed');
      
      // Total received from all completed payments
      const totalReceived = completedPayments.reduce((sum, p) => sum + p.amount, 0);
      
      // Current month donations
      const currentMonthDonations = completedPayments
        .filter(p => new Date(p.created_at) >= currentMonthStart)
        .reduce((sum, p) => sum + p.amount, 0);
      
      // Previous month donations
      const previousMonthDonations = completedPayments
        .filter(p => {
          const date = new Date(p.created_at);
          return date >= previousMonthStart && date <= previousMonthEnd;
        })
        .reduce((sum, p) => sum + p.amount, 0);
      
      // Calculate monthly growth percentage
      const monthlyGrowth = previousMonthDonations === 0 
        ? 100 
        : ((currentMonthDonations - previousMonthDonations) / previousMonthDonations) * 100;
      
      // Last 7 days donations
      const last7DaysDonations = completedPayments
        .filter(p => new Date(p.created_at) >= last7DaysStart)
        .reduce((sum, p) => sum + p.amount, 0);
      
      // Total withdrawn from all completed payouts
      const totalWithdrawn = payouts
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0);
        
      // Amount in pending withdrawals
      const pendingWithdrawals = payouts
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0);
      
      // Count unique donors (by email)
      const uniqueDonors = new Set(completedPayments
        .filter(p => p.payer_email)
        .map(p => p.payer_email));
      
      // Get recent unique donors (by name)
      const recentDonorNames = [...new Set(completedPayments
        .filter(p => p.payer_name)
        .map(p => p.payer_name))]
        .filter((name): name is string => name !== null)
        .slice(0, 3);
      
      setStats({
        totalReceived,
        totalWithdrawn,
        pendingWithdrawals,
        recentDonors: recentDonorNames,
        currentMonthDonations,
        previousMonthDonations,
        monthlyGrowth,
        last7DaysDonations,
        donorCount: uniqueDonors.size,
      });
    };
    
    calculateStats();
    loadPayouts();
  }, [payments, payouts, loadPayouts]);
  
  if (!profile) return null;
  
  // Format amount to PLN
  const formatAmount = (amount: number) => `${(amount / 100).toFixed(2)} PLN`;
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
      <div className="p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-900">Statystyki profilu</h2>
          <div className="flex space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md flex items-center"
              onClick={() => navigate('/dashboard/withdraws')}
            >
              <CreditCard className="h-3.5 w-3.5 mr-1.5" />
              Wypłaty
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-md flex items-center"
              onClick={() => navigate('/dashboard/donations')}
            >
              <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
              Darowizny
            </motion.button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Financial Statistics */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-50 p-4 rounded-lg"
          >
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <CreditCard className="h-4 w-4 mr-1.5 text-gray-500" />
              Finanse
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Otrzymane wsparcie:</span>
                <span className="font-medium">{formatAmount(stats.totalReceived)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Wypłacono:</span>
                <span className="font-medium">{formatAmount(stats.totalWithdrawn)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Oczekujące wypłaty:</span>
                <span className="font-medium">{formatAmount(stats.pendingWithdrawals)}</span>
              </div>
              
              <div className="flex justify-between pt-1 border-t border-gray-200 mt-1">
                <span className="text-gray-600">Dostępne środki:</span>
                <span className="font-medium text-black">{formatAmount(profile.available_balance)}</span>
              </div>
            </div>
            
            {/* Quick action button */}
            {profile.available_balance > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-3 text-xs w-full py-1.5 bg-black text-white rounded-md flex items-center justify-center"
                onClick={() => navigate('/finances')}
              >
                <Download className="h-3.5 w-3.5 mr-1.5" />
                Wypłać środki
              </motion.button>
            )}
          </motion.div>
          
          {/* Time-based Donation Statistics */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-gray-50 p-4 rounded-lg"
          >
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1.5 text-gray-500" />
              Darowizny
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Ostatnie 7 dni:</span>
                <span className="font-medium">{formatAmount(stats.last7DaysDonations)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Bieżący miesiąc:</span>
                <span className="font-medium">{formatAmount(stats.currentMonthDonations)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Poprzedni miesiąc:</span>
                <span className="font-medium">{formatAmount(stats.previousMonthDonations)}</span>
              </div>
              
              <div className="flex justify-between items-center pt-1 border-t border-gray-200 mt-1">
                <span className="text-gray-600">Zmiana miesięczna:</span>
                <span className={`font-medium flex items-center ${
                  stats.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-500'
                }`}>
                  {stats.monthlyGrowth >= 0 ? 
                    <ChevronUp className="h-3 w-3 mr-0.5" /> : 
                    <ChevronDown className="h-3 w-3 mr-0.5" />
                  }
                  {Math.abs(stats.monthlyGrowth).toFixed(1)}%
                </span>
              </div>
              
              <div className="flex justify-between items-center pt-1 border-t border-gray-200 mt-1">
                <span className="text-gray-600">Liczba wspierających:</span>
                <span className="font-medium">{stats.donorCount}</span>
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Recent Activity - Simplified since notification center isn't ready */}
        {stats.recentDonors.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Clock className="h-4 w-4 mr-1.5 text-gray-500" />
              Ostatni wspierający
            </h3>
            <div className="flex flex-wrap gap-2">
              {stats.recentDonors.map((donor, index) => (
                <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  {donor}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Notification placeholder */}
        {hasNotifications && (
          <div className="mb-2 pb-2 pt-1 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100">
            <div className="flex items-center">
              <Bell className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
              Masz nieprzeczytane powiadomienia
            </div>
            <button 
              className="text-xs flex items-center text-[#FF8C3B] hover:underline"
              onClick={() => navigate('/dashboard/notifications')}
            >
              Zobacz powiadomienia
              <ArrowRight className="h-3 w-3 ml-1" />
            </button>
          </div>
        )}
        
     
      </div>
    </div>
  );
} 
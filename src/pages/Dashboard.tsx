import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import { usePayments } from '../contexts/PaymentsContext';
import { auth } from '../lib/auth';
import { toast } from 'react-hot-toast';

import Sidebar from './dashboard/components/Sidebar';
import DashboardStats from './dashboard/components/DashboardStats';
import ProfileSection from './dashboard/components/ProfileSection';
import ProfileForm from './dashboard/components/ProfileForm';
import PaymentHistory from './dashboard/components/PaymentHistory';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading, loadProfile, updateProfile } = useProfile();
  const { payments, loading: paymentsLoading, loadPayments } = usePayments();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    avatar_url: '',
  });

  const [stats, setStats] = useState({
    totalAmount: 0,
    donorsCount: 0,
    lastMonthAmount: 0,
    currentMonthAmount: 0,
    monthlyGrowth: 0,
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadProfile();
    loadPayments();
  }, [user, navigate, loadProfile, loadPayments]);

  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    if (payments.length > 0) {
      const now = new Date();
      
      // Current month range (1st of current month to now)
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Last month range (1st to last day of previous month)
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      
      // Two months ago range
      const twoMonthsAgoStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const twoMonthsAgoEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0);

      const uniqueDonors = new Set(payments.map(p => p.payer_email || p.payer_name)).size;
      
      // Current month payments
      const currentMonthPayments = payments.filter(p => {
        const date = new Date(p.created_at);
        return date >= currentMonthStart && date <= now;
      });

      // Last month payments
      const lastMonthPayments = payments.filter(p => {
        const date = new Date(p.created_at);
        return date >= lastMonthStart && date <= lastMonthEnd;
      });

      // Two months ago payments
      const twoMonthsAgoPayments = payments.filter(p => {
        const date = new Date(p.created_at);
        return date >= twoMonthsAgoStart && date <= twoMonthsAgoEnd;
      });

      const currentMonthAmount = currentMonthPayments.reduce((sum, p) => sum + p.amount, 0);
      const lastMonthAmount = lastMonthPayments.reduce((sum, p) => sum + p.amount, 0);
      const twoMonthsAgoAmount = twoMonthsAgoPayments.reduce((sum, p) => sum + p.amount, 0);
      
      const monthlyGrowth = twoMonthsAgoAmount === 0 ? 100 : 
        ((lastMonthAmount - twoMonthsAgoAmount) / twoMonthsAgoAmount) * 100;

      // Calculate total amount from all payments
      const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

      setStats({
        totalAmount,
        donorsCount: uniqueDonors,
        lastMonthAmount,
        currentMonthAmount,
        monthlyGrowth,
      });
    }
  }, [payments]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const success = await updateProfile(formData);
    if (success) {
      setEditing(false);
    }
  };

  const handleLogout = async () => {
    const result = await auth.logout();
    if (result.success) {
      navigate('/login');
    } else {
      toast.error(result.error || 'Wystąpił błąd podczas wylogowywania');
    }
  };

  if (profileLoading || paymentsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xl text-gray-600">Ładowanie...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar onLogout={handleLogout} />
        
        <div className="flex-1 overflow-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <DashboardStats {...stats} />

              <ProfileSection
                onEdit={() => setEditing(!editing)}
                editing={editing}
              />

              {editing && (
                <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
                  <div className="px-6 py-8">
                    <ProfileForm
                      formData={formData}
                      onChange={setFormData}
                      onSubmit={handleUpdateProfile}
                    />
                  </div>
                </div>
              )}

              <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Historia wpłat</h2>
                  <PaymentHistory payments={payments} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePayments } from '../contexts/PaymentsContext';
import { toast } from 'react-hot-toast';
import { profiles } from '../lib/profiles';
import type { Profile } from '../lib/profiles';
import { TrendingUp, Users, CreditCard, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import ProfileForm from './dashboard/components/ProfileForm';
import ProfileSection from './dashboard/components/ProfileSection';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { payments, loading: paymentsLoading } = usePayments();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [stats, setStats] = useState({
    totalAmount: 0,
    donorsCount: 0,
    lastMonthAmount: 0,
    monthlyGrowth: 0,
  });
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    avatar_url: '',
    small_coffee_amount: 500,
    medium_coffee_amount: 1000,
    large_coffee_amount: 2000,
    small_icon: 'coffee',
    medium_icon: 'coffee',
    large_icon: 'coffee',
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function loadData() {
      try {
        // Load profile
        const profileResult = await profiles.getById(user?.id || '');
        if (!profileResult.success) {
          throw new Error(profileResult.error);
        }
        
        if (profileResult.data) {
          setProfile(profileResult.data);
          setFormData({
            display_name: profileResult.data?.display_name || '',
            bio: profileResult.data?.bio || '',
            avatar_url: profileResult.data?.avatar_url || '',
            small_coffee_amount: profileResult.data?.small_coffee_amount || 500,
            medium_coffee_amount: profileResult.data?.medium_coffee_amount || 1000,
            large_coffee_amount: profileResult.data?.large_coffee_amount || 2000,
            small_icon: profileResult.data?.small_icon || 'coffee',
            medium_icon: profileResult.data?.medium_icon || 'coffee',
            large_icon: profileResult.data?.large_icon || 'coffee',
          });
        }

        // Calculate statistics
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);

        const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
        const totalPaymentsCount = payments.length;
        const lastMonthPayments = payments.filter(p => new Date(p.created_at) >= lastMonth);
        const previousMonthPayments = payments.filter(p => 
          new Date(p.created_at) >= twoMonthsAgo && new Date(p.created_at) < lastMonth
        );

        const lastMonthAmount = lastMonthPayments.reduce((sum, p) => sum + p.amount, 0);
        const previousMonthAmount = previousMonthPayments.reduce((sum, p) => sum + p.amount, 0);
        const monthlyGrowth = previousMonthAmount === 0 ? 100 : 
          ((lastMonthAmount - previousMonthAmount) / previousMonthAmount) * 100;

        setStats({
          totalAmount,
          donorsCount: totalPaymentsCount,
          lastMonthAmount,
          monthlyGrowth,
        });

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Błąd podczas ładowania danych';
        toast.error(errorMessage);
        if (!profile) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user, navigate, payments]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const updatedProfileData = {
        display_name: formData.display_name,
        bio: formData.bio,
        avatar_url: formData.avatar_url,
        small_coffee_amount: formData.small_coffee_amount,
        medium_coffee_amount: formData.medium_coffee_amount,
        large_coffee_amount: formData.large_coffee_amount,
        small_icon: formData.small_icon,
        medium_icon: formData.medium_icon,
        large_icon: formData.large_icon,
      };
      
      const result = await profiles.update(user.id, updatedProfileData);
      
      if (result.success && result.data) {
        setProfile(result.data);
        setEditing(false);
        toast.success('Profil został zaktualizowany');
        
        // Force the UI to refresh with the new data
        setFormData({
          display_name: result.data.display_name || '',
          bio: result.data.bio || '',
          avatar_url: result.data.avatar_url || '',
          small_coffee_amount: result.data.small_coffee_amount || 500,
          medium_coffee_amount: result.data.medium_coffee_amount || 1000,
          large_coffee_amount: result.data.large_coffee_amount || 2000,
          small_icon: result.data.small_icon || 'coffee',
          medium_icon: result.data.medium_icon || 'coffee',
          large_icon: result.data.large_icon || 'coffee',
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Błąd podczas aktualizacji profilu';
      toast.error(errorMessage);
    }
  };

  if (loading || paymentsLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="h-12 w-12 rounded-full border-2 border-black border-t-transparent animate-spin"></div>
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
          <h1 className="text-2xl font-bold text-black">Panel twórcy</h1>
          <p className="mt-1 text-gray-500">
            Witaj, {profile?.username || ''}! Oto przegląd Twojego profilu i wsparcia.
          </p>
        </motion.div>

        {/* Statystyki */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <StatCard 
            icon={<TrendingUp className="h-6 w-6" />}
            title="Łączne wsparcie"
            value={`${(stats.totalAmount / 100).toFixed(2)} PLN`}
            delay={0}
          />
          
          <StatCard 
            icon={<Users className="h-6 w-6" />}
            title="Liczba wspierających"
            value={stats.donorsCount.toString()}
            delay={0.1}
          />
          
          <StatCard 
            icon={<CreditCard className="h-6 w-6" />}
            title="Ostatni miesiąc"
            value={`${(stats.lastMonthAmount / 100).toFixed(2)} PLN`}
            delay={0.2}
          />
          
          <StatCard 
            icon={<Calendar className="h-6 w-6" />}
            title="Wzrost miesięczny"
            value={`${stats.monthlyGrowth.toFixed(1)}%`}
            indicator={stats.monthlyGrowth >= 0 ? 'up' : 'down'}
            delay={0.3}
          />
        </motion.div>

        {/* Profil */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="p-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold tracking-tight text-black">Twój profil</h2>
              <button
                onClick={() => setEditing(!editing)}
                className="px-4 py-2 rounded-lg bg-black text-white hover:bg-black/80 transition-colors"
              >
                {editing ? 'Anuluj' : 'Edytuj profil'}
              </button>
            </div>

            {editing ? (
              <ProfileForm 
                formData={formData}
                onChange={setFormData}
                onSubmit={handleUpdateProfile}
              />
            ) : (
              <ProfileSection 
                onEdit={() => setEditing(true)}
              />
            )}
          </div>
        </motion.div>

        {/* Historia wpłat */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="p-6">
            <h2 className="text-xl font-bold tracking-tight text-black mb-6">Historia wpłat</h2>
            {payments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 font-medium">Brak wpłat</p>
                <p className="text-sm text-gray-400 mt-2">
                  Udostępnij swój profil, aby zacząć otrzymywać wsparcie
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
                        Wiadomość
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payments.map((payment, index) => (
                      <motion.tr 
                        key={payment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 + (index * 0.05) }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {(payment.amount / 100).toFixed(2)} PLN
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.payer_name || 'Anonim'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
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
      </div>
    </DashboardLayout>
  );
}

// StatCard component for the dashboard statistics
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
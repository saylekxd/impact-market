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
        <div className="text-center">
          <p className="text-xl text-gray-600">Ładowanie...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Panel twórcy</h1>
          <p className="mt-1 text-sm text-gray-500">
            Witaj, {profile?.display_name}! Oto przegląd Twojego profilu i wsparcia.
          </p>
        </div>

        {/* Statystyki */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Łączne wsparcie
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {(stats.totalAmount / 100).toFixed(2)} PLN
                      </div>
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
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.donorsCount}
                      </div>
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
                  <CreditCard className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Ostatni miesiąc
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {(stats.lastMonthAmount / 100).toFixed(2)} PLN
                      </div>
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
                      Wzrost miesięczny
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stats.monthlyGrowth.toFixed(1)}%
                      </div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                        stats.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stats.monthlyGrowth >= 0 ? (
                          <ArrowUpRight className="self-center flex-shrink-0 h-4 w-4" />
                        ) : (
                          <ArrowDownRight className="self-center flex-shrink-0 h-4 w-4" />
                        )}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profil */}
        <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
          <div className="px-6 py-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Twój profil</h2>
              <button
                onClick={() => setEditing(!editing)}
                className="text-blue-600 hover:text-blue-500"
              >
                {editing ? 'Anuluj' : 'Edytuj'}
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
                editing={editing}
              />
            )}
          </div>
        </div>

        {/* Historia wpłat */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Historia wpłat</h2>
            {payments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Brak wpłat</p>
                <p className="text-sm text-gray-400 mt-2">
                  Udostępnij swój profil, aby zacząć otrzymywać wsparcie
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kwota
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Od
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Wiadomość
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {(payment.amount / 100).toFixed(2)} PLN
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.payer_name || 'Anonim'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {payment.message || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
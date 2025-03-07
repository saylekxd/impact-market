import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePayments } from '../contexts/PaymentsContext';
import { toast } from 'react-hot-toast';
import { profiles } from '../lib/profiles';
import type { Profile } from '../lib/profiles';
import { TrendingUp, Users, CreditCard, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

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
  }, [user, navigate, profile, payments]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const result = await profiles.update(user.id, formData);
      
      if (result.success && result.data) {
        setProfile(result.data);
        setEditing(false);
        toast.success('Profil został zaktualizowany');
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
              <form onSubmit={handleUpdateProfile} className="mt-6 space-y-6">
                <div>
                  <label htmlFor="display_name" className="block text-sm font-medium text-gray-700">
                    Wyświetlana nazwa
                  </label>
                  <input
                    type="text"
                    id="display_name"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700">
                    URL avatara
                  </label>
                  <input
                    type="url"
                    id="avatar_url"
                    value={formData.avatar_url}
                    onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Zapisz zmiany
                </button>
              </form>
            ) : (
              <div className="mt-6 space-y-4">
                <div className="flex items-center">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name || ''}
                      className="h-20 w-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600">
                        {profile?.display_name?.[0]}
                      </span>
                    </div>
                  )}
                  <div className="ml-6">
                    <h3 className="text-lg font-medium text-gray-900">{profile?.display_name}</h3>
                    <p className="text-sm text-gray-500">@{profile?.username}</p>
                  </div>
                </div>
                <p className="text-gray-600">{profile?.bio || 'Brak opisu'}</p>
                <p className="text-sm text-gray-500">
                  Link do profilu:{' '}
                  <a
                    href={`/${profile?.username}`}
                    className="text-blue-600 hover:text-blue-500"
                  >
                    {window.location.origin}/{profile?.username}
                  </a>
                </p>
              </div>
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
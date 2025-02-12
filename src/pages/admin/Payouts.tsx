import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import type { Payout } from '../../lib/payouts';

export default function AdminPayouts() {
  const { user } = useAuth();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayouts();
  }, []);

  const loadPayouts = async () => {
    try {
      const { data, error } = await supabase
        .from('payouts')
        .select(`
          *,
          profiles (username, display_name),
          bank_accounts (account_number, bank_name, swift_code)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPayouts(data || []);
    } catch (error: any) {
      toast.error('Nie udało się załadować listy wypłat');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayout = async (payoutId: string) => {
    try {
      const { error } = await supabase
        .from('payouts')
        .update({
          status: 'completed',
          processed_at: new Date().toISOString(),
          admin_id: user?.id,
        })
        .eq('id', payoutId);

      if (error) throw error;

      await supabase
        .from('payout_logs')
        .insert({
          payout_id: payoutId,
          action: 'approve',
          performed_by: user?.id,
          details: { status: 'completed' },
        });

      toast.success('Wypłata została zatwierdzona');
      loadPayouts();
    } catch (error: any) {
      toast.error('Nie udało się zatwierdzić wypłaty');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p>Ładowanie...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Oczekujące wypłaty</h1>

      {payouts.length === 0 ? (
        <p className="text-gray-500">Brak oczekujących wypłat</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Twórca
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kwota
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dane bankowe
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payouts.map((payout) => (
                <tr key={payout.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(payout.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payout.profiles.display_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      @{payout.profiles.username}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(payout.amount / 100).toFixed(2)} PLN
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {payout.bank_accounts.bank_name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {payout.bank_accounts.account_number}
                    </div>
                    <div className="text-sm text-gray-500">
                      SWIFT: {payout.bank_accounts.swift_code}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleApprovePayout(payout.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Zatwierdź wypłatę
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
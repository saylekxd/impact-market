import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useProfile } from '../contexts/ProfileContext';
import { usePayouts } from '../contexts/PayoutContext';
import { usePayments } from '../contexts/PaymentsContext';
import BankAccountForm from '../components/BankAccountForm';
import PayoutHistory from '../components/PayoutHistory';
import PayoutRequest from '../components/PayoutRequest';
import { Wallet, CreditCard, Clock } from 'lucide-react';

export default function Finances() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading, loadProfile } = useProfile();
  const { payments, loading: paymentsLoading, loadPayments } = usePayments();
  const {
    bankAccount,
    payouts,
    loading: payoutsLoading,
    loadBankAccount,
    loadPayouts,
  } = usePayouts();

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount / 100);
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    loadProfile();
    loadBankAccount();
    loadPayouts();
    loadPayments();
  }, [user, navigate, loadProfile, loadBankAccount, loadPayouts, loadPayments]);

  // Debug logs
  console.log('All payments:', payments);
  console.log('All payouts:', payouts);

  // Calculate total amount from all payments that are not pending or failed
  const totalAmount = payments?.reduce((sum, payment) => {
    console.log('Payment:', { amount: payment.amount, status: payment.status });
    // Include all payments that are not failed
    return payment.status !== 'failed' ? sum + payment.amount : sum;
  }, 0) || 0;

  console.log('Total amount calculated:', totalAmount);

  // Calculate sum of all completed and pending payouts
  const allPayouts = payouts?.reduce((sum, payout) => {
    console.log('Payout:', { amount: payout.amount, status: payout.status });
    // Include both completed and pending payouts
    return (payout.status === 'completed' || payout.status === 'pending') ? sum + payout.amount : sum;
  }, 0) || 0;

  console.log('All payouts:', allPayouts);

  // Available balance is total amount minus all payouts (both completed and pending)
  const availableBalance = totalAmount - allPayouts;
  console.log('Available balance:', availableBalance);

  if (profileLoading || payoutsLoading || paymentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Ładowanie...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Nie udało się załadować profilu</p>
      </div>
    );
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Finanse</h1>

        {/* Statystyki */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Wallet className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Dostępne środki
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {formatAmount(availableBalance)}
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
                  <Clock className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Oczekujące wypłaty
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {payouts.filter(p => p.status === 'pending').length}
                    </dd>
                    <dd className="text-sm text-gray-500">
                      {formatAmount(payouts.reduce((sum, p) => p.status === 'pending' ? sum + p.amount : sum, 0))}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Dane bankowe */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Dane bankowe
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Podaj dane konta bankowego, na które będą realizowane wypłaty
              </p>
            </div>
            <div className="px-6 py-5">
              <BankAccountForm />
            </div>
          </div>

          {/* Wypłata środków */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                Wypłata środków
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Złóż wniosek o wypłatę dostępnych środków
              </p>
            </div>
            <div className="px-6 py-5">
              {bankAccount ? (
                <PayoutRequest
                  availableBalance={availableBalance}
                />
              ) : (
                <p className="text-sm text-gray-500">
                  Aby wypłacić środki, najpierw dodaj dane bankowe
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Historia wypłat */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Historia wypłat
            </h3>
          </div>
          <div className="px-6 py-5">
            {payouts.length > 0 ? (
              <PayoutHistory payouts={payouts} />
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Brak historii wypłat
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import type { BankAccount, Payout } from '../lib/database.types';

interface PayoutContextType {
  bankAccount: BankAccount | null;
  payouts: Payout[];
  loading: boolean;
  loadBankAccount: () => Promise<void>;
  loadPayouts: () => Promise<void>;
  saveBankAccount: (data: Partial<BankAccount>) => Promise<boolean>;
  requestPayout: (amount: number) => Promise<boolean>;
}

const PayoutContext = createContext<PayoutContextType>({
  bankAccount: null,
  payouts: [],
  loading: false,
  loadBankAccount: async () => {},
  loadPayouts: async () => {},
  saveBankAccount: async () => false,
  requestPayout: async () => false,
});

export function PayoutProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(false);

  const loadBankAccount = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setBankAccount(data);
    } catch (error) {
      console.error('Error loading bank account:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const loadPayouts = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payouts')
        .select(`
          *,
          bank_accounts (
            account_number,
            bank_name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayouts(data || []);
    } catch (error) {
      console.error('Error loading payouts:', error);
      toast.error('Nie udało się załadować historii wypłat');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveBankAccount = useCallback(async (data: Partial<BankAccount>): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data: savedAccount, error } = await supabase
        .from('bank_accounts')
        .upsert({
          user_id: user.id,
          ...data,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      setBankAccount(savedAccount);
      toast.success('Dane bankowe zostały zapisane');
      return true;
    } catch (error) {
      console.error('Error saving bank account:', error);
      toast.error('Nie udało się zapisać danych bankowych');
      return false;
    }
  }, [user]);

  const requestPayout = useCallback(async (amount: number): Promise<boolean> => {
    if (!user || !bankAccount) return false;

    try {
      const { error } = await supabase
        .from('payouts')
        .insert({
          user_id: user.id,
          amount,
          bank_account_id: bankAccount.id,
          status: 'pending',
        });

      if (error) throw error;

      await loadPayouts();
      toast.success('Żądanie wypłaty zostało utworzone');
      return true;
    } catch (error) {
      console.error('Error requesting payout:', error);
      toast.error('Nie udało się utworzyć żądania wypłaty');
      return false;
    }
  }, [user, bankAccount, loadPayouts]);

  return (
    <PayoutContext.Provider value={{
      bankAccount,
      payouts,
      loading,
      loadBankAccount,
      loadPayouts,
      saveBankAccount,
      requestPayout,
    }}>
      {children}
    </PayoutContext.Provider>
  );
}

export const usePayouts = () => useContext(PayoutContext);
import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import type { Database } from '../lib/database.types';

// Define types from the Database interface
type BankAccount = Database['public']['Tables']['bank_accounts']['Row'];
type Payout = Database['public']['Tables']['payouts']['Row'] & {
  bank_accounts?: {
    account_number: string;
    bank_name: string;
  };
};

interface PayoutContextType {
  bankAccount: BankAccount | null;
  payouts: Payout[];
  loading: boolean;
  loadBankAccount: () => Promise<void>;
  loadPayouts: () => Promise<void>;
  saveBankAccount: (data: Partial<BankAccount>) => Promise<boolean>;
  requestPayout: (amount: number, bankAccountId?: string) => Promise<boolean>;
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
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setBankAccount(null);
          return;
        }
        throw error;
      }
      
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
      if (bankAccount) {
        const { data: updatedAccount, error } = await supabase
          .from('bank_accounts')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', bankAccount.id)
          .select()
          .single();

        if (error) throw error;
        setBankAccount(updatedAccount);
      } else {
        const { data: newAccount, error } = await supabase
          .from('bank_accounts')
          .insert({
            user_id: user.id,
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (error) throw error;
        setBankAccount(newAccount);
      }

      toast.success('Dane bankowe zostały zapisane');
      return true;
    } catch (error) {
      console.error('Error saving bank account:', error);
      toast.error('Nie udało się zapisać danych bankowych');
      return false;
    }
  }, [user, bankAccount]);

  const requestPayout = useCallback(async (amount: number, bankAccountId?: string): Promise<boolean> => {
    if (!user) return false;

    // If no specific bank account ID is provided, use the default one
    const effectiveBankAccountId = bankAccountId || bankAccount?.id;
    
    if (!effectiveBankAccountId) {
      toast.error('Brak danych konta bankowego');
      return false;
    }

    try {
      const { error } = await supabase
        .from('payouts')
        .insert({
          user_id: user.id,
          amount,
          bank_account_id: effectiveBankAccountId,
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
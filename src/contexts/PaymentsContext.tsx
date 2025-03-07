import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useProfile } from './ProfileContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import type { Database } from '../lib/database.types';

type Payment = Database['public']['Tables']['payments']['Row'];

interface PaymentsContextType {
  payments: Payment[];
  loading: boolean;
  totalAmount: number;
  loadPayments: () => Promise<void>;
  createPayment: (payment: Partial<Payment>) => Promise<boolean>;
}

const PaymentsContext = createContext<PaymentsContextType>({
  payments: [],
  loading: false,
  totalAmount: 0,
  loadPayments: async () => {},
  createPayment: async () => false,
});

export function PaymentsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { ensureProfile } = useProfile();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);

  const loadPayments = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('Loading payments for user:', user.id);

      // Ensure profile exists first
      const profile = await ensureProfile();
      if (!profile) {
        console.error('Cannot load payments: Profile not available');
        return;
      }

      // Get all payments without status filter
      const { data: payments, error } = await supabase
        .from('payments')
        .select('*')
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate total from all payments
      const calculatedTotal = payments?.reduce((sum, payment) => {
        // Only include completed payments in the total
        return payment.status === 'completed' ? sum + payment.amount : sum;
      }, 0) || 0;

      // Get the profile to see current total_donations
      if (profile.total_donations !== calculatedTotal) {
        // Only update if there's a difference
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ total_donations: calculatedTotal })
          .eq('id', user.id);

        if (updateError) {
          console.error('Error updating total donations:', updateError);
        }
      }

      console.log('All payments:', payments);
      console.log('Calculated total donations:', calculatedTotal);

      setPayments(payments || []);
      setTotalAmount(calculatedTotal);
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Nie udało się załadować historii płatności');
    } finally {
      setLoading(false);
    }
  }, [user, ensureProfile]);

  useEffect(() => {
    if (user) {
      loadPayments();
    } else {
      setPayments([]);
      setTotalAmount(0);
    }
  }, [user, loadPayments]);

  const createPayment = useCallback(async (payment: Partial<Payment>): Promise<boolean> => {
    if (!user) return false;

    try {
      // Ensure profile exists first
      const profile = await ensureProfile();
      if (!profile) {
        toast.error('Nie można utworzyć płatności bez profilu');
        return false;
      }

      const { data, error } = await supabase
        .from('payments')
        .insert({
          ...payment,
          creator_id: user.id,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      console.log('Created payment:', data);
      await loadPayments();
      return true;
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error('Nie udało się utworzyć płatności');
      return false;
    }
  }, [user, ensureProfile, loadPayments]);

  return (
    <PaymentsContext.Provider value={{
      payments,
      loading,
      totalAmount,
      loadPayments,
      createPayment,
    }}>
      {children}
    </PaymentsContext.Provider>
  );
}

export const usePayments = () => useContext(PaymentsContext);
import { supabase } from './supabase';
import { payments } from './payments';
import { Database } from './database.types';

export type Payment = Database['public']['Tables']['payments']['Row'];
export type NewPayment = Omit<Payment, 'id' | 'created_at' | 'status'>;

export interface PaymentResult {
  success: boolean;
  data?: Payment;
  redirectUrl?: string;
  error?: string;
}

export interface PaymentsListResult {
  success: boolean;
  data?: Payment[];
  error?: string;
}

export const donations = {
  /**
   * Utwórz nową donację i zainicjuj transakcję płatności
   */
  async create(payment: NewPayment): Promise<PaymentResult> {
    try {
      // Utwórz wpis w bazie danych
      const { data, error } = await supabase
        .from('payments')
        .insert({
          ...payment,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Nie udało się utworzyć płatności');

      // Zainicjuj transakcję w systemie płatności
      const p24Result = await payments.initializeTransaction(data);
      
      if (p24Result.error) {
        throw new Error(p24Result.error);
      }

      return {
        success: true,
        data,
        redirectUrl: p24Result.data.redirectUrl,
      };
    } catch (error: any) {
      return {
        success: false,
        error: 'Wystąpił błąd podczas przetwarzania płatności',
      };
    }
  },

  /**
   * Pobierz listę donacji dla twórcy
   */
  async getByCreatorId(creatorId: string): Promise<PaymentsListResult> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('creator_id', creatorId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { success: true, data: data || [] };
    } catch (error: any) {
      return {
        success: false,
        error: 'Wystąpił błąd podczas pobierania historii płatności',
      };
    }
  },

  /**
   * Pobierz sumę donacji dla twórcy
   */
  async getTotalByCreatorId(creatorId: string): Promise<{ success: boolean; total?: number; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('amount')
        .eq('creator_id', creatorId)
        .eq('status', 'completed');

      if (error) throw error;

      const total = (data || []).reduce((sum, payment) => sum + payment.amount, 0);
      return { success: true, total };
    } catch (error: any) {
      return {
        success: false,
        error: 'Wystąpił błąd podczas obliczania sumy wpłat',
      };
    }
  },
};
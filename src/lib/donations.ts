import { supabase } from './supabase';
import { payments } from './payments';
import { createCheckoutSession } from './stripe';
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
      // Make sure payment_type is included
      const fullPayment = {
        ...payment,
        payment_type: payment.payment_type || 'stripe', // Default to stripe
      };

      // Utwórz wpis w bazie danych
      const { data, error } = await supabase
        .from('payments')
        .insert({
          ...fullPayment,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Nie udało się utworzyć płatności');

      // Determine which payment processor to use
      let paymentResult;
      
      // Use Stripe as the default payment processor
      if (!data.payment_type || data.payment_type === 'stripe') {
        const checkoutResult = await createCheckoutSession(
          data.id,
          data.amount,
          'PLN',
          data.email,
          data.name,
          data.message
        );
        
        if (checkoutResult.error) {
          throw new Error(checkoutResult.error);
        }
        
        paymentResult = {
          data: {
            redirectUrl: checkoutResult.sessionUrl
          }
        };
      } else {
        // Fallback to the original payment system (P24)
        paymentResult = await payments.initializeTransaction(data);
      }
      
      if (paymentResult.error) {
        throw new Error(paymentResult.error);
      }

      return {
        success: true,
        data,
        redirectUrl: paymentResult.data.redirectUrl,
      };
    } catch (error: unknown) {
      console.error('Payment creation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage || 'Wystąpił błąd podczas przetwarzania płatności',
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage || 'Wystąpił błąd podczas pobierania historii płatności',
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
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage || 'Wystąpił błąd podczas obliczania sumy wpłat',
      };
    }
  },
};
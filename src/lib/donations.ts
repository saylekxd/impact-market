import { supabase } from './supabase';
import { payments } from './payments';
import { createCheckoutSession, testApiConnection } from './stripe';
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
      // First check if payment API is available before creating anything in the database
      const apiStatus = await testApiConnection();
      if (!apiStatus.success) {
        return {
          success: false,
          error: 'Serwis płatności jest obecnie niedostępny. Prosimy spróbować później.'
        };
      }
      
      // Make sure payment_type is included
      const fullPayment = {
        ...payment,
        payment_type: payment.payment_type || 'stripe', // Default to stripe
      };

      // Utwórz wpis w bazie danych
      // We specify `select('id')` to only request the ID, potentially minimizing RLS issues.
      // If this still fails for anon, we might need { returning: 'minimal' } on insert.
      const { data, error } = await supabase
        .from('payments')
        .insert({
          ...fullPayment,
          status: 'pending',
        })
        .select('id') // <--- Request ONLY the ID
        .single();

      if (error) throw error;
      // data might be null if RLS prevents even selecting the ID, but error should be set.
      // Check for data and data.id specifically.
      if (!data?.id) {
         // If error is null but data.id is missing, RLS might be blocking the select('id').
         // Log the specific situation for debugging.
         console.error('Payment insert succeeded but failed to retrieve ID, possibly due to RLS SELECT policy for anon user.', { error });
         throw new Error(error?.message || 'Nie udało się pobrać ID nowej płatności po jej utworzeniu.');
      }

      // Determine which payment processor to use
      let paymentResult;
      
      // Use Stripe as the default payment processor
      if (!fullPayment.payment_type || fullPayment.payment_type === 'stripe') {
        const checkoutResult = await createCheckoutSession(
          data.id,
          fullPayment.amount,
          'PLN',
          fullPayment.payer_email ?? undefined,
          fullPayment.payer_name ?? undefined,
          fullPayment.message ?? undefined
        );
        
        if (checkoutResult.error) {
          // If there was an error with payment processing, delete the database entry to prevent orphaned records
          await supabase
            .from('payments')
            .delete()
            .eq('id', data.id);
            
          throw new Error(typeof checkoutResult.error === 'string' ? checkoutResult.error : 'Stripe Checkout Session Error');
        }
        
        paymentResult = {
          data: {
            redirectUrl: checkoutResult.sessionUrl
          }
        };
      } else {
        // Fallback to the original payment system (P24)
        const paymentDataForP24 = {
          ...fullPayment,
          id: data.id
        };
        paymentResult = await payments.initializeTransaction(paymentDataForP24);
      }
      
      if (paymentResult.error) {
        throw new Error(paymentResult.error);
      }

      return {
        success: true,
        data: {
          ...fullPayment,
          id: data.id,
          status: 'pending',
        } as any,
        redirectUrl: paymentResult.data.redirectUrl,
      };
    } catch (error: unknown) {
      console.error('Payment creation error:', error);
      // Check if error is an object and has a message property
      let errorMessage = 'Unknown error';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error && typeof error.message === 'string') {
        errorMessage = error.message; 
      }
      // Fallback message if needed
      const finalErrorMessage = errorMessage || 'Wystąpił błąd podczas przetwarzania płatności';
      
      return {
        success: false,
        error: finalErrorMessage,
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
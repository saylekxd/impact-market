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
   * Create a new donation and initialize payment transaction
   */
  async create(payment: NewPayment): Promise<PaymentResult> {
    try {
      // Create database entry
      const { data, error } = await supabase
        .from('payments')
        .insert({
          ...payment,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create payment');

      // Initialize transaction in payment system
      const p24Result = await payments.initializeTransaction(data);
      
      if (p24Result.error) {
        throw new Error(p24Result.error);
      }

      console.log('Created donation:', data);
      return {
        success: true,
        data,
        redirectUrl: p24Result.data.redirectUrl,
      };
    } catch (error: any) {
      console.error('Error creating donation:', error);
      return {
        success: false,
        error: 'Error processing payment',
      };
    }
  },

  /**
   * Get list of donations for creator
   */
  async getByCreatorId(creatorId: string): Promise<PaymentsListResult> {
    try {
      console.log('Fetching donations for creator:', creatorId);
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('creator_id', creatorId)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching donations:', error);
        throw error;
      }

      console.log('Fetched donations:', data);
      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Error in getByCreatorId:', error);
      return {
        success: false,
        error: 'Error fetching payment history',
      };
    }
  },

  /**
   * Get total donations for creator
   */
  async getTotalByCreatorId(creatorId: string): Promise<{ success: boolean; total?: number; error?: string }> {
    try {
      console.log('Fetching total donations for creator:', creatorId);
      const { data, error } = await supabase
        .from('profiles')
        .select('total_donations')
        .eq('id', creatorId)
        .single();

      if (error) {
        console.error('Error fetching total donations:', error);
        throw error;
      }

      console.log('Total donations:', data?.total_donations);
      return { 
        success: true, 
        total: data?.total_donations || 0 
      };
    } catch (error: any) {
      console.error('Error in getTotalByCreatorId:', error);
      return {
        success: false,
        error: 'Error calculating total donations',
      };
    }
  },
};
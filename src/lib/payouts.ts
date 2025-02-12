import { supabase } from './supabase';
import type { Database } from './database.types';

export type BankAccount = Database['public']['Tables']['bank_accounts']['Row'];
export type Payout = Database['public']['Tables']['payouts']['Row'];
export type PayoutLog = Database['public']['Tables']['payout_logs']['Row'];

export interface BankAccountData {
  account_number: string;
  bank_name: string;
  swift_code: string;
}

export interface PayoutResult {
  success: boolean;
  data?: Payout;
  error?: string;
}

export interface BankAccountResult {
  success: boolean;
  data?: BankAccount;
  error?: string;
}

export const payouts = {
  /**
   * Pobierz dane bankowe użytkownika
   */
  async getBankAccount(userId: string): Promise<BankAccountResult> {
    try {
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching bank account:', error);
        throw error;
      }

      console.log('Bank account data:', data); // Debug log
      return { success: true, data: data || undefined };
    } catch (error: any) {
      console.error('Error in getBankAccount:', error);
      return {
        success: false,
        error: 'Nie udało się pobrać danych bankowych',
      };
    }
  },

  /**
   * Zapisz lub zaktualizuj dane bankowe
   */
  async saveBankAccount(userId: string, bankData: BankAccountData): Promise<BankAccountResult> {
    try {
      const { data: existing } = await supabase
        .from('bank_accounts')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      let result;
      if (existing) {
        result = await supabase
          .from('bank_accounts')
          .update({
            ...bankData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('bank_accounts')
          .insert({
            user_id: userId,
            ...bankData,
          })
          .select()
          .single();
      }

      if (result.error) throw result.error;

      console.log('Saved bank account:', result.data); // Debug log
      return { success: true, data: result.data };
    } catch (error: any) {
      console.error('Error in saveBankAccount:', error);
      return {
        success: false,
        error: 'Nie udało się zapisać danych bankowych',
      };
    }
  },

  /**
   * Zażądaj wypłaty środków
   */
  async requestPayout(userId: string, amount: number): Promise<PayoutResult> {
    try {
      // Sprawdź czy użytkownik ma dane bankowe
      const bankAccount = await this.getBankAccount(userId);
      if (!bankAccount.success || !bankAccount.data) {
        throw new Error('Brak danych bankowych');
      }

      // Sprawdź dostępne środki
      const { data: profile } = await supabase
        .from('profiles')
        .select('available_balance')
        .eq('id', userId)
        .single();

      if (!profile || profile.available_balance < amount) {
        throw new Error('Niewystarczające środki');
      }

      // Utwórz żądanie wypłaty
      const { data, error } = await supabase
        .from('payouts')
        .insert({
          user_id: userId,
          amount,
          bank_account_id: bankAccount.data.id,
          status: 'pending',
        })
        .select()
        .single();

      if (error) throw error;

      // Zaktualizuj dostępne środki
      await supabase
        .from('profiles')
        .update({ available_balance: profile.available_balance - amount })
        .eq('id', userId);

      console.log('Created payout request:', data); // Debug log
      return { success: true, data };
    } catch (error: any) {
      console.error('Error in requestPayout:', error);
      return {
        success: false,
        error: error.message || 'Nie udało się utworzyć żądania wypłaty',
      };
    }
  },

  /**
   * Pobierz historię wypłat
   */
  async getPayoutHistory(userId: string): Promise<PayoutResult[]> {
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
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching payout history:', error);
        throw error;
      }

      console.log('Payout history:', data); // Debug log
      return data.map(payout => ({ success: true, data: payout }));
    } catch (error: any) {
      console.error('Error in getPayoutHistory:', error);
      return [{
        success: false,
        error: 'Nie udało się pobrać historii wypłat',
      }];
    }
  },
};
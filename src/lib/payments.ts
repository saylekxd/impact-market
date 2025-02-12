import { supabase } from './supabase';
import type { Payment } from './database.types';
import CryptoJS from 'crypto-js';

const P24_API_URL = 'https://sandbox.przelewy24.pl';
const P24_MERCHANT_ID = import.meta.env.VITE_P24_MERCHANT_ID;
const P24_API_KEY = import.meta.env.VITE_P24_API_KEY;
const P24_CRC = import.meta.env.VITE_P24_CRC;

interface P24Transaction {
  sessionId: string;
  amount: number;
  currency: string;
  description: string;
  email: string;
  country: string;
  language: string;
  urlReturn: string;
  urlStatus: string;
  sign: string;
}

interface P24Response {
  data: {
    token: string;
    redirectUrl: string;
  };
  error?: string;
}

function generateP24Sign(merchantId: string, sessionId: string, amount: number, currency: string): string {
  const data = `{"sessionId":"${sessionId}","merchantId":${merchantId},"amount":${amount},"currency":"${currency}","crc":"${P24_CRC}"}`;
  return CryptoJS.SHA384(data).toString();
}

export const payments = {
  /**
   * Inicjalizacja transakcji w P24
   */
  async initializeTransaction(payment: Payment): Promise<P24Response> {
    try {
      // W środowisku testowym przekierowujemy do widoku testowego
      if (!P24_MERCHANT_ID || !P24_API_KEY || !P24_CRC) {
        return {
          data: {
            token: 'test_token',
            redirectUrl: `/payment/test?sessionId=${payment.id}`,
          },
        };
      }

      const sign = generateP24Sign(
        P24_MERCHANT_ID,
        payment.id,
        payment.amount,
        payment.currency
      );

      const response = await fetch(`${P24_API_URL}/api/v1/transaction/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${P24_MERCHANT_ID}:${P24_API_KEY}`)}`,
        },
        body: JSON.stringify({
          merchantId: P24_MERCHANT_ID,
          posId: P24_MERCHANT_ID,
          sessionId: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          description: `Wsparcie dla ${payment.creator_id}`,
          email: payment.payer_email || 'anonymous@example.com',
          country: 'PL',
          language: 'pl',
          urlReturn: `${window.location.origin}/payment/success`,
          urlStatus: `${window.location.origin}/api/payment/webhook`,
          sign,
        }),
      });

      const data = await response.json();
      
      if (!data.data?.token) {
        throw new Error(data.error || 'Błąd rejestracji transakcji');
      }

      return {
        data: {
          token: data.data.token,
          redirectUrl: `${P24_API_URL}/trnRequest/${data.data.token}`,
        },
      };
    } catch (error: any) {
      console.error('P24 initialization error:', error);
      return {
        data: {
          token: '',
          redirectUrl: '',
        },
        error: error.message,
      };
    }
  },

  /**
   * Weryfikacja statusu transakcji
   */
  async verifyTransaction(sessionId: string): Promise<boolean> {
    try {
      if (!P24_MERCHANT_ID || !P24_API_KEY) {
        // W trybie testowym zawsze zwracamy sukces
        return true;
      }

      const payment = await supabase
        .from('payments')
        .select('amount, currency')
        .eq('id', sessionId)
        .single();

      if (!payment.data) {
        throw new Error('Payment not found');
      }

      const sign = generateP24Sign(
        P24_MERCHANT_ID,
        sessionId,
        payment.data.amount,
        payment.data.currency
      );

      const response = await fetch(`${P24_API_URL}/api/v1/transaction/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${P24_MERCHANT_ID}:${P24_API_KEY}`)}`,
        },
        body: JSON.stringify({
          merchantId: P24_MERCHANT_ID,
          posId: P24_MERCHANT_ID,
          sessionId,
          amount: payment.data.amount,
          currency: payment.data.currency,
          sign,
        }),
      });

      const data = await response.json();
      return data.data?.status === 'success';
    } catch (error) {
      console.error('P24 verification error:', error);
      return false;
    }
  },

  /**
   * Aktualizacja statusu płatności w bazie danych
   */
  async updatePaymentStatus(paymentId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('payments')
      .update({ status })
      .eq('id', paymentId);

    if (error) throw error;
  },
};
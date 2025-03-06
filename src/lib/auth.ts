import { AuthError, AuthResponse } from '@supabase/supabase-js';
import { supabase } from './supabase';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

export const auth = {
  /**
   * Logowanie użytkownika
   */
  async login({ email, password }: LoginCredentials): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      if (error instanceof AuthError) {
        return {
          success: false,
          error: error.message === 'Invalid login credentials'
            ? 'Nieprawidłowy email lub hasło'
            : 'Wystąpił błąd podczas logowania',
        };
      }
      return { success: false, error: 'Wystąpił nieoczekiwany błąd' };
    }
  },

  /**
   * Rejestracja nowego użytkownika
   */
  async register({ email, password, username }: RegisterCredentials): Promise<AuthResult> {
    try {
      // Sprawdź czy nazwa użytkownika jest dostępna
      const { data: isAvailable, error: checkError } = await supabase.rpc(
        'check_username_available',
        { username: username.toLowerCase() }
      );

      if (checkError) throw checkError;

      if (!isAvailable) {
        return {
          success: false,
          error: 'Ta nazwa użytkownika jest już zajęta',
        };
      }

      // Zarejestruj użytkownika
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        if (signUpError.message === 'User already registered') {
          return {
            success: false,
            error: 'Ten adres email jest już zarejestrowany',
          };
        }
        throw signUpError;
      }

      if (!data.user) {
        throw new Error('Nie udało się utworzyć konta');
      }

      // Utwórz profil użytkownika
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        username: username.toLowerCase(),
        display_name: username,
      });

      if (profileError) throw profileError;

      return { success: true };
    } catch (error) {
      if (error instanceof AuthError) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Wystąpił nieoczekiwany błąd' };
    }
  },

  /**
   * Wylogowanie użytkownika
   */
  async logout(): Promise<AuthResult> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Wystąpił błąd podczas wylogowywania' };
    }
  },
};
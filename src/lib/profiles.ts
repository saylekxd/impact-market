import { supabase } from './supabase';
import { Database } from './database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Omit<Partial<Profile>, 'id' | 'username' | 'created_at' | 'updated_at'>;

export interface ProfileResult {
  success: boolean;
  data?: Profile;
  error?: string;
}

export const profiles = {
  /**
   * Pobierz profil po nazwie użytkownika
   */
  async getByUsername(username: string): Promise<ProfileResult> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username.toLowerCase())
        .single();

      if (error) throw error;
      if (!data) throw new Error('Nie znaleziono profilu');

      console.log('Profile data by username:', data); // Debug log
      return { success: true, data };
    } catch (error: any) {
      console.error('Error getting profile by username:', error); // Debug log
      return {
        success: false,
        error: error.message === 'Nie znaleziono profilu'
          ? error.message
          : 'Wystąpił błąd podczas pobierania profilu',
      };
    }
  },

  /**
   * Pobierz profil po ID
   */
  async getById(id: string): Promise<ProfileResult> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (!data) throw new Error('Nie znaleziono profilu');

      console.log('Profile data by ID:', data); // Debug log
      return { success: true, data };
    } catch (error: any) {
      console.error('Error getting profile by ID:', error); // Debug log
      return {
        success: false,
        error: error.message === 'Nie znaleziono profilu'
          ? error.message
          : 'Wystąpił błąd podczas pobierania profilu',
      };
    }
  },

  /**
   * Aktualizuj profil
   */
  async update(id: string, profile: ProfileUpdate): Promise<ProfileResult> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...profile, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Nie znaleziono profilu');

      console.log('Updated profile data:', data); // Debug log
      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating profile:', error); // Debug log
      return {
        success: false,
        error: 'Wystąpił błąd podczas aktualizacji profilu',
      };
    }
  },
};
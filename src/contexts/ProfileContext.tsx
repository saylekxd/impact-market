import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import type { Profile } from '../lib/database.types';

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  loading: false,
  loadProfile: async () => {},
  updateProfile: async () => false,
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Nie udało się załadować profilu');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateProfile = useCallback(async (updates: Partial<Profile>): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      await loadProfile();
      toast.success('Profil został zaktualizowany');
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Nie udało się zaktualizować profilu');
      return false;
    }
  }, [user, loadProfile]);

  const value = useMemo(() => ({ profile, loading, loadProfile, updateProfile }), [profile, loading, loadProfile, updateProfile]);

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
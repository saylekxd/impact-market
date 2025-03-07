import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<boolean>;
  ensureProfile: () => Promise<Profile | null>;
}

const ProfileContext = createContext<ProfileContextType>({
  profile: null,
  loading: false,
  loadProfile: async () => {},
  updateProfile: async () => false,
  ensureProfile: async () => null,
});

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  // Function to ensure a profile exists for the current user
  const ensureProfile = useCallback(async (): Promise<Profile | null> => {
    if (!user) return null;
    
    try {
      // First try to get the profile
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      // If profile exists, return it
      if (data) return data;
      
      // If error is not "no rows returned", something else went wrong
      if (error && !error.message.includes('contains 0 rows')) {
        console.error('Error checking profile:', error);
        return null;
      }
      
      // No profile exists, let's create one
      console.log('Creating missing profile for user:', user.id);
      
      // Get user email as a fallback username
      const email = user.email || '';
      const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + 
                       Math.floor(Math.random() * 10000);
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: username,
          display_name: username,
          total_donations: 0,
          available_balance: 0,
        })
        .select()
        .single();
        
      if (createError) {
        console.error('Error creating profile:', createError);
        toast.error('Nie udało się utworzyć profilu');
        return null;
      }
      
      toast.success('Profil został utworzony');
      return newProfile;
    } catch (error) {
      console.error('Error in ensureProfile:', error);
      return null;
    }
  }, [user]);

  const loadProfile = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Try to get profile, create if doesn't exist
      const profileData = await ensureProfile();
      if (profileData) {
        setProfile(profileData);
      } else {
        throw new Error('Nie udało się załadować profilu');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Nie udało się załadować profilu');
    } finally {
      setLoading(false);
    }
  }, [user, ensureProfile]);
  
  // Load profile when user changes
  useEffect(() => {
    if (user) {
      loadProfile();
    } else {
      setProfile(null);
    }
  }, [user, loadProfile]);

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

  const value = useMemo(() => ({ 
    profile, 
    loading, 
    loadProfile, 
    updateProfile,
    ensureProfile
  }), [profile, loading, loadProfile, updateProfile, ensureProfile]);

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
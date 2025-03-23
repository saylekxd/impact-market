import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabase';
import { toast } from 'react-hot-toast';
import { User } from '@supabase/supabase-js';

export interface NotificationSettings {
  emailNotifications: boolean;
  donationNotifications: boolean;
  withdrawalNotifications: boolean;
  marketingNotifications: boolean;
}

export interface PrivacySettings {
  profileVisibility: string;
  showDonationAmounts: boolean;
  showDonationMessages: boolean;
}

export interface DisplaySettings {
  theme: string;
  layoutPreference: string;
}

export default function useSettingsDatabase(user: User | null) {
  const [loading, setLoading] = useState(true);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    donationNotifications: true,
    withdrawalNotifications: true,
    marketingNotifications: false,
  });
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showDonationAmounts: true,
    showDonationMessages: true,
  });
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({
    theme: 'dark',
    layoutPreference: 'standard',
  });

  // Load all settings from database
  useEffect(() => {
    if (!user) return;
    
    async function fetchSettings() {
      try {
        setLoading(true);
        
        // Fetch privacy settings
        const { data: privacyData, error: privacyError } = await supabase
          .from('user_privacy_settings')
          .select('*')
          .eq('user_id', user?.id)
          .single();
        
        if (privacyError && privacyError.code !== 'PGRST116') {
          console.error('Error fetching privacy settings:', privacyError);
        }
        
        if (privacyData) {
          setPrivacySettings({
            profileVisibility: privacyData.profile_visibility || 'public',
            showDonationAmounts: privacyData.show_donation_amounts,
            showDonationMessages: privacyData.show_donation_messages,
          });
        }
        
        // Try to fetch notification settings
        const { data: notificationData, error: notificationError } = await supabase
          .from('user_notification_settings')
          .select('*')
          .eq('user_id', user?.id)
          .single();
        
        if (notificationError) {
          if (notificationError.code !== 'PGRST116') {
            console.error('Error fetching notification settings:', notificationError);
            
            // If the table doesn't exist, create it
            if (notificationError.code === '42P01') { // relation does not exist
              console.log('Attempting to create user_notification_settings table...');
              await createNotificationSettingsTable();
            }
          }
        } else if (notificationData) {
          setNotificationSettings({
            emailNotifications: notificationData.email_notifications,
            donationNotifications: notificationData.donation_notifications,
            withdrawalNotifications: notificationData.withdrawal_notifications,
            marketingNotifications: notificationData.marketing_notifications,
          });
        }
        
        // Try to fetch display settings
        const { data: displayData, error: displayError } = await supabase
          .from('user_display_settings')
          .select('*')
          .eq('user_id', user?.id)
          .single();
        
        if (displayError) {
          if (displayError.code !== 'PGRST116') {
            console.error('Error fetching display settings:', displayError);
            
            // If the table doesn't exist, create it
            if (displayError.code === '42P01') { // relation does not exist
              console.log('Attempting to create user_display_settings table...');
              await createDisplaySettingsTable();
            }
          }
        } else if (displayData) {
          setDisplaySettings({
            theme: displayData.theme,
            layoutPreference: displayData.layout_preference,
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Wystąpił błąd podczas ładowania ustawień');
      } finally {
        setLoading(false);
      }
    }
    
    fetchSettings();
  }, [user]);

  // Function to create notification settings table/entry
  const createNotificationSettingsTable = async () => {
    try {
      if (!user) return;
      
      const { error } = await supabase
        .from('user_notification_settings')
        .upsert({
          user_id: user.id,
          email_notifications: notificationSettings.emailNotifications,
          donation_notifications: notificationSettings.donationNotifications,
          withdrawal_notifications: notificationSettings.withdrawalNotifications,
          marketing_notifications: notificationSettings.marketingNotifications,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      if (error && error.code !== '42P01') { // Ignore 'table does not exist' errors
        console.error('Error creating notification settings entry:', error);
      }
    } catch (error) {
      console.error('Error creating notification settings table:', error);
    }
  };

  // Function to create display settings table/entry
  const createDisplaySettingsTable = async () => {
    try {
      if (!user) return;
      
      const { error } = await supabase
        .from('user_display_settings')
        .upsert({
          user_id: user.id,
          theme: displaySettings.theme,
          layout_preference: displaySettings.layoutPreference,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      
      if (error && error.code !== '42P01') { // Ignore 'table does not exist' errors
        console.error('Error creating display settings entry:', error);
      }
    } catch (error) {
      console.error('Error creating display settings table:', error);
    }
  };

  // Update notification settings
  const updateNotificationSetting = async (setting: keyof NotificationSettings) => {
    try {
      if (!user) return;
      
      // Update the local state
      const newValue = !notificationSettings[setting];
      setNotificationSettings(prev => ({
        ...prev,
        [setting]: newValue
      }));
      
      // Map the settings keys to database column names
      const columnMap: Record<string, string> = {
        emailNotifications: 'email_notifications',
        donationNotifications: 'donation_notifications',
        withdrawalNotifications: 'withdrawal_notifications',
        marketingNotifications: 'marketing_notifications'
      };
      
      // Create an update object with all settings
      const updateData = {
        user_id: user.id,
        [columnMap[setting]]: newValue,
        updated_at: new Date().toISOString()
      };
      
      console.log('Updating notification settings in database:', updateData);
      
      // Add any missing fields for insert
      if (setting !== 'emailNotifications') updateData.email_notifications = notificationSettings.emailNotifications;
      if (setting !== 'donationNotifications') updateData.donation_notifications = notificationSettings.donationNotifications;
      if (setting !== 'withdrawalNotifications') updateData.withdrawal_notifications = notificationSettings.withdrawalNotifications;
      if (setting !== 'marketingNotifications') updateData.marketing_notifications = notificationSettings.marketingNotifications;
      
      const { error } = await supabase
        .from('user_notification_settings')
        .upsert(updateData, { onConflict: 'user_id' });
      
      if (error) {
        console.error('Error updating notification settings:', error);
        if (error.code === '42P01') { // relation does not exist
          // Try to create the settings entry
          await createNotificationSettingsTable();
        } else {
          throw error;
        }
      }
      
      toast.success('Ustawienia powiadomień zaktualizowane');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast.error('Wystąpił błąd podczas aktualizacji ustawień');
    }
  };

  // Update privacy settings
  const updatePrivacySetting = async (setting: keyof PrivacySettings, value: any) => {
    try {
      if (!user) return;
      
      // Update the local state
      setPrivacySettings(prev => ({
        ...prev,
        [setting]: value
      }));
      
      // Create an object with the updated values
      const updatedSettings = {
        user_id: user.id,
        profile_visibility: setting === 'profileVisibility' ? value : privacySettings.profileVisibility,
        show_donation_amounts: setting === 'showDonationAmounts' ? value : privacySettings.showDonationAmounts,
        show_donation_messages: setting === 'showDonationMessages' ? value : privacySettings.showDonationMessages,
        updated_at: new Date().toISOString()
      };
      
      console.log('Updating privacy settings in database:', updatedSettings);
      
      const { error } = await supabase
        .from('user_privacy_settings')
        .upsert(updatedSettings, { onConflict: 'user_id' });
      
      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      toast.success('Ustawienia prywatności zaktualizowane');
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast.error('Wystąpił błąd podczas aktualizacji ustawień');
    }
  };

  // Update display settings
  const updateDisplaySetting = async (setting: keyof DisplaySettings, value: string) => {
    try {
      if (!user) return;
      
      // Update the local state
      setDisplaySettings(prev => ({
        ...prev,
        [setting]: value
      }));
      
      // Map the settings keys to database column names
      const columnMap: Record<string, string> = {
        theme: 'theme',
        layoutPreference: 'layout_preference'
      };
      
      // Create an update object with all settings
      const updateData = {
        user_id: user.id,
        [columnMap[setting]]: value,
        updated_at: new Date().toISOString()
      };
      
      console.log('Updating display settings in database:', updateData);
      
      // Add any missing fields for insert
      if (setting !== 'theme') updateData.theme = displaySettings.theme;
      if (setting !== 'layoutPreference') updateData.layout_preference = displaySettings.layoutPreference;
      
      const { error } = await supabase
        .from('user_display_settings')
        .upsert(updateData, { onConflict: 'user_id' });
      
      if (error) {
        console.error('Error updating display settings:', error);
        if (error.code === '42P01') { // relation does not exist
          // Try to create the settings entry
          await createDisplaySettingsTable();
        } else {
          throw error;
        }
      }
      
      toast.success('Ustawienia wyświetlania zaktualizowane');
    } catch (error) {
      console.error('Error updating display settings:', error);
      toast.error('Wystąpił błąd podczas aktualizacji ustawień');
    }
  };

  return {
    loading,
    notificationSettings,
    privacySettings,
    displaySettings,
    updateNotificationSetting,
    updatePrivacySetting,
    updateDisplaySetting
  };
} 
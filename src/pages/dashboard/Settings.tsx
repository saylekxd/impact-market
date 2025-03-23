import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useProfile } from '../../contexts/ProfileContext';
import DashboardLayout from '../../components/DashboardLayout';
import { motion } from 'framer-motion';
import useSettingsDatabase, { NotificationSettings as NotificationSettingsType, PrivacySettings as PrivacySettingsType, DisplaySettings as DisplaySettingsType } from './components/settings/useSettingsDatabase';
import NotificationSettings from './components/settings/NotificationSettings';
import PrivacySettings from './components/settings/PrivacySettings';
import DisplaySettings from './components/settings/DisplaySettings';

export default function Settings() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const {
    loading,
    notificationSettings,
    privacySettings,
    displaySettings,
    updateNotificationSetting,
    updatePrivacySetting,
    updateDisplaySetting
  } = useSettingsDatabase(user);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center">
          <p className="text-xl text-gray-600">Ładowanie...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div>
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-gray-900">Ustawienia</h1>
          <p className="mt-1 text-sm text-gray-500">
            Zarządzaj ustawieniami swojego konta i preferencjami
          </p>
        </motion.div>

        {/* Notification Settings */}
        <NotificationSettings 
          settings={notificationSettings} 
          onToggle={(setting: string) => updateNotificationSetting(setting as keyof NotificationSettingsType)} 
        />

        {/* Privacy Controls */}
        <PrivacySettings 
          settings={privacySettings} 
          onVisibilityChange={(value) => updatePrivacySetting('profileVisibility', value)}
          onToggle={(setting: string, value) => updatePrivacySetting(setting as keyof PrivacySettingsType, value)}
        />

        {/* Display Preferences */}
        <DisplaySettings 
          settings={displaySettings} 
          onChange={(setting: string, value) => updateDisplaySetting(setting as keyof DisplaySettingsType, value)}
        />
      </div>
    </DashboardLayout>
  );
} 
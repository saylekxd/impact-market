import React from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { NotificationSettings as NotificationSettingsType } from './useSettingsDatabase';

interface NotificationSettingsProps {
  settings: NotificationSettingsType;
  onToggle: (setting: string) => void;
}

export default function NotificationSettings({ settings, onToggle }: NotificationSettingsProps) {
  return (
    <motion.div 
      className="bg-white shadow rounded-lg overflow-hidden mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="px-6 py-8">
        <div className="flex items-center mb-6">
          <Bell className="h-6 w-6 text-gray-400 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Powiadomienia</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Powiadomienia e-mail</h3>
              <p className="text-sm text-gray-500">Otrzymuj powiadomienia e-mail</p>
            </div>
            <button 
              className={`${
                settings.emailNotifications 
                  ? 'bg-blue-600' 
                  : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              onClick={() => onToggle('emailNotifications')}
            >
              <span 
                className={`${
                  settings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              ></span>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Powiadomienia o darowiznach</h3>
              <p className="text-sm text-gray-500">Otrzymuj powiadomienia, gdy ktoś Cię wesprze</p>
            </div>
            <button 
              className={`${
                settings.donationNotifications 
                  ? 'bg-blue-600' 
                  : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              onClick={() => onToggle('donationNotifications')}
            >
              <span 
                className={`${
                  settings.donationNotifications ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              ></span>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Powiadomienia o wypłatach</h3>
              <p className="text-sm text-gray-500">Otrzymuj powiadomienia o statusie Twoich wypłat</p>
            </div>
            <button 
              className={`${
                settings.withdrawalNotifications 
                  ? 'bg-blue-600' 
                  : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              onClick={() => onToggle('withdrawalNotifications')}
            >
              <span 
                className={`${
                  settings.withdrawalNotifications ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              ></span>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">E-maile marketingowe</h3>
              <p className="text-sm text-gray-500">Otrzymuj informacje o nowych funkcjach i promocjach</p>
            </div>
            <button 
              className={`${
                settings.marketingNotifications 
                  ? 'bg-blue-600' 
                  : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              onClick={() => onToggle('marketingNotifications')}
            >
              <span 
                className={`${
                  settings.marketingNotifications ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              ></span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 
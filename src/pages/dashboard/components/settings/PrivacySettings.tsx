import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { PrivacySettings as PrivacySettingsType } from './useSettingsDatabase';

interface PrivacySettingsProps {
  settings: PrivacySettingsType;
  onVisibilityChange: (value: string) => void;
  onToggle: (setting: string, value: boolean) => void;
}

export default function PrivacySettings({ settings, onVisibilityChange, onToggle }: PrivacySettingsProps) {
  return (
    <motion.div 
      className="bg-white shadow rounded-lg overflow-hidden mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="px-6 py-8">
        <div className="flex items-center mb-6">
          <Shield className="h-6 w-6 text-gray-400 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Prywatność</h2>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Widoczność profilu</h3>
            <div className="flex flex-col space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600"
                  name="profileVisibility"
                  value="public"
                  checked={settings.profileVisibility === 'public'}
                  onChange={() => onVisibilityChange('public')}
                />
                <span className="ml-2 text-sm text-gray-700">Publiczny (widoczny dla wszystkich)</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600"
                  name="profileVisibility"
                  value="unlisted"
                  checked={settings.profileVisibility === 'unlisted'}
                  onChange={() => onVisibilityChange('unlisted')}
                />
                <span className="ml-2 text-sm text-gray-700">Nieindeksowany (dostępny tylko przez bezpośredni link)</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600"
                  name="profileVisibility"
                  value="private"
                  checked={settings.profileVisibility === 'private'}
                  onChange={() => onVisibilityChange('private')}
                />
                <span className="ml-2 text-sm text-gray-700">Prywatny (widoczny tylko dla Ciebie)</span>
              </label>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Pokazuj kwoty darowizn</h3>
              <p className="text-sm text-gray-500">Pokazuj publiczne kwoty darowizn na Twoim profilu</p>
            </div>
            <button 
              className={`${
                settings.showDonationAmounts 
                  ? 'bg-blue-600' 
                  : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              onClick={() => onToggle('showDonationAmounts', !settings.showDonationAmounts)}
            >
              <span 
                className={`${
                  settings.showDonationAmounts ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              ></span>
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Pokazuj wiadomości od wspierających</h3>
              <p className="text-sm text-gray-500">Pokazuj publiczne wiadomości od wspierających na Twoim profilu</p>
            </div>
            <button 
              className={`${
                settings.showDonationMessages 
                  ? 'bg-blue-600' 
                  : 'bg-gray-200'
              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
              onClick={() => onToggle('showDonationMessages', !settings.showDonationMessages)}
            >
              <span 
                className={`${
                  settings.showDonationMessages ? 'translate-x-5' : 'translate-x-0'
                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              ></span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 
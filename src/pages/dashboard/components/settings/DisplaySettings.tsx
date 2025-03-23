import React from 'react';
import { motion } from 'framer-motion';
import { Layout } from 'lucide-react';
import { DisplaySettings as DisplaySettingsType } from './useSettingsDatabase';

interface DisplaySettingsProps {
  settings: DisplaySettingsType;
  onChange: (setting: string, value: string) => void;
}

export default function DisplaySettings({ settings, onChange }: DisplaySettingsProps) {
  return (
    <motion.div 
      className="bg-white shadow rounded-lg overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <div className="px-6 py-8">
        <div className="flex items-center mb-6">
          <Layout className="h-6 w-6 text-gray-400 mr-3" />
          <h2 className="text-xl font-bold text-gray-900">Wygląd</h2>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Motyw</h3>
            <div className="flex flex-col space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600"
                  name="theme"
                  value="light"
                  checked={settings.theme === 'light'}
                  onChange={() => onChange('theme', 'light')}
                />
                <span className="ml-2 text-sm text-gray-700">Jasny</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600"
                  name="theme"
                  value="dark"
                  checked={settings.theme === 'dark'}
                  onChange={() => onChange('theme', 'dark')}
                />
                <span className="ml-2 text-sm text-gray-700">Ciemny</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600"
                  name="theme"
                  value="system"
                  checked={settings.theme === 'system'}
                  onChange={() => onChange('theme', 'system')}
                />
                <span className="ml-2 text-sm text-gray-700">Zgodny z systemem</span>
              </label>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Układ</h3>
            <div className="flex flex-col space-y-2">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600"
                  name="layoutPreference"
                  value="standard"
                  checked={settings.layoutPreference === 'standard'}
                  onChange={() => onChange('layoutPreference', 'standard')}
                />
                <span className="ml-2 text-sm text-gray-700">Standardowy</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600"
                  name="layoutPreference"
                  value="compact"
                  checked={settings.layoutPreference === 'compact'}
                  onChange={() => onChange('layoutPreference', 'compact')}
                />
                <span className="ml-2 text-sm text-gray-700">Kompaktowy</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio h-4 w-4 text-blue-600"
                  name="layoutPreference"
                  value="expanded"
                  checked={settings.layoutPreference === 'expanded'}
                  onChange={() => onChange('layoutPreference', 'expanded')}
                />
                <span className="ml-2 text-sm text-gray-700">Rozszerzony</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 
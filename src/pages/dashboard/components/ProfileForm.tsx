import React from 'react';
import { useProfile } from '../../../contexts/ProfileContext';
import CoffeeIconsSelector, { CoffeeIconsConfig } from './CoffeeIconsSelector';
import { motion } from 'framer-motion';

interface ProfileFormProps {
  formData: {
    display_name: string;
    bio: string;
    avatar_url: string;
    small_coffee_amount: number;
    medium_coffee_amount: number;
    large_coffee_amount: number;
    small_icon: string;
    medium_icon: string;
    large_icon: string;
  };
  onChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ProfileForm({ formData, onChange, onSubmit }: ProfileFormProps) {
  // Handle coffee icon settings changes
  const handleCoffeeIconsChange = (config: CoffeeIconsConfig) => {
    onChange({
      ...formData,
      ...config
    });
  };

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 mb-1">
          Wyświetlana nazwa
        </label>
        <input
          type="text"
          id="display_name"
          value={formData.display_name}
          onChange={(e) => onChange({ ...formData, display_name: e.target.value })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
          Bio
        </label>
        <textarea
          id="bio"
          rows={3}
          value={formData.bio}
          onChange={(e) => onChange({ ...formData, bio: e.target.value })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700 mb-1">
          URL avatara
        </label>
        <input
          type="url"
          id="avatar_url"
          value={formData.avatar_url}
          onChange={(e) => onChange({ ...formData, avatar_url: e.target.value })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
        />
      </motion.div>

      {/* Coffee Icons Selector */}
      <motion.div 
        className="pt-6 border-t border-gray-200"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <CoffeeIconsSelector
          value={{
            small_icon: formData.small_icon || 'coffee',
            medium_icon: formData.medium_icon || 'coffee',
            large_icon: formData.large_icon || 'coffee',
            small_coffee_amount: formData.small_coffee_amount || 500,
            medium_coffee_amount: formData.medium_coffee_amount || 1000,
            large_coffee_amount: formData.large_coffee_amount || 2000,
          }}
          onChange={handleCoffeeIconsChange}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="mt-8"
      >
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        >
          Zapisz zmiany
        </button>
      </motion.div>
    </form>
  );
}
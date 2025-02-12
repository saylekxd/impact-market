import React from 'react';
import { useProfile } from '../../../contexts/ProfileContext';

interface ProfileFormProps {
  formData: {
    display_name: string;
    bio: string;
    avatar_url: string;
  };
  onChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ProfileForm({ formData, onChange, onSubmit }: ProfileFormProps) {
  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-6">
      <div>
        <label htmlFor="display_name" className="block text-sm font-medium text-gray-700">
          Wyświetlana nazwa
        </label>
        <input
          type="text"
          id="display_name"
          value={formData.display_name}
          onChange={(e) => onChange({ ...formData, display_name: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          id="bio"
          rows={3}
          value={formData.bio}
          onChange={(e) => onChange({ ...formData, bio: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="avatar_url" className="block text-sm font-medium text-gray-700">
          URL avatara
        </label>
        <input
          type="url"
          id="avatar_url"
          value={formData.avatar_url}
          onChange={(e) => onChange({ ...formData, avatar_url: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        />
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Zapisz zmiany
      </button>
    </form>
  );
}
import React from 'react';
import { useProfile } from '../../../contexts/ProfileContext';

interface ProfileSectionProps {
  onEdit: () => void;
  editing: boolean;
}

export default function ProfileSection({ onEdit, editing }: ProfileSectionProps) {
  const { profile } = useProfile();

  if (!profile) return null;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
      <div className="px-6 py-8">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Twój profil</h2>
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-500"
          >
            {editing ? 'Anuluj' : 'Edytuj'}
          </button>
        </div>

        {!editing && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name || ''}
                  className="h-20 w-20 rounded-full object-cover"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {profile.display_name?.[0]}
                  </span>
                </div>
              )}
              <div className="ml-6">
                <h3 className="text-lg font-medium text-gray-900">{profile.display_name}</h3>
                <p className="text-sm text-gray-500">@{profile.username}</p>
              </div>
            </div>
            <p className="text-gray-600">{profile.bio || 'Brak opisu'}</p>
            <p className="text-sm text-gray-500">
              Link do profilu:{' '}
              <a
                href={`/${profile.username}`}
                className="text-blue-600 hover:text-blue-500"
              >
                {window.location.origin}/{profile.username}
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
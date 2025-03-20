import React from 'react';
import { useProfile } from '../../../contexts/ProfileContext';
import { motion } from 'framer-motion';

interface ProfileSectionProps {
  onEdit: () => void;
}

export default function ProfileSection({ onEdit }: ProfileSectionProps) {
  const { profile } = useProfile();

  if (!profile) return null;

  return (
    <div className="mt-6 space-y-6">
      <motion.div 
        className="flex items-center"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        {profile.avatar_url ? (
          <div className="h-20 w-20 rounded-lg overflow-hidden">
            <img
              src={profile.avatar_url}
              alt={profile.display_name || ''}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-20 w-20 rounded-lg bg-gray-100 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-600">
              {profile.display_name?.[0] || profile.username?.[0]}
            </span>
          </div>
        )}
        <div className="ml-6">
          <h3 className="text-lg font-bold text-gray-900">{profile.display_name}</h3>
          <p className="text-sm text-gray-500">@{profile.username}</p>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <p className="text-gray-700">{profile.bio || 'Brak opisu'}</p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-gray-50 p-4 rounded-lg border border-gray-100"
      >
        <p className="text-sm text-gray-500">
          Link do profilu:{' '}
          <a
            href={`/${profile.username}`}
            className="text-[#FF8C3B] font-medium hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {window.location.origin}/{profile.username}
          </a>
        </p>
      </motion.div>
    </div>
  );
}
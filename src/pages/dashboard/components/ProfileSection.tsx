import React from 'react';
import { useProfile } from '../../../contexts/ProfileContext';
import { motion } from 'framer-motion';
import { Instagram, Twitter, Facebook, Globe, Youtube, ExternalLink } from 'lucide-react';

interface ProfileSectionProps {
  onEdit: () => void;
}

// Define a type for social platforms
type SocialPlatform = 'website' | 'instagram' | 'twitter' | 'facebook' | 'youtube';

interface SocialIconInfo {
  icon: React.ReactNode;
  label: string;
}

export default function ProfileSection({ onEdit }: ProfileSectionProps) {
  const { profile } = useProfile();

  if (!profile) return null;

  // Function to render social media icons with links
  const renderSocialLinks = () => {
    if (!profile.social_links) return null;
    
    const socialIcons: Record<SocialPlatform, SocialIconInfo> = {
      website: { icon: <Globe className="h-4 w-4" />, label: 'Strona internetowa' },
      instagram: { icon: <Instagram className="h-4 w-4" />, label: 'Instagram' },
      twitter: { icon: <Twitter className="h-4 w-4" />, label: 'Twitter' },
      facebook: { icon: <Facebook className="h-4 w-4" />, label: 'Facebook' },
      youtube: { icon: <Youtube className="h-4 w-4" />, label: 'YouTube' },
    };
    
    const links = Object.entries(profile.social_links).filter(([_, url]) => url);
    
    if (links.length === 0) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-4"
      >
        <h4 className="text-sm font-medium text-gray-700 mb-2">Media społecznościowe</h4>
        <div className="flex flex-wrap gap-3">
          {links.map(([platform, url]) => {
            // Only render if it's a valid social platform
            const socialPlatform = platform as SocialPlatform;
            if (!socialIcons[socialPlatform]) return null;
            
            return (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#FF8C3B] bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors"
              >
                {socialIcons[socialPlatform].icon}
                {socialIcons[socialPlatform].label}
                <ExternalLink className="h-3 w-3" />
              </a>
            );
          })}
        </div>
      </motion.div>
    );
  };

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
      
      {/* Render social links */}
      {renderSocialLinks()}
      
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
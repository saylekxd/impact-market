import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useProfile } from '../../../contexts/ProfileContext';
import { Check, Star, ChevronRight, BadgeCheck, Award, AlertCircle } from 'lucide-react';

interface ProfileHeaderProps {
  onEditClick?: () => void;
}

export default function ProfileHeader({ onEditClick }: ProfileHeaderProps) {
  const { profile, loading } = useProfile();

  // Calculate profile completion percentage based on filled fields
  const profileCompletionData = useMemo(() => {
    if (!profile) return { percentage: 0, completedSteps: [], incompleteSteps: [] };

    const requiredFields = [
      { name: 'display_name', label: 'Nazwa wyświetlana', value: profile.display_name },
      { name: 'username', label: 'Nazwa użytkownika', value: profile.username },
      { name: 'bio', label: 'Bio', value: profile.bio },
      { name: 'avatar_url', label: 'Zdjęcie profilowe', value: profile.avatar_url },
      { name: 'small_icon', label: 'Ikona mała', value: profile.small_icon },
      { name: 'medium_icon', label: 'Ikona średnia', value: profile.medium_icon },
      { name: 'large_icon', label: 'Ikona duża', value: profile.large_icon },
    ];

    const completedSteps = requiredFields.filter(field => !!field.value);
    const incompleteSteps = requiredFields.filter(field => !field.value);
    
    const percentage = Math.round((completedSteps.length / requiredFields.length) * 100);

    return { percentage, completedSteps, incompleteSteps };
  }, [profile]);

  // Calculate badges/achievements
  const achievements = useMemo(() => {
    if (!profile) return [];
    
    const badges = [
      {
        id: 'profile_complete',
        icon: <BadgeCheck className="h-5 w-5" />,
        name: 'Profil kompletny',
        description: 'Wypełniłeś wszystkie pola w swoim profilu',
        earned: profileCompletionData.percentage === 100,
      },
      {
        id: 'first_donation',
        icon: <Award className="h-5 w-5" />,
        name: 'Pierwsza darowizna',
        description: 'Otrzymałeś pierwszą darowiznę',
        earned: (profile.total_donations || 0) > 0,
      },
      {
        id: 'donation_milestone',
        icon: <Star className="h-5 w-5" />,
        name: 'Kamień milowy',
        description: 'Otrzymałeś ponad 10 darowizn',
        earned: (profile.total_donations || 0) >= 1000, // assuming total_donations is in cents
      }
    ];
    
    return badges;
  }, [profile, profileCompletionData.percentage]);

  if (loading || !profile) {
    return (
      <div className="animate-pulse h-32 bg-gray-100 rounded-lg"></div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col space-y-6"
        >
          {/* Profile Completion Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-700">Uzupełnienie profilu</h3>
              <span className="text-sm font-semibold">{profileCompletionData.percentage}%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <motion.div 
                className="bg-[#FF8C3B] h-2.5 rounded-full" 
                style={{ width: `${profileCompletionData.percentage}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${profileCompletionData.percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            
            {profileCompletionData.percentage < 100 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Do uzupełnienia:</p>
                <ul className="space-y-1">
                  {profileCompletionData.incompleteSteps.map(step => (
                    <li key={step.name} className="flex items-center text-sm text-gray-600">
                      <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" /> 
                      {step.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Achievements/Badges */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Twoje osiągnięcia</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {achievements.map(badge => (
                <motion.div
                  key={badge.id}
                  className={`border rounded-lg p-3 flex items-center ${
                    badge.earned 
                      ? 'border-[#FF8C3B] bg-orange-50' 
                      : 'border-gray-200 bg-gray-50 opacity-60'
                  }`}
                  whileHover={{ scale: badge.earned ? 1.03 : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className={`mr-3 p-2 rounded-full ${
                    badge.earned ? 'bg-[#FF8C3B] text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {badge.icon}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${badge.earned ? 'text-gray-800' : 'text-gray-500'}`}>
                      {badge.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {badge.earned ? 'Odblokowane' : 'Do odblokowania'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Profile Suggestions/Tips */}
          {profileCompletionData.percentage < 100 && (
            <motion.div
              className="mt-2 p-4 bg-blue-50 border border-blue-100 rounded-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Wskazówka
              </h4>
              <p className="text-sm text-blue-700">
                Uzupełnij wszystkie pola swojego profilu, aby zwiększyć widoczność i zdobyć więcej darowizn.
                Kompletny profil buduje zaufanie wśród osób wspierających.
              </p>
              <button 
                onClick={onEditClick}
                className="mt-2 text-sm flex items-center text-blue-600 hover:text-blue-800"
              >
                Uzupełnij profil <ChevronRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 
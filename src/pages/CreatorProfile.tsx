import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { profiles } from '../lib/profiles';
import { donations } from '../lib/donations';
import { goals } from '../lib/goals';
import type { Profile } from '../lib/profiles';
import type { DonationGoal } from '../lib/goals';
import DonationStripeForm from '../components/DonationStripeForm';
import { Loader2, ImageOff, Globe, Instagram, Twitter, Facebook, Youtube } from 'lucide-react';
import { AnimatedBackground } from "@/components/ui/animated-background";
import { MinimalFooter } from "@/components/ui/minimal-footer";

// Define a type for the icons map for better type safety
type SocialIconMap = {
  [key: string]: {
    icon: React.ElementType;
    label: string;
  };
};

// Map social keys to icons and labels
const socialIconMap: SocialIconMap = {
  website: { icon: Globe, label: 'Website' },
  instagram: { icon: Instagram, label: 'Instagram' },
  twitter: { icon: Twitter, label: 'Twitter' },
  facebook: { icon: Facebook, label: 'Facebook' },
  youtube: { icon: Youtube, label: 'YouTube' },
};

export default function CreatorProfile() {
  const { username } = useParams();
  const location = useLocation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeGoal, setActiveGoal] = useState<DonationGoal | null>(null);
  const [totalDonations, setTotalDonations] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [recentDonation, setRecentDonation] = useState(false);
  
  // Check if coming from payment success page
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('donation_success') === 'true') {
      setRecentDonation(true);
      // Clear the flag after 5 seconds
      const timer = setTimeout(() => {
        setRecentDonation(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location]);
  
  // Define loadProfile function
  async function loadProfile() {
    if (!username) return;

    try {
      setLoading(true);
      setActiveGoal(null);
      const result = await profiles.getByUsername(username);
      if (result.success && result.data) {
        const loadedProfile = result.data;
        setProfile(loadedProfile);
        
        const totalResult = await donations.getTotalByCreatorId(loadedProfile.id);
        if (totalResult.success) {
          setTotalDonations(totalResult.total || 0);
        }

        const goalResult = await goals.getActiveGoalByUserId(loadedProfile.id);
        if (goalResult.success && goalResult.data) {
          setActiveGoal(goalResult.data as DonationGoal);
        } else if (!goalResult.success) {
          console.error("Error fetching active goal:", goalResult.error);
        }

      } else {
        toast.error(result.error || 'Nie znaleziono profilu');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#dcddd7] pt-16 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 text-[#1a1a1a] animate-spin mb-4" />
          <p className="text-xl text-[#1a1a1a]">Ładowanie profilu...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#dcddd7] pt-16 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-12">
          <p className="text-xl text-[#1a1a1a]">Nie znaleziono profilu</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#dcddd7] pt-16 flex flex-col">
      <main className="flex-grow relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {recentDonation && (
            <div className="bg-[#ffa04f]/10 border border-[#ffa04f]/30 rounded-lg p-4 mb-6 text-[#1a1a1a] text-center">
              Dziękujemy za Twoje wsparcie!
            </div>
          )}
          
          <div className="flex flex-col md:flex-row gap-8">

            <div className="w-full md:w-3/5 flex flex-col gap-8"> 
              <div className="bg-white border border-[#1a1a1a]/10 rounded-lg overflow-hidden">
                <div className="p-6 flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name || ''}
                      className="h-24 w-24 rounded-full object-cover mb-4 sm:mb-0 sm:mr-6 flex-shrink-0 border border-[#1a1a1a]/10"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-[#ffa04f]/20 flex items-center justify-center mb-4 sm:mb-0 sm:mr-6 flex-shrink-0">
                      <span className="text-3xl font-semibold text-[#ffa04f]">
                        {profile.display_name?.charAt(0).toUpperCase() || 'C'} 
                      </span>
                    </div>
                  )}
                  <div className="flex-grow">
                    <h1 className="text-3xl font-bold text-[#1a1a1a] mb-1">{profile.display_name}</h1>
                    <p className="text-[#1a1a1a]/70 text-sm mb-2">@{profile.username}</p>
                    <p className="text-sm text-[#ffa04f] font-medium">
                      Łączne wsparcie: {(totalDonations / 100).toFixed(2)} PLN
                    </p>
                    
                    {/* Social Links Section */}
                    {profile.social_links && Object.values(profile.social_links).some(link => link) && (
                      <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2">
                        {Object.entries(profile.social_links)
                          .filter(([, link]) => link) // Filter out empty/null links
                          .map(([key, link]) => {
                            const socialInfo = socialIconMap[key];
                            if (!socialInfo) return null; // Skip if key is not in our map
                            return (
                              <a
                                key={key}
                                href={link || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={socialInfo.label}
                                title={socialInfo.label}
                                className="flex items-center text-[#1a1a1a]/60 hover:text-[#1a1a1a] transition-colors text-sm"
                              >
                                <socialInfo.icon className="h-4 w-4 mr-1.5" /> {/* Slightly smaller icon, add margin */}
                                <span>{socialInfo.label}</span> {/* Display label */}
                              </a>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
                
                {profile.bio && (
                  <div className="border-t border-[#1a1a1a]/10 px-6 py-4">
                    <h2 className="text-xs font-semibold text-[#1a1a1a]/50 uppercase tracking-wide mb-2">O mnie</h2>
                    <p className="text-[#1a1a1a]/90 text-sm leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                  </div>
                )}

                {profile.organization_history && (
                  <div className="border-t border-[#1a1a1a]/10 px-6 py-4">
                    <h2 className="text-xs font-semibold text-[#1a1a1a]/50 uppercase tracking-wide mb-2">Historia</h2>
                    <p className="text-[#1a1a1a]/90 text-sm leading-relaxed whitespace-pre-wrap">{profile.organization_history}</p>
                  </div>
                )}

                {profile.organization_mission && (
                  <div className="border-t border-[#1a1a1a]/10 px-6 py-4">
                    <h2 className="text-xs font-semibold text-[#1a1a1a]/50 uppercase tracking-wide mb-2">Misja</h2>
                    <p className="text-[#1a1a1a]/90 text-sm leading-relaxed whitespace-pre-wrap">{profile.organization_mission}</p>
                  </div>
                )}

                <div className="border-t border-[#1a1a1a]/10 px-6 py-4">
                  <h2 className="text-xs font-semibold text-[#1a1a1a]/50 uppercase tracking-wide mb-3">Galeria</h2>
                  {(() => {
                    const photos = profile.organization_photos;

                    // Explicitly handle null or empty array first
                    if (!photos || photos.length === 0) {
                      return (
                        <div className="flex flex-col items-center justify-center text-center text-[#1a1a1a]/60 py-4">
                          <ImageOff className="h-8 w-8 mb-2" />
                          <p className="text-sm">Brak zdjęć do wyświetlenia.</p>
                        </div>
                      );
                    }

                    // --- At this point, photos is guaranteed to be a non-empty array ---
                    const photoCount = photos.length; // Get length from the non-null array

                    if (photoCount === 1) {
                      // Single photo case
                      return (
                        <div className="w-full aspect-video rounded-md overflow-hidden border border-[#1a1a1a]/10">
                          <img 
                            src={photos[0]} 
                            alt={`Zdjęcie organizacji 1`} 
                            className="h-full w-full object-cover"
                          />
                        </div>
                      );
                    } else if (photoCount === 2) {
                      // Two photos case - side by side squares
                      return (
                         <div className="grid grid-cols-2 gap-3">
                          {photos.map((photoUrl, index) => (
                            <div key={index} className="aspect-square rounded-md overflow-hidden border border-[#1a1a1a]/10">
                              <img 
                                src={photoUrl} 
                                alt={`Zdjęcie organizacji ${index + 1}`} 
                                className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ))}
                        </div>
                      );
                    } else {
                      // Three or more photos case - creative grid
                      return (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 auto-rows-[150px] sm:auto-rows-[200px]">
                          {photos.map((photoUrl, index) => (
                            <div 
                              key={index} 
                              className={`
                                rounded-md overflow-hidden border border-[#1a1a1a]/10
                                ${index === 0 ? 'col-span-2 row-span-2' : ''} 
                              `}
                            >
                              <img 
                                src={photoUrl} 
                                alt={`Zdjęcie organizacji ${index + 1}`} 
                                className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          ))}
                        </div>
                      );
                    }
                  })()}
                </div>

              </div>
            </div>

            <div className="w-full md:w-2/5">
              {/* Logo container with animated background and hover effect */}
              <motion.div
                whileHover={{ scale: 1.03 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <div className="bg-[#1a1a1a] rounded-lg px-6 py-4 mb-6 flex justify-center relative overflow-hidden">
                  <AnimatedBackground className="absolute inset-0 opacity-20" />
                  <Link to="/" aria-label="Strona główna" className="relative z-10">
                    <img
                      src="/path/to/your/logo.svg" // <-- Replace with actual logo path. Consider using a light version for dark background.
                      alt="Logo"
                      className="h-8 w-auto" // Adjust size as needed
                    />
                  </Link>
                </div>
              </motion.div>
              <div className="bg-white border border-[#1a1a1a]/10 rounded-lg overflow-hidden">
                 <div className="px-6 py-4 border-b border-[#1a1a1a]/10">
                   <h2 className="text-lg font-semibold text-[#1a1a1a]">Wesprzyj twórcę</h2>
                 </div>
                <DonationStripeForm 
                  creatorId={profile.id}
                  creatorName={profile.display_name || profile.username}
                  tierConfig={{
                    smallIconId: profile.small_icon,
                    smallAmount: profile.small_coffee_amount || 0,
                    mediumIconId: profile.medium_icon,
                    mediumAmount: profile.medium_coffee_amount || 0,
                    largeIconId: profile.large_icon,
                    largeAmount: profile.large_coffee_amount || 0,
                  }}
                  onSuccess={() => {
                    loadProfile();
                  }}
                />
              </div>
            </div>

          </div>
        </div>
        {/* Gradient overlay div */}
        <div className="absolute bottom-0 left-0 right-0 h-[30vh] bg-gradient-to-t from-[#1a1a1a] to-transparent pointer-events-none" /> 
      </main>
      <MinimalFooter />
    </div>
  );
}
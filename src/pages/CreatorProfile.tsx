import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { profiles } from '../lib/profiles';
import { donations } from '../lib/donations';
import type { Profile } from '../lib/profiles';
import DonationStripeForm from '../components/DonationStripeForm';

export default function CreatorProfile() {
  const { username } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [totalDonations, setTotalDonations] = useState<number>(0);
  
  // Define loadProfile function
  async function loadProfile() {
    if (!username) return;

    try {
      const result = await profiles.getByUsername(username);
      if (result.success && result.data) {
        setProfile(result.data);
        const totalResult = await donations.getTotalByCreatorId(result.data.id);
        if (totalResult.success) {
          setTotalDonations(totalResult.total || 0);
        }
      } else {
        toast.error(result.error || 'Nie znaleziono profilu');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(errorMessage);
    }
  }

  useEffect(() => {
    loadProfile();
  }, [username]);

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xl text-gray-600">Ładowanie profilu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Profil twórcy */}
          <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
            <div className="px-6 py-8">
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
                  <h1 className="text-2xl font-bold text-gray-900">{profile.display_name}</h1>
                  <p className="text-gray-500">@{profile.username}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Łączne wsparcie: {(totalDonations / 100).toFixed(2)} PLN
                  </p>
                </div>
              </div>
              {profile.bio && (
                <p className="mt-4 text-gray-600">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Formularz wsparcia */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <DonationStripeForm 
              creatorId={profile.id}
              creatorName={profile.display_name || profile.username}
              onSuccess={() => {
                // Reload profile after successful donation
                loadProfile();
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
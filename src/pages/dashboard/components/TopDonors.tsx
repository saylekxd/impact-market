import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Settings, UserIcon, Heart, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'react-hot-toast';

type TopDonor = {
  payer_name: string | null;
  payer_email: string | null;
  total_amount: number;
  donation_count: number;
};

type DonorVisibilitySettings = {
  id?: string;
  user_id: string;
  show_top_donors: boolean;
  top_donors_count: number;
  created_at?: string;
  updated_at?: string;
};

type TopDonorsProps = {
  topDonors: TopDonor[];
  donorVisibilitySettings: DonorVisibilitySettings | null;
  formatCurrency: (amount: number) => string;
  userId: string;
  onSettingsUpdated: () => Promise<void>;
  anonymousDonations: { total: number; count: number };
};

const TopDonors: React.FC<TopDonorsProps> = ({
  topDonors,
  donorVisibilitySettings,
  formatCurrency,
  userId,
  onSettingsUpdated,
  anonymousDonations,
}) => {
  const [isEditingVisibility, setIsEditingVisibility] = useState(false);
  const [showTopDonors, setShowTopDonors] = useState(
    donorVisibilitySettings?.show_top_donors ?? true
  );
  const [topDonorsCount, setTopDonorsCount] = useState(
    donorVisibilitySettings?.top_donors_count ?? 5
  );

  // Save donor visibility settings
  const saveDonorVisibilitySettings = async () => {
    try {
      let { error } = await supabase
        .from('donor_visibility')
        .upsert({
          user_id: userId,
          show_top_donors: showTopDonors,
          top_donors_count: topDonorsCount,
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      
      toast.success('Ustawienia zapisane pomyślnie');
      setIsEditingVisibility(false);
      await onSettingsUpdated();
    } catch (error) {
      console.error('Error saving donor visibility settings:', error);
      toast.error('Nie udało się zapisać ustawień');
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-xl shadow-sm overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Trophy className="h-6 w-6 text-orange-500 mr-2" />
              <h2 className="text-xl font-bold tracking-tight text-black">Najlepsi darczyńcy</h2>
            </div>
            <div className="flex space-x-2">
              {!isEditingVisibility ? (
                <button
                  onClick={() => setIsEditingVisibility(true)}
                  className="flex items-center text-gray-600 hover:text-orange-500 transition-colors"
                >
                  <Settings className="h-5 w-5 mr-1" />
                  <span>Ustawienia</span>
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={saveDonorVisibilitySettings}
                    className="px-3 py-1 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                  >
                    Zapisz
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingVisibility(false);
                      // Reset to current settings
                      if (donorVisibilitySettings) {
                        setShowTopDonors(donorVisibilitySettings.show_top_donors);
                        setTopDonorsCount(donorVisibilitySettings.top_donors_count);
                      }
                    }}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Anuluj
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {isEditingVisibility && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl space-y-4">
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showTopDonors"
                    checked={showTopDonors}
                    onChange={(e) => setShowTopDonors(e.target.checked)}
                    className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <label htmlFor="showTopDonors" className="ml-2 block text-sm text-gray-700">
                    Pokaż najlepszych darczyńców na moim profilu publicznym
                  </label>
                </div>
                
                <div>
                  <label htmlFor="topDonorsCount" className="block text-sm text-gray-700 mb-1">
                    Liczba najlepszych darczyńców do wyświetlenia (1-10)
                  </label>
                  <input
                    type="number"
                    id="topDonorsCount"
                    min="1"
                    max="10"
                    value={topDonorsCount}
                    onChange={(e) => setTopDonorsCount(Number(e.target.value))}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>
          )}
          
          {topDonors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Darczyńca
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Suma
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Liczba
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topDonors
                    .slice(0, topDonorsCount)
                    .map((donor, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8">
                            <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                              <UserIcon className="h-4 w-4 text-orange-500" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {donor.payer_name || 'Nieznany'}
                            </div>
                            <div className="text-xs text-gray-500">
                              {donor.payer_email || 'Brak adresu e-mail'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        {formatCurrency(donor.total_amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                        {donor.donation_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-1">Brak darczyńców</h3>
              <p className="text-sm text-gray-500">
                Nie znaleźliśmy żadnych darczyńców w Twoim koncie.
              </p>
            </div>
          )}
        </div>
      </motion.div>
        
      {/* Show anonymous donation stats if they exist */}
      {anonymousDonations.count > 0 && (
        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
          <div className="flex items-center mb-2">
            <EyeOff className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-md font-medium text-gray-700">Anonimowe darowizny</h3>
          </div>
          <p className="text-sm text-gray-600">
            Otrzymałeś {anonymousDonations.count} anonimowych darowizn o łącznej wartości {formatCurrency(anonymousDonations.total)}.
            Anonimowe darowizny nie są pokazywane w tabeli najlepszych darczyńców.
          </p>
        </div>
      )}
      
      {/* Display visibility indicator */}
      <div className="mt-2">
        {showTopDonors ? (
          <div className="flex items-center text-sm text-gray-500">
            <Eye className="h-4 w-4 mr-1" />
            <span>Najlepsi darczyńcy są widoczni na Twoim profilu publicznym</span>
          </div>
        ) : (
          <div className="flex items-center text-sm text-gray-500">
            <EyeOff className="h-4 w-4 mr-1" />
            <span>Najlepsi darczyńcy są ukryci na Twoim profilu publicznym</span>
          </div>
        )}
      </div>
    </>
  );
};

export default TopDonors; 
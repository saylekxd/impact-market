import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { ALL_ICONS, DONATION_CATEGORIES } from '../../pages/dashboard/components/IconsData';
import { Coffee, ArrowLeft, ArrowRight } from 'lucide-react';

interface IconSelectConfig {
  small_icon: string;
  medium_icon: string;
  large_icon: string;
  small_coffee_amount: number;
  medium_coffee_amount: number;
  large_coffee_amount: number;
}

interface IconSelectionFormProps {
  userId: string;
  accountType: string;
  onCompleted: () => void;
}

export default function IconSelectionForm({
  userId,
  accountType,
  onCompleted,
}: IconSelectionFormProps) {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('');
  const [currentTier, setCurrentTier] = useState<'small' | 'medium' | 'large'>('small');
  const [iconConfig, setIconConfig] = useState<IconSelectConfig>({
    small_icon: 'therapy',
    medium_icon: 'therapy',
    large_icon: 'therapy',
    small_coffee_amount: 50,
    medium_coffee_amount: 100,
    large_coffee_amount: 300,
  });
  const [filteredIcons, setFilteredIcons] = useState<any[]>([]);

  // Load user's professional category on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data, error } = await supabase
          .from('personal_data')
          .select('professional_category')
          .eq('user_id', userId)
          .single();

        if (error) throw error;
        if (data?.professional_category) {
          setCategory(data.professional_category);
        }
      } catch (error) {
        console.error('Error loading professional category:', error);
      }
    };

    loadUserData();
  }, [userId]);

  // Update filtered icons when category changes
  useEffect(() => {
    if (!category) {
      setFilteredIcons([]);
      return;
    }

    // Find icons that match the current category and tier
    const categoryIcons = ALL_ICONS.filter(
      (icon) => 
        icon.categoryId === category && 
        icon.tier === currentTier
    );

    setFilteredIcons(categoryIcons);
  }, [category, currentTier]);

  // Handle icon selection
  const handleIconSelect = (iconId: string) => {
    setIconConfig((prev) => ({
      ...prev,
      [currentTier === 'small'
        ? 'small_icon'
        : currentTier === 'medium'
        ? 'medium_icon'
        : 'large_icon']: iconId,
    }));
  };

  // Handle price change
  const handlePriceChange = (tier: 'small' | 'medium' | 'large', e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only digits
    const numericValue = e.target.value.replace(/\D/g, '');
    // Treat empty string as 0, otherwise parse
    const value = numericValue === '' ? 0 : parseInt(numericValue, 10);

    // Ensure value is not NaN
    if (!isNaN(value)) {
      setIconConfig((prev) => ({
        ...prev,
        [`${tier}_coffee_amount`]: value,
      }));
    }
  };

  // Get the icon component by ID
  const getIconComponent = (iconId: string) => {
    const iconData = ALL_ICONS.find((i) => i.id === iconId);
    return iconData ? iconData.icon : Coffee;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!userId) return;

    // --- Validation Start ---
    const { small_coffee_amount, medium_coffee_amount, large_coffee_amount } = iconConfig;

    if (small_coffee_amount <= 0 || medium_coffee_amount <= 0 || large_coffee_amount <= 0) {
      toast.error('Kwoty wsparcia muszą być większe od zera.');
      return;
    }

    if (small_coffee_amount >= medium_coffee_amount) {
      toast.error('Mała kwota musi być mniejsza niż średnia kwota.');
      return;
    }

    if (medium_coffee_amount >= large_coffee_amount) {
      toast.error('Średnia kwota musi być mniejsza niż duża kwota.');
      return;
    }
    // --- Validation End ---

    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({
        small_icon: iconConfig.small_icon,
        medium_icon: iconConfig.medium_icon,
        large_icon: iconConfig.large_icon,
        small_coffee_amount: small_coffee_amount, // Use validated values
        medium_coffee_amount: medium_coffee_amount, // Use validated values
        large_coffee_amount: large_coffee_amount, // Use validated values
      }).eq('id', userId);

      if (error) throw error;

      toast.success('Ikony zostały pomyślnie zapisane');
      onCompleted(); // Only call onCompleted if validation passes and save succeeds
    } catch (error) {
      console.error('Error saving icons:', error);
      toast.error('Nie udało się zapisać wybranych ikon');
    } finally {
      setLoading(false);
    }
  };

  // Get category name from ID
  const getCategoryName = (categoryId: string): string => {
    const category = DONATION_CATEGORIES.find((c) => c.id === categoryId);
    return category ? category.name : 'Nieznana kategoria';
  };

  // If no category is selected, show message
  if (!category) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Wybór ikon</h2>
          <p className="mt-2 text-gray-400">
            Nie znaleziono kategorii zawodowej. Proszę wrócić do poprzedniego kroku i wybrać kategorię.
          </p>
        </div>
        <div className="flex justify-center mt-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onCompleted()}
            className="px-8 py-3 rounded-md text-white font-medium border border-gray-600 hover:border-gray-500 transition-colors duration-200"
          >
            Kontynuuj bez wyboru ikon
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-2 px-2 sm:py-4 sm:px-4">
      <div className="text-center mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Wybór ikon wsparcia</h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-400">
          Wybierz ikony i kwoty, które reprezentują Twoje poziomy wsparcia
        </p>
        <div className="inline-block mt-1.5 px-2 py-0.5 rounded-full bg-[#FF9F2D]/20 text-[#FF9F2D] text-xs">
          Kategoria: {getCategoryName(category)}
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-sm shadow-sm rounded-lg overflow-hidden">
        <div className="p-3 sm:p-4">
          {/* Size selector */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-white mb-2">Wybierz rozmiar</h3>
            <div className="flex bg-black/20 rounded-lg p-0.5">
              {(['small', 'medium', 'large'] as const).map((tier) => (
                <button
                  key={tier}
                  className={`flex-1 py-1.5 px-1 text-xs font-medium rounded-md transition-all ${
                    currentTier === tier
                      ? 'bg-[#FF9F2D] text-white shadow-sm'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  onClick={() => setCurrentTier(tier)}
                >
                  {tier === 'small' ? 'Mały' : tier === 'medium' ? 'Średni' : 'Duży'}
                </button>
              ))}
            </div>
          </div>

          {/* Price configuration */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-white mb-2">Ustal ceny</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['small', 'medium', 'large'] as const).map((tier) => (
                <div key={tier} className="space-y-1">
                  <label
                    htmlFor={`${tier}-price`}
                    className={`block text-xs font-medium ${
                      currentTier === tier ? 'text-[#FF9F2D]' : 'text-gray-300'
                    }`}
                  >
                    {tier === 'small' ? 'Mały' : tier === 'medium' ? 'Średni' : 'Duży'}
                  </label>
                  <input
                    id={`${tier}-price`}
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    min="0"
                    value={iconConfig[`${tier}_coffee_amount`] === 0 ? '' : iconConfig[`${tier}_coffee_amount`].toString()}
                    onChange={(e) => handlePriceChange(tier, e)}
                    className={`w-full px-2 py-1 text-xs border rounded-md bg-white/5 text-white ${
                      currentTier === tier
                        ? 'border-[#FF9F2D] ring-1 ring-[#FF9F2D]'
                        : 'border-gray-700'
                    }`}
                  />
                  <p className="text-[10px] text-gray-400">PLN</p>
                </div>
              ))}
            </div>
          </div>

          {/* Icons grid */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-white mb-2">Wybierz ikonę</h3>
            
            {filteredIcons.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2">
                {filteredIcons.map((icon) => {
                  const IconComponent = icon.icon;
                  const isSelected = iconConfig[
                    currentTier === 'small'
                      ? 'small_icon'
                      : currentTier === 'medium'
                      ? 'medium_icon'
                      : 'large_icon'
                  ] === icon.id;

                  return (
                    <button
                      key={icon.id}
                      className={`p-2 border rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                        isSelected
                          ? 'border-[#FF9F2D] bg-[#FF9F2D]/10 ring-1 ring-[#FF9F2D]'
                          : 'border-gray-700 hover:border-[#FF9F2D]/50 hover:bg-[#FF9F2D]/5'
                      }`}
                      onClick={() => handleIconSelect(icon.id)}
                    >
                      <IconComponent
                        className={`h-5 w-5 ${
                          isSelected ? 'text-[#FF9F2D]' : 'text-gray-300'
                        }`}
                      />
                      <span className="text-[10px] text-center font-medium truncate max-w-full text-gray-300">
                        {icon.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-gray-700 rounded-lg">
                <p className="text-xs text-gray-400">Brak ikon dla wybranej kategorii i rozmiaru.</p>
                <button
                  className="mt-1 text-[#FF9F2D] hover:underline text-xs"
                  onClick={() => setCurrentTier('small')}
                >
                  Spróbuj innego rozmiaru
                </button>
              </div>
            )}
          </div>

          {/* Submit buttons */}
          <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onCompleted()}
              className="w-full sm:w-auto px-3 py-2 rounded-md text-white text-sm font-medium border border-gray-600 hover:border-gray-500 transition-colors duration-200 flex items-center justify-center"
            >
              <ArrowRight className="mr-1.5 h-4 w-4" />
              Pomiń ten krok
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full sm:w-auto px-3 py-2 rounded-md text-white text-sm font-medium ${
                loading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-[#FF9F2D] hover:bg-[#f39729]'
              } transition-colors duration-200 flex items-center justify-center`}
            >
              {loading ? (
                <>
                  <div className="mr-1.5 h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Zapisywanie...
                </>
              ) : (
                <>
                  Zapisz i kontynuuj
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
} 
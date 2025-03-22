import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/DashboardLayout';
import { useProfile } from '../../contexts/ProfileContext';
import IconGallery from './components/IconGallery';
import IconPreview from './components/IconPreview';
import { toast } from 'react-hot-toast';
import { profiles } from '../../lib/profiles';
import { useAuth } from '../../contexts/AuthContext';

export interface IconSelectConfig {
  small_icon: string;
  medium_icon: string;
  large_icon: string;
}

export interface PriceConfig {
  small_coffee_amount: number;
  medium_coffee_amount: number;
  large_coffee_amount: number;
}

export default function Icons() {
  const { profile } = useProfile();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [iconConfig, setIconConfig] = useState<IconSelectConfig>({
    small_icon: '',
    medium_icon: '',
    large_icon: '',
  });
  const [priceConfig, setPriceConfig] = useState<PriceConfig>({
    small_coffee_amount: 15,
    medium_coffee_amount: 50,
    large_coffee_amount: 100,
  });
  const [currentTier, setCurrentTier] = useState<'small' | 'medium' | 'large'>('small');
  const [priceError, setPriceError] = useState<string | null>(null);

  // Initialize with profile data
  useEffect(() => {
    if (profile) {
      setIconConfig({
        small_icon: profile.small_icon || 'coffee',
        medium_icon: profile.medium_icon || 'coffee',
        large_icon: profile.large_icon || 'coffee',
      });
      
      setPriceConfig({
        small_coffee_amount: profile.small_coffee_amount || 15,
        medium_coffee_amount: profile.medium_coffee_amount || 50,
        large_coffee_amount: profile.large_coffee_amount || 100,
      });
    }
  }, [profile]);

  // Handle icon selection
  const handleIconSelect = (iconId: string) => {
    setIconConfig(prev => ({
      ...prev,
      [currentTier === 'small' ? 'small_icon' : 
       currentTier === 'medium' ? 'medium_icon' : 'large_icon']: iconId
    }));
  };

  // Handle price change
  const handlePriceChange = (tier: 'small' | 'medium' | 'large', value: number) => {
    setPriceConfig(prev => ({
      ...prev,
      [`${tier}_coffee_amount`]: value
    }));
    
    // Clear previous error
    setPriceError(null);
  };

  // Validate prices are in ascending order
  const validatePrices = (): boolean => {
    if (priceConfig.small_coffee_amount <= 0 || 
        priceConfig.medium_coffee_amount <= 0 || 
        priceConfig.large_coffee_amount <= 0) {
      setPriceError('Kwoty muszą być większe od zera');
      return false;
    }
    
    if (priceConfig.small_coffee_amount >= priceConfig.medium_coffee_amount) {
      setPriceError('Mała kwota musi być mniejsza niż średnia kwota');
      return false;
    }
    
    if (priceConfig.medium_coffee_amount >= priceConfig.large_coffee_amount) {
      setPriceError('Średnia kwota musi być mniejsza niż duża kwota');
      return false;
    }
    
    return true;
  };

  // Save icon and price configuration
  const saveConfig = async () => {
    if (!user) return;
    
    // Validate prices before saving
    if (!validatePrices()) {
      return;
    }
    
    setLoading(true);
    try {
      const result = await profiles.update(user.id, {
        small_icon: iconConfig.small_icon,
        medium_icon: iconConfig.medium_icon,
        large_icon: iconConfig.large_icon,
        small_coffee_amount: priceConfig.small_coffee_amount,
        medium_coffee_amount: priceConfig.medium_coffee_amount,
        large_coffee_amount: priceConfig.large_coffee_amount
      });
      
      if (result.success) {
        toast.success('Ikony i ceny zostały zaktualizowane');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error('Nie udało się zaktualizować ikon i cen');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-black">Ikony wsparcia</h1>
          <p className="mt-1 text-gray-500">
            Wybierz ikony i ceny, które będą reprezentować różne poziomy wsparcia na Twoim profilu.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Icon Gallery */}
          <motion.div 
            className="md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold tracking-tight text-black mb-4">Galeria ikon</h2>
                
                <IconGallery 
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedIconId={
                    currentTier === 'small' ? iconConfig.small_icon :
                    currentTier === 'medium' ? iconConfig.medium_icon :
                    iconConfig.large_icon
                  }
                  onIconSelect={handleIconSelect}
                  currentTier={currentTier}
                />
              </div>
            </div>
          </motion.div>

          {/* Right column - Icon Preview and Settings */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="p-6">
                <h2 className="text-xl font-bold tracking-tight text-black mb-4">Podgląd</h2>
                
                <IconPreview 
                  iconConfig={iconConfig}
                  currentTier={currentTier}
                  onTierChange={setCurrentTier}
                  priceConfig={priceConfig}
                  onPriceChange={handlePriceChange}
                />

                {priceError && (
                  <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
                    {priceError}
                  </div>
                )}

                <div className="mt-6">
                  <button
                    onClick={saveConfig}
                    disabled={loading}
                    className={`w-full px-4 py-2 rounded-lg text-white ${
                      loading ? 'bg-gray-400' : 'bg-black hover:bg-black/80'
                    } transition-colors flex items-center justify-center`}
                  >
                    {loading ? (
                      <>
                        <span className="mr-2">Zapisywanie</span>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent border-white"></div>
                      </>
                    ) : (
                      'Zapisz wybrane ikony i ceny'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
} 
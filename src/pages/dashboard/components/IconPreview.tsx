import React from 'react';
import { ALL_ICONS } from './IconsData';
import { SmartphoneIcon, ComputerIcon, Coffee } from 'lucide-react';
import { IconSelectConfig, PriceConfig } from '../Icons';

interface IconPreviewProps {
  iconConfig: IconSelectConfig;
  currentTier: 'small' | 'medium' | 'large';
  onTierChange: (tier: 'small' | 'medium' | 'large') => void;
  priceConfig: PriceConfig;
  onPriceChange: (tier: 'small' | 'medium' | 'large', value: number) => void;
}

export default function IconPreview({ 
  iconConfig, 
  currentTier, 
  onTierChange,
  priceConfig,
  onPriceChange
}: IconPreviewProps) {
  // Get icons for preview
  const getIconComponent = (iconId: string) => {
    const iconData = ALL_ICONS.find(i => i.id === iconId);
    if (!iconData) return Coffee; // Default fallback
    return iconData.icon;
  };
  
  const getIconLabel = (iconId: string): string => {
    const iconData = ALL_ICONS.find(i => i.id === iconId);
    return iconData ? iconData.label : 'Wsparcie';
  };
  
  // Handle price input change
  const handlePriceInputChange = (tier: 'small' | 'medium' | 'large', e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow only digits
    const numericValue = e.target.value.replace(/\D/g, '');
    // Treat empty string as 0, otherwise parse
    const value = numericValue === '' ? 0 : parseInt(numericValue, 10);

    // Ensure value is not NaN (although regex should prevent this)
    if (!isNaN(value)) {
      onPriceChange(tier, value);
    }
  };
  
  // Get tier name in Polish
  const getTierNameInPolish = (tier: 'small' | 'medium' | 'large'): string => {
    return tier === 'small' ? 'Mała' : tier === 'medium' ? 'Średnia' : 'Duża';
  };
  
  return (
    <div className="space-y-8">
      {/* Preview mode tabs - simplified, more modern */}
      <div className="flex bg-gray-50 rounded-lg p-1">
        {(['small', 'medium', 'large'] as const).map((tier) => (
          <button
            key={tier}
            className={`flex-1 py-2.5 px-2 text-xs font-medium rounded-md transition-all ${
              currentTier === tier 
                ? 'bg-white text-black shadow-sm' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => onTierChange(tier)}
          >
            {getTierNameInPolish(tier)}
          </button>
        ))}
      </div>
      
      {/* Price configuration - more visually appealing */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">Ceny wsparcia</h3>
          <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">PLN</div>
        </div>
        
        <div className="grid grid-cols-3 gap-5">
          {(['small', 'medium', 'large'] as const).map((tier) => (
            <div key={tier} className="space-y-2">
              <div className={`p-3 rounded-lg ${currentTier === tier ? 'bg-gray-50' : ''}`}>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor={`${tier}-price`} className={`block text-xs font-medium ${
                    currentTier === tier ? 'text-black' : 'text-gray-500'
                  }`}>
                    {getTierNameInPolish(tier)}
                  </label>
                  
                  {currentTier === tier && (
                    <div className="w-2 h-2 rounded-full bg-[#FF8C3B]"></div>
                  )}
                </div>
                
                <input
                  id={`${tier}-price`}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  min="0"
                  value={priceConfig[`${tier}_coffee_amount`] === 0 ? '' : priceConfig[`${tier}_coffee_amount`].toString()}
                  onChange={(e) => handlePriceInputChange(tier, e)}
                  className={`w-full px-3 py-2 text-sm text-center border rounded-md transition-all ${
                    currentTier === tier 
                      ? 'border-[#FF8C3B] ring-1 ring-[#FF8C3B] bg-white' 
                      : 'border-gray-200 bg-gray-50'
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Preview section - more minimalistic */}
      <div className="bg-gray-50 rounded-lg p-5 pt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Podgląd wybranej ikony</h3>
        
        {/* Current selection display */}
        <div className="flex items-center justify-center mb-6">
          {(() => {
            const currentIcon = 
              currentTier === 'small' ? iconConfig.small_icon :
              currentTier === 'medium' ? iconConfig.medium_icon :
              iconConfig.large_icon;
            
            const IconComponent = getIconComponent(currentIcon);
            const currentPrice = 
              currentTier === 'small' ? priceConfig.small_coffee_amount :
              currentTier === 'medium' ? priceConfig.medium_coffee_amount :
              priceConfig.large_coffee_amount;
            
            return (
              <div className="flex flex-col items-center">
                <div className="p-4 bg-white rounded-full shadow-sm border border-gray-200 mb-3">
                  <IconComponent className="h-8 w-8 text-[#FF8C3B]" />
                </div>
                <p className="font-medium text-sm">{getIconLabel(currentIcon)}</p>
                <p className="text-sm text-gray-500">{currentPrice} PLN</p>
              </div>
            );
          })()}
        </div>
        
        {/* Device preview indicators */}
        <div className="flex space-x-4 justify-center text-xs text-gray-500">
          <div className="flex items-center">
            <SmartphoneIcon className="h-4 w-4 mr-1 text-gray-400" />
            <span>Mobile</span>
          </div>
          <div className="flex items-center">
            <ComputerIcon className="h-4 w-4 mr-1 text-gray-400" />
            <span>Desktop</span>
          </div>
        </div>
      </div>
      
      {/* Summary section - simplified */}
      <div className="border-t border-gray-100 pt-5">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Wybrane ikony i ceny</h3>
        
        <div className="space-y-3">
          {(['small', 'medium', 'large'] as const).map(tier => {
            const iconId = iconConfig[`${tier}_icon`];
            const IconComponent = getIconComponent(iconId);
            const price = priceConfig[`${tier}_coffee_amount`];
            
            return (
              <div 
                key={tier} 
                className={`flex items-center p-2 rounded-lg ${
                  currentTier === tier ? 'bg-gray-50' : ''
                }`}
              >
                <div className="mr-3 p-1.5 bg-white rounded-md border border-gray-100">
                  <IconComponent className="h-4 w-4 text-[#FF8C3B]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium">
                    {getTierNameInPolish(tier)}
                    <span className="ml-1 text-gray-500">({price} PLN)</span>
                  </p>
                  <p className="text-xs text-gray-500">{getIconLabel(iconId)}</p>
                </div>
                <button
                  onClick={() => onTierChange(tier)}
                  className={`text-xs ${
                    currentTier === tier ? 'text-[#FF8C3B]' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  Edytuj
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 
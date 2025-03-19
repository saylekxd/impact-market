import React, { useState, useEffect } from 'react';
import { Check, Droplets, Coffee, Waves, Sandwich, UtensilsCrossed, Soup, Pill, Stethoscope, Ambulance, Leaf, TreePine, Mountain, Wind, Sprout, TreeDeciduous, Bird, Users, Globe, PenTool, BookOpen, Backpack, Monitor, Laptop, GraduationCap, Utensils, Bone, Home, Palette, Brush, Building } from 'lucide-react';

// Define the categorized icons using Lucide components
const DONATION_CATEGORIES = [
  {
    id: 'humanitarian',
    name: 'Pomoc humanitarna',
    icon: Globe,
    icons: [
      { id: 'water_sip', icon: Droplets, label: 'Łyk wody', tier: 'small' },
      { id: 'water_bottle', icon: Coffee, label: 'Butelka wody', tier: 'medium' },
      { id: 'village_well', icon: Waves, label: 'Studnia dla wioski', tier: 'large' }
    ]
  },
  {
    id: 'food',
    name: 'Nakarm kogoś',
    icon: UtensilsCrossed,
    icons: [
      { id: 'sandwich', icon: Sandwich, label: 'Kanapka dla dziecka', tier: 'small' },
      { id: 'warm_meal', icon: UtensilsCrossed, label: 'Ciepły posiłek', tier: 'medium' },
      { id: 'family_meals', icon: Soup, label: 'Obiady dla rodziny', tier: 'large' }
    ]
  },
  {
    id: 'medical',
    name: 'Pomóż w leczeniu',
    icon: Stethoscope,
    icons: [
      { id: 'first_aid', icon: Pill, label: 'Leki na pierwszą pomoc', tier: 'small' },
      { id: 'doctor_visit', icon: Stethoscope, label: 'Wizyta u lekarza', tier: 'medium' },
      { id: 'life_saving', icon: Ambulance, label: 'Ratowanie życia', tier: 'large' }
    ]
  },
  {
    id: 'ecology',
    name: 'Ekologia i planeta',
    icon: Leaf,
    icons: [
      { id: 'small_plant', icon: Sprout, label: 'Mała sadzonka', tier: 'small' },
      { id: 'tree', icon: TreePine, label: 'Dojrzałe drzewo', tier: 'medium' },
      { id: 'forest', icon: TreeDeciduous, label: 'Cały las', tier: 'large' }
    ]
  },
  {
    id: 'nature',
    name: 'Chroń naturę',
    icon: Wind,
    icons: [
      { id: 'green_leaf', icon: Leaf, label: 'Zielony listek', tier: 'small' },
      { id: 'new_plant', icon: Sprout, label: 'Nowa roślina', tier: 'medium' }, 
      { id: 'ecosystem', icon: Mountain, label: 'Odnowa ekosystemu', tier: 'large' }
    ]
  },
  {
    id: 'animals',
    name: 'Ratuj zwierzęta',
    icon: Bird,
    icons: [
      { id: 'bird_nest', icon: Bird, label: 'Pisklę w gnieździe', tier: 'small' },
      { id: 'animal_family', icon: Users, label: 'Opieka nad rodziną zwierząt', tier: 'medium' },
      { id: 'reserve', icon: Globe, label: 'Ochrona rezerwatu', tier: 'large' }
    ]
  },
  {
    id: 'education',
    name: 'Edukacja dla każdego',
    icon: BookOpen,
    icons: [
      { id: 'notebook', icon: PenTool, label: 'Zeszyt i długopis', tier: 'small' },
      { id: 'textbook', icon: BookOpen, label: 'Podręcznik szkolny', tier: 'medium' },
      { id: 'school_supplies', icon: Backpack, label: 'Cała wyprawka', tier: 'large' }
    ]
  },
  {
    id: 'online_learning',
    name: 'Dostęp do nauki',
    icon: Monitor,
    icons: [
      { id: 'online_hour', icon: Monitor, label: 'Godzina nauki online', tier: 'small' },
      { id: 'laptop', icon: Laptop, label: 'Laptop dla ucznia', tier: 'medium' },
      { id: 'scholarship', icon: GraduationCap, label: 'Stypendium edukacyjne', tier: 'large' }
    ]
  },
  {
    id: 'pet_help',
    name: 'Pomoc dla zwierząt',
    icon: Bone,
    icons: [
      { id: 'pet_food', icon: Utensils, label: 'Puszka karmy', tier: 'small' },
      { id: 'pet_bed', icon: Bone, label: 'Legowisko i leczenie', tier: 'medium' },
      { id: 'pet_care', icon: Home, label: 'Opieka przez rok', tier: 'large' }
    ]
  },
  {
    id: 'arts',
    name: 'Kultura i sztuka',
    icon: Palette,
    icons: [
      { id: 'art_supplies', icon: Palette, label: 'Pędzel i farby', tier: 'small' },
      { id: 'art_project', icon: Brush, label: 'Wsparcie jednego projektu', tier: 'medium' },
      { id: 'art_festival', icon: Building, label: 'Festiwal sztuki', tier: 'large' }
    ]
  }
];

// Flatten the list for easier lookup
const ALL_ICONS = DONATION_CATEGORIES.flatMap(category => 
  category.icons.map(icon => ({
    ...icon,
    categoryId: category.id,
    categoryName: category.name,
    categoryIcon: category.icon
  }))
);

export interface CoffeeIconsConfig {
  small_icon: string;
  medium_icon: string;
  large_icon: string;
  small_coffee_amount: number;
  medium_coffee_amount: number;
  large_coffee_amount: number;
}

interface CoffeeIconsSelectorProps {
  value: CoffeeIconsConfig;
  onChange: (value: CoffeeIconsConfig) => void;
}

export default function CoffeeIconsSelector({ value, onChange }: CoffeeIconsSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('humanitarian'); // Default to first category
  const [selectedTier, setSelectedTier] = useState<'small' | 'medium' | 'large'>('small');
  
  // Helper to update a specific icon type and its amount
  const updateIcon = (
    type: 'small_icon' | 'medium_icon' | 'large_icon',
    amountType: 'small_coffee_amount' | 'medium_coffee_amount' | 'large_coffee_amount',
    iconId: string,
    amount?: number
  ) => {
    onChange({
      ...value,
      [type]: iconId,
      ...(amount !== undefined ? { [amountType]: amount } : {})
    });
  };

  // Get the icon component for an icon by ID
  const getIconComponent = (iconId: string) => {
    const icon = ALL_ICONS.find(i => i.id === iconId);
    if (!icon) return null;
    
    const IconComponent = icon.icon;
    return IconComponent;
  };

  // Get the label for an icon by ID
  const getIconLabel = (iconId: string): string => {
    const icon = ALL_ICONS.find(i => i.id === iconId);
    return icon ? icon.label : 'Wsparcie';
  };

  // Filter icons by selected category and tier
  const getFilteredCategories = () => {
    return DONATION_CATEGORIES.filter(category => category.id === selectedCategory);
  };

  // Get the appropriate icons based on selected tier - filter by tier
  const getIconsForTier = (icons: typeof DONATION_CATEGORIES[0]['icons']) => {
    // Only show icons that are recommended for the current tier
    return icons.filter(icon => icon.tier === selectedTier);
  };

  // Type-safe way to get a property from value by tier
  const getValueByTier = (tier: 'small' | 'medium' | 'large', property: 'icon' | 'coffee_amount'): string | number => {
    if (property === 'icon') {
      return tier === 'small' ? value.small_icon :
             tier === 'medium' ? value.medium_icon :
             value.large_icon;
    } else {
      return tier === 'small' ? value.small_coffee_amount :
             tier === 'medium' ? value.medium_coffee_amount :
             value.large_coffee_amount;
    }
  };

  // Selected icon ID in current tier
  const currentIconId = getValueByTier(selectedTier, 'icon') as string;
  // Selected amount in current tier
  const currentAmount = getValueByTier(selectedTier, 'coffee_amount') as number;

  // Ensure the currently selected icon is always included
  const ensureSelectedIconIsVisible = () => {
    // If we have an icon selection but it's not visible in the current category,
    // switch to the category containing that icon
    if (currentIconId) {
      const selectedIcon = ALL_ICONS.find(icon => icon.id === currentIconId);
      if (selectedIcon && selectedIcon.categoryId !== selectedCategory) {
        setSelectedCategory(selectedIcon.categoryId);
      }
    }
  };

  // When tier changes, make sure the selected icon is visible
  useEffect(() => {
    ensureSelectedIconIsVisible();
  }, [selectedTier]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Konfiguracja ikon wsparcia</h3>
      <p className="text-sm text-gray-500 mb-6">
        Wybierz ikony dla każdego poziomu wsparcia na Twoim profilu.
      </p>

      {/* Donation tier tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px" aria-label="Tabs">
          {[
            { tier: 'small', label: 'Mała kwota', iconId: value.small_icon },
            { tier: 'medium', label: 'Średnia kwota', iconId: value.medium_icon },
            { tier: 'large', label: 'Duża kwota', iconId: value.large_icon }
          ].map(({ tier, label, iconId }) => {
            // Check if this tier has an icon assigned
            const hasIconAssigned = !!iconId;
            
            return (
              <button
                key={tier}
                type="button"
                onClick={() => setSelectedTier(tier as 'small' | 'medium' | 'large')}
                className={`py-4 px-6 font-medium text-sm border-b-2 relative ${
                  selectedTier === tier
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="flex items-center">
                  {label}
                  {hasIconAssigned && selectedTier !== tier && (
                    <span className="ml-2 h-2 w-2 bg-green-500 rounded-full"></span>
                  )}
                </span>
                
                {/* Show icon preview in the tab */}
                {hasIconAssigned && (
                  <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 translate-y-1/2 bg-white rounded-full p-1 border border-gray-200">
                    {(() => {
                      const IconComponent = getIconComponent(iconId);
                      return IconComponent ? (
                        <IconComponent className="h-3 w-3 text-gray-400" />
                      ) : null;
                    })()}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Amount input for selected tier */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <label 
            htmlFor={`${selectedTier}_coffee_amount`} 
            className="block text-sm font-medium text-gray-700"
          >
            Kwota wsparcia
          </label>
          <div className="w-1/3">
            <div className="relative rounded-md shadow-sm">
              <input
                type="number"
                id={`${selectedTier}_coffee_amount`}
                value={(currentAmount / 100)}
                onChange={(e) => {
                  const amount = Math.max(1, parseInt(e.target.value) || 0) * 100;
                  const newValue = { ...value };
                  if (selectedTier === 'small') {
                    newValue.small_coffee_amount = amount;
                  } else if (selectedTier === 'medium') {
                    newValue.medium_coffee_amount = amount;
                  } else {
                    newValue.large_coffee_amount = amount;
                  }
                  onChange(newValue);
                }}
                className="focus:ring-green-500 focus:border-green-500 block w-full pl-3 pr-8 sm:text-sm border-gray-300 rounded-md"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">PLN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Currently selected icon preview */}
        <div className="flex items-center p-4 bg-gray-50 rounded-lg mb-6">
          <div className="mr-3 p-3 bg-white rounded-lg shadow-sm">
            {(() => {
              const IconComponent = getIconComponent(currentIconId);
              return IconComponent ? (
                <IconComponent className="h-6 w-6 text-blue-500" />
              ) : (
                <div className="h-6 w-6 bg-gray-200 rounded-full" />
              );
            })()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {getIconLabel(currentIconId)}
            </p>
            <p className="text-xs text-gray-500">
              {(currentAmount / 100).toFixed(0)} PLN
            </p>
          </div>
        </div>
      </div>

      {/* Category navigation */}
      <div className="flex flex-wrap gap-2 mb-4">
        {DONATION_CATEGORIES.map(category => {
          const CategoryIcon = category.icon;
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-2 text-sm rounded-md flex items-center space-x-1 ${
                selectedCategory === category.id
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              <CategoryIcon className="h-4 w-4 mr-1" />
              <span>{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* Icon selection grid */}
      <div className="space-y-6">
        {getFilteredCategories().map(category => {
          const filteredIcons = getIconsForTier(category.icons);
          if (filteredIcons.length === 0) return null;
          
          return (
            <div key={category.id} className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                <category.icon className="h-4 w-4 mr-2" />
                {category.name}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredIcons.map(iconItem => {
                  const IconComponent = iconItem.icon;
                  const isSelected = currentIconId === iconItem.id;
                  const isRecommendedForTier = iconItem.tier === selectedTier;
                  
                  // Check if this icon is selected in any tier
                  const isSelectedInSmall = value.small_icon === iconItem.id;
                  const isSelectedInMedium = value.medium_icon === iconItem.id;
                  const isSelectedInLarge = value.large_icon === iconItem.id;
                  
                  // Show tier badge if the icon is selected in any tier different from current
                  const showSmallBadge = isSelectedInSmall && selectedTier !== 'small';
                  const showMediumBadge = isSelectedInMedium && selectedTier !== 'medium';
                  const showLargeBadge = isSelectedInLarge && selectedTier !== 'large';
                  
                  return (
                    <button
                      key={iconItem.id}
                      type="button"
                      onClick={() => updateIcon(
                        `${selectedTier}_icon` as 'small_icon' | 'medium_icon' | 'large_icon',
                        `${selectedTier}_coffee_amount` as 'small_coffee_amount' | 'medium_coffee_amount' | 'large_coffee_amount',
                        iconItem.id
                      )}
                      className={`relative flex items-center p-3 rounded-lg border ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : isRecommendedForTier
                            ? 'border-blue-200 bg-blue-50/30'
                            : (showSmallBadge || showMediumBadge || showLargeBadge)
                              ? 'border-gray-300 bg-gray-50'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
                      }`}
                    >
                      <div className="mr-3">
                        <IconComponent className={`h-5 w-5 ${
                          isSelected 
                            ? 'text-blue-500' 
                            : isRecommendedForTier 
                              ? 'text-blue-400' 
                              : 'text-gray-400'
                        }`} />
                      </div>
                      <span className={`text-sm ${
                        isSelected 
                          ? 'text-blue-700 font-medium' 
                          : isRecommendedForTier 
                            ? 'text-blue-600' 
                            : 'text-gray-600'
                      }`}>
                        {iconItem.label}
                      </span>
                      
                      {/* Recommended tier indicator */}
                      {isRecommendedForTier && !isSelected && (
                        <div className="absolute -top-1 -right-1 h-4 w-4 bg-blue-100 rounded-full flex items-center justify-center">
                          <div className="h-2 w-2 bg-blue-400 rounded-full"></div>
                        </div>
                      )}
                      
                      {/* Selection indicator */}
                      {isSelected && !showSmallBadge && !showMediumBadge && !showLargeBadge && (
                        <div className="absolute top-1 right-1">
                          <Check className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                      
                      {/* Tier badges */}
                      {(showSmallBadge || showMediumBadge || showLargeBadge) && (
                        <div className="absolute top-1 right-1 flex gap-1">
                          {showSmallBadge && (
                            <div className="h-4 w-4 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-[8px] font-bold">
                              S
                            </div>
                          )}
                          {showMediumBadge && (
                            <div className="h-4 w-4 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center text-[8px] font-bold">
                              M
                            </div>
                          )}
                          {showLargeBadge && (
                            <div className="h-4 w-4 bg-red-100 text-red-800 rounded-full flex items-center justify-center text-[8px] font-bold">
                              L
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 
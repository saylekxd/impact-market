import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { DONATION_CATEGORIES, ALL_ICONS } from './IconsData';

interface IconGalleryProps {
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedIconId: string;
  onIconSelect: (iconId: string) => void;
  currentTier: 'small' | 'medium' | 'large';
}

export default function IconGallery({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  selectedIconId,
  onIconSelect,
  currentTier
}: IconGalleryProps) {
  const [filteredIcons, setFilteredIcons] = useState(ALL_ICONS);

  // Apply filtering based on category and search query
  useEffect(() => {
    let result = [...ALL_ICONS];
    
    // Filter by category if one is selected
    if (selectedCategory) {
      result = result.filter(icon => icon.categoryId === selectedCategory);
    }
    
    // Filter by search query if provided
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(icon => 
        icon.id.toLowerCase().includes(query) ||
        icon.label.toLowerCase().includes(query) ||
        icon.categoryName.toLowerCase().includes(query)
      );
    }
    
    // Filter by current tier
    result = result.filter(icon => icon.tier === currentTier);
    
    setFilteredIcons(result);
  }, [selectedCategory, searchQuery, currentTier]);

  return (
    <div className="space-y-6">
      {/* Search bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF8C3B] focus:border-[#FF8C3B] sm:text-sm"
          placeholder="Szukaj ikony..."
        />
        {searchQuery && (
          <button
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => onSearchChange('')}
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-500" />
          </button>
        )}
      </div>

      {/* Category filtering */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-3 py-1.5 text-xs font-medium rounded-full ${
            selectedCategory === null 
              ? 'bg-[#FF8C3B] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Wszystkie
        </button>
        
        {DONATION_CATEGORIES.map(category => {
          // Only show categories that have icons for the current tier
          const hasTierIcons = category.icons.some(icon => icon.tier === currentTier);
          if (!hasTierIcons) return null;
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full flex items-center ${
                selectedCategory === category.id 
                  ? 'bg-[#FF8C3B] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <category.icon className="h-3.5 w-3.5 mr-1.5" />
              {category.name}
            </button>
          );
        })}
      </div>
      
      {/* Icons grid */}
      {filteredIcons.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredIcons.map(icon => {
            const IconComponent = icon.icon;
            const isSelected = selectedIconId === icon.id;
            
            return (
              <button
                key={icon.id}
                className={`p-4 border rounded-lg flex flex-col items-center justify-center gap-2 transition-all ${
                  isSelected 
                    ? 'border-[#FF8C3B] bg-[#FF8C3B]/5 ring-2 ring-[#FF8C3B]' 
                    : 'border-gray-200 hover:border-[#FF8C3B] hover:bg-[#FF8C3B]/5'
                }`}
                onClick={() => onIconSelect(icon.id)}
              >
                <IconComponent className={`h-8 w-8 ${isSelected ? 'text-[#FF8C3B]' : 'text-gray-700'}`} />
                <span className="text-xs text-center font-medium truncate max-w-full">
                  {icon.label}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">Nie znaleziono żadnych ikon.</p>
          {searchQuery && (
            <button
              className="mt-2 text-[#FF8C3B] hover:underline text-sm"
              onClick={() => {
                onSearchChange('');
                onCategoryChange(null);
              }}
            >
              Wyczyść filtry
            </button>
          )}
        </div>
      )}
    </div>
  );
} 
import React, { useState, useRef } from 'react';
import { useProfile } from '../../../contexts/ProfileContext';
import { motion } from 'framer-motion';
import { Link, ExternalLink, Copy, Check, Camera, X, Instagram, Twitter, Facebook, Globe, Youtube } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SocialLinks {
  website?: string;
  instagram?: string;
  twitter?: string;
  facebook?: string;
  youtube?: string;
}

interface ProfileFormProps {
  formData: {
    display_name: string;
    bio: string;
    avatar_url: string;
    small_coffee_amount: number;
    medium_coffee_amount: number;
    large_coffee_amount: number;
    small_icon: string;
    medium_icon: string;
    large_icon: string;
    social_links?: SocialLinks;
  };
  onChange: (data: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ProfileForm({ formData, onChange, onSubmit }: ProfileFormProps) {
  const { profile } = useProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(formData.avatar_url || null);
  const [copied, setCopied] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  // Handle social links changes
  const handleSocialLinkChange = (platform: keyof SocialLinks, value: string) => {
    onChange({
      ...formData,
      social_links: {
        ...(formData.social_links || {}),
        [platform]: value
      }
    });
  };
  
  // Copy profile link to clipboard
  const copyProfileLink = () => {
    if (!profile?.username) return;
    
    const profileUrl = `${window.location.origin}/${profile.username}`;
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true);
      toast.success('Link skopiowany do schowka');
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Plik jest zbyt duży. Maksymalny rozmiar to 2MB.');
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Można przesyłać tylko pliki graficzne.');
      return;
    }
    
    // Show local preview
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImagePreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    
    // In a real implementation, you would upload the file to your server or storage service
    // For demonstration, we'll simulate an upload
    setUploadingImage(true);
    
    // Simulating upload delay
    setTimeout(() => {
      // This is where you would normally get the URL back from your server
      const fakeUploadedUrl = URL.createObjectURL(file);
      
      onChange({
        ...formData,
        avatar_url: fakeUploadedUrl
      });
      
      setUploadingImage(false);
      toast.success('Zdjęcie profilowe zostało zaktualizowane');
    }, 1500);
  };
  
  // Clear the avatar image
  const clearAvatar = () => {
    setImagePreview(null);
    onChange({
      ...formData,
      avatar_url: ''
    });
  };

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-6">
      {/* Profile Image Section */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center"
      >
        <div className="relative group mb-3">
          <div className={`h-24 w-24 rounded-full overflow-hidden border-2 border-gray-200 flex items-center justify-center bg-gray-100 ${uploadingImage ? 'opacity-50' : ''}`}>
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-gray-400">
                {formData.display_name?.[0] || profile?.username?.[0] || '?'}
              </span>
            )}
            
            {uploadingImage && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          <div className="absolute bottom-0 right-0 flex space-x-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-[#FF8C3B] text-white p-2 rounded-full hover:bg-orange-600 transition-colors shadow-sm"
            >
              <Camera className="h-4 w-4" />
            </button>
            
            {imagePreview && (
              <button
                type="button"
                onClick={clearAvatar}
                className="bg-gray-100 text-gray-500 p-2 rounded-full hover:bg-gray-200 transition-colors shadow-sm"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>
        
        <p className="text-sm text-gray-500">Zalecany rozmiar: 500x500px</p>
      </motion.div>
      
      {/* Shareable Profile Link */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link className="h-5 w-5 text-gray-500 mr-2" />
            <div>
              <h3 className="text-sm font-medium text-gray-700">Twój publiczny profil</h3>
              <p className="text-xs text-gray-500 mt-1">Udostępnij ten link, aby inni mogli Cię wesprzeć</p>
            </div>
          </div>
          
          <a
            href={`/${profile?.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#FF8C3B] hover:underline ml-3 flex items-center"
          >
            <ExternalLink className="h-3 w-3 mr-1" /> Podgląd
          </a>
        </div>
        
        <div className="mt-3 flex items-center">
          <div className="flex-1 bg-white border border-gray-300 rounded-l-md p-2 text-sm text-gray-600 truncate">
            {profile?.username ? `${window.location.origin}/${profile.username}` : 'Trwa ładowanie...'}
          </div>
          <button
            type="button"
            onClick={copyProfileLink}
            className={`px-3 py-2 rounded-r-md transition-colors ${
              copied ? 'bg-green-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
            }`}
          >
            {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
          </button>
        </div>
      </motion.div>

      {/* Basic Profile Information */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 mb-1">
          Wyświetlana nazwa
        </label>
        <input
          type="text"
          id="display_name"
          value={formData.display_name}
          onChange={(e) => onChange({ ...formData, display_name: e.target.value })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
          Bio
        </label>
        <textarea
          id="bio"
          rows={4}
          value={formData.bio}
          onChange={(e) => onChange({ ...formData, bio: e.target.value })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
          placeholder="Napisz krótko o sobie, czym się zajmujesz i dlaczego warto Cię wesprzeć"
        />
      </motion.div>
      
      {/* Social Media Links */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="pt-4 border-t border-gray-200"
      >
        <h3 className="text-sm font-medium text-gray-700 mb-3">Media społecznościowe</h3>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <Globe className="h-5 w-5 text-gray-400 mr-3" />
            <input
              type="url"
              placeholder="Twoja strona internetowa"
              value={formData.social_links?.website || ''}
              onChange={(e) => handleSocialLinkChange('website', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
            />
          </div>
          
          <div className="flex items-center">
            <Instagram className="h-5 w-5 text-gray-400 mr-3" />
            <input
              type="url"
              placeholder="Profil Instagram"
              value={formData.social_links?.instagram || ''}
              onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
            />
          </div>
          
          <div className="flex items-center">
            <Twitter className="h-5 w-5 text-gray-400 mr-3" />
            <input
              type="url"
              placeholder="Profil Twitter"
              value={formData.social_links?.twitter || ''}
              onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
            />
          </div>
          
          <div className="flex items-center">
            <Facebook className="h-5 w-5 text-gray-400 mr-3" />
            <input
              type="url"
              placeholder="Profil Facebook"
              value={formData.social_links?.facebook || ''}
              onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
            />
          </div>
          
          <div className="flex items-center">
            <Youtube className="h-5 w-5 text-gray-400 mr-3" />
            <input
              type="url"
              placeholder="Kanał YouTube"
              value={formData.social_links?.youtube || ''}
              onChange={(e) => handleSocialLinkChange('youtube', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
            />
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.6 }}
        className="mt-8"
      >
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        >
          Zapisz zmiany
        </button>
      </motion.div>
    </form>
  );
}
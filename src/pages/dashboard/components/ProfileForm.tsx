import React, { useState, useRef, useEffect } from 'react';
import { useProfile } from '../../../contexts/ProfileContext';
import { motion } from 'framer-motion';
import { Link, ExternalLink, Copy, Check, Camera, X, Instagram, Twitter, Facebook, Globe, Youtube, UploadCloud, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { uploadOrganizationPhoto } from '../../../lib/storage';
import { supabase } from '../../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// Define the type for the data passed by onSubmit
type ProfileFormData = ProfileFormProps['formData'];

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
    organization_history?: string;
    organization_mission?: string;
    organization_photos?: string[];
    small_coffee_amount: number;
    medium_coffee_amount: number;
    large_coffee_amount: number;
    small_icon: string;
    medium_icon: string;
    large_icon: string;
    social_links?: SocialLinks;
  };
  onChange: (data: Partial<ProfileFormData>) => void;
  onSubmit: (dataToSave: ProfileFormData) => void;
}

interface OrgPhoto {
  id: string;
  file?: File;
  previewUrl: string;
  isUploading?: boolean;
  uploadError?: string;
  isNew: boolean;
}

const BUCKET_NAME = 'organization-photos';
function getFilePathFromUrl(url: string): string | null {
  try {
    const urlObject = new URL(url);
    const pathSegments = urlObject.pathname.split('/');
    const bucketIndex = pathSegments.indexOf(BUCKET_NAME);
    if (bucketIndex === -1 || bucketIndex + 1 >= pathSegments.length) {
      console.error('Cannot find bucket name in URL path:', url);
      return null;
    }
    return pathSegments.slice(bucketIndex + 1).join('/');
  } catch (error) {
    console.error('Error parsing URL:', url, error);
    return null;
  }
}

export default function ProfileForm({ formData, onChange, onSubmit }: ProfileFormProps) {
  const { profile } = useProfile();
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const orgPhotosFileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(formData.avatar_url || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [copied, setCopied] = useState(false);
  const [organizationPhotos, setOrganizationPhotos] = useState<OrgPhoto[]>([]);
  const [isProcessingOrgPhotos, setIsProcessingOrgPhotos] = useState(false);
  const MAX_ORG_PHOTOS = 5;

  useEffect(() => {
    const initialPhotos = (formData.organization_photos || []).map(url => ({
      id: url,
      previewUrl: url,
      isNew: false,
    }));
    setOrganizationPhotos(initialPhotos);
  }, [formData.organization_photos]);

  const handleSocialLinkChange = (platform: keyof SocialLinks, value: string) => {
    onChange({
      ...formData,
      social_links: {
        ...(formData.social_links || {}),
        [platform]: value
      }
    });
  };
  
  const copyProfileLink = () => {
    if (!profile?.username) return;
    
    const profileUrl = `${window.location.origin}/${profile.username}`;
    navigator.clipboard.writeText(profileUrl).then(() => {
      setCopied(true);
      toast.success('Link skopiowany do schowka');
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Plik jest zbyt duży. Maksymalny rozmiar to 2MB.');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Można przesyłać tylko pliki graficzne.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatarPreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    
    setUploadingAvatar(true);
    setTimeout(() => {
      const fakeUploadedUrl = URL.createObjectURL(file);
      onChange({ avatar_url: fakeUploadedUrl });
      setUploadingAvatar(false);
      toast.success('Zdjęcie profilowe zaktualizowane (symulacja).');
    }, 1500);
  };
  
  const clearAvatar = () => {
    setAvatarPreview(null);
    onChange({ avatar_url: '' });
  };

  const handleOrganizationPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const currentPhotoCount = organizationPhotos.length;
    const availableSlots = MAX_ORG_PHOTOS - currentPhotoCount;

    if (files.length > availableSlots) {
      toast.error(`Możesz dodać jeszcze tylko ${availableSlots} zdjęć (limit: ${MAX_ORG_PHOTOS}).`);
    }

    const acceptedFiles = Array.from(files).slice(0, availableSlots);
    const newPhotos: OrgPhoto[] = [];

    acceptedFiles.forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`Plik ${file.name} jest zbyt duży (max 2MB).`);
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`Plik ${file.name} nie jest zdjęciem.`);
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      const photoId = uuidv4();
      newPhotos.push({ 
        id: photoId,
        file: file,
        previewUrl: previewUrl,
        isNew: true 
      });
    });

    if (newPhotos.length > 0) {
      setOrganizationPhotos(prev => [...prev, ...newPhotos]);
    }
    
    e.target.value = ''; 
  };

  const handleRemoveOrganizationPhoto = async (idToRemove: string) => {
    const photoToRemove = organizationPhotos.find(p => p.id === idToRemove);
    if (!photoToRemove) return;

    setOrganizationPhotos(prev => prev.filter(p => p.id !== idToRemove));

    if (!photoToRemove.isNew) {
      const filePath = getFilePathFromUrl(photoToRemove.previewUrl);
      if (filePath) {
        try {
          console.log(`Attempting to remove photo from storage: ${filePath}`);
          const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
          if (error) {
            console.error('Error removing photo from storage:', error);
            toast.error('Nie udało się usunąć zdjęcia z magazynu.');
            setOrganizationPhotos(prev => [...prev, photoToRemove].sort(/* optional sort logic */)); 
          } else {
            toast.success('Zdjęcie usunięte z magazynu.');
            const finalUrls = organizationPhotos.filter(p => p.id !== idToRemove && !p.isNew).map(p => p.previewUrl);
            onChange({ organization_photos: finalUrls });
          }
        } catch (err) {
          console.error('Exception during photo removal:', err);
          toast.error('Wystąpił błąd podczas usuwania zdjęcia.');
          setOrganizationPhotos(prev => [...prev, photoToRemove].sort(/* optional sort logic */)); 
        }
      } else {
        console.warn('Could not extract file path to remove photo:', photoToRemove.previewUrl);
      }
    } else {
      if (photoToRemove.previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(photoToRemove.previewUrl);
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
        toast.error("Nie można zapisać zmian, brak danych użytkownika.");
        return;
    }
    if (isProcessingOrgPhotos) return;

    setIsProcessingOrgPhotos(true);
    let finalPhotoUrls: string[] = [];
    let uploadErrorOccurred = false;

    const existingUrls = organizationPhotos
      .filter(p => !p.isNew)
      .map(p => p.previewUrl);

    const photosToUpload = organizationPhotos.filter(p => p.isNew && p.file);

    const uploadPromises = photosToUpload.map(async (photo) => {
      if (!photo.file) return null; 

      setOrganizationPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, isUploading: true, uploadError: undefined } : p));
      
      try {
        const uploadedUrl = await uploadOrganizationPhoto(profile.id, photo.file);
        
        setOrganizationPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, isUploading: false, previewUrl: uploadedUrl, isNew: false, id: uploadedUrl, file: undefined } : p));
        return uploadedUrl;
      } catch (error: any) {
        console.error(`Failed to upload photo ${photo.file.name}:`, error);
        setOrganizationPhotos(prev => prev.map(p => p.id === photo.id ? { ...p, isUploading: false, uploadError: error.message || 'Upload failed' } : p));
        uploadErrorOccurred = true;
        return null;
      }
    });

    try {
      const uploadedUrls = await Promise.all(uploadPromises);
      const successfullyUploadedUrls = uploadedUrls.filter((url): url is string => typeof url === 'string' && url.length > 0);
      finalPhotoUrls = [...existingUrls, ...successfullyUploadedUrls];

      if (uploadErrorOccurred) {
        toast.error('Niektóre zdjęcia nie zostały przesłane. Zapisano pomyślnie przesłane zdjęcia.');
      }
      
      const dataToSave: ProfileFormData = {
        ...formData,
        organization_photos: finalPhotoUrls
      };

      onSubmit(dataToSave); 
      
      setOrganizationPhotos(prev => prev.filter(p => finalPhotoUrls.includes(p.previewUrl)).map(p => ({ ...p, uploadError: undefined, isUploading: false })));
      
      setIsProcessingOrgPhotos(false); 

    } catch (error) {
      console.error('Error processing photo uploads:', error);
      toast.error('Wystąpił błąd podczas przetwarzania zdjęć.');
      setIsProcessingOrgPhotos(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="mt-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center"
      >
        <div className="relative group mb-3">
          <div className={`h-24 w-24 rounded-full overflow-hidden border-2 border-gray-200 flex items-center justify-center bg-gray-100 ${uploadingAvatar ? 'opacity-50' : ''}`}>
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-3xl font-bold text-gray-400">
                {formData.display_name?.[0] || profile?.username?.[0] || '?'}
              </span>
            )}
            
            {uploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-8 w-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          <div className="absolute bottom-0 right-0 flex space-x-1">
            <button
              type="button"
              onClick={() => avatarFileInputRef.current?.click()}
              className="bg-[#FF8C3B] text-white p-2 rounded-full hover:bg-orange-600 transition-colors shadow-sm"
            >
              <Camera className="h-4 w-4" />
            </button>
            
            {avatarPreview && (
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
            ref={avatarFileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleAvatarUpload}
          />
        </div>
        
        <p className="text-sm text-gray-500">Zalecany rozmiar: 500x500px</p>
      </motion.div>
      
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
          Bio (Krótki opis)
        </label>
        <textarea
          id="bio"
          rows={3}
          value={formData.bio}
          onChange={(e) => onChange({ ...formData, bio: e.target.value })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
          maxLength={300}
        />
        <p className="text-xs text-gray-500 mt-1">Max 300 znaków.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.35 }}
      >
        <label htmlFor="organization_history" className="block text-sm font-medium text-gray-700 mb-1">
          Historia Organizacji (Opcjonalne)
        </label>
        <textarea
          id="organization_history"
          rows={5}
          value={formData.organization_history || ''}
          onChange={(e) => onChange({ ...formData, organization_history: e.target.value })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
          placeholder="Opowiedz historię swojej organizacji, jej początki i rozwój..."
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <label htmlFor="organization_mission" className="block text-sm font-medium text-gray-700 mb-1">
          Misja Organizacji (Opcjonalne)
        </label>
        <textarea
          id="organization_mission"
          rows={5}
          value={formData.organization_mission || ''}
          onChange={(e) => onChange({ ...formData, organization_mission: e.target.value })}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm"
          placeholder="Opisz misję, cele i wartości, które przyświecają Twojej działalności..."
        />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.45 }}
      >
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Zdjęcia Organizacji (Max {MAX_ORG_PHOTOS})
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mb-3">
          {organizationPhotos.map((photo) => (
            <div key={photo.id} className="relative group aspect-square border rounded-md overflow-hidden">
              <img 
                src={photo.previewUrl} 
                alt="Preview" 
                className="h-full w-full object-cover"
              />
              {photo.isUploading && (
                 <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                   <Loader2 className="h-6 w-6 text-white animate-spin" />
                 </div>
              )}
              {photo.uploadError && (
                 <div className="absolute inset-0 bg-red-500/70 flex items-center justify-center p-1" title={photo.uploadError}>
                   <p className="text-white text-xs text-center leading-tight">Błąd</p>
                 </div>
              )}
              {!photo.isUploading && !photo.uploadError && (
                <button 
                   type="button" 
                   onClick={() => handleRemoveOrganizationPhoto(photo.id)}
                   className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                   disabled={isProcessingOrgPhotos}
                 >
                   <Trash2 className="h-4 w-4" />
                 </button>
              )}
            </div>
          ))}

          {organizationPhotos.length < MAX_ORG_PHOTOS && (
            <button
              type="button"
              onClick={() => orgPhotosFileInputRef.current?.click()}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
              disabled={isProcessingOrgPhotos}
            >
              <UploadCloud className="h-8 w-8 mb-1" />
              <span className="text-xs text-center">Dodaj zdjęcie</span>
            </button>
          )}
        </div>
        <input
          ref={orgPhotosFileInputRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*"
          onChange={handleOrganizationPhotoSelect}
          disabled={isProcessingOrgPhotos}
        />
        {isProcessingOrgPhotos && (
          <div className="flex items-center text-sm text-gray-500">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Przetwarzanie zdjęć...
          </div>
        )}
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.5 }}
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
          disabled={isProcessingOrgPhotos || uploadingAvatar}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-black/80 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
        >
          {isProcessingOrgPhotos ? 'Przetwarzanie zdjęć...' : (uploadingAvatar ? 'Przesyłanie avatara...' : 'Zapisz zmiany')}
        </button>
      </motion.div>
    </form>
  );
}
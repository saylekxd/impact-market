import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

// Bucket name - ensure this bucket exists in your Supabase project and is public
const BUCKET_NAME = 'organization-photos';

/**
 * Uploads an organization photo to Supabase Storage.
 *
 * @param userId The ID of the user uploading the photo.
 * @param file The file object to upload.
 * @returns The public URL of the uploaded file.
 * @throws If the upload fails.
 */
export async function uploadOrganizationPhoto(userId: string, file: File): Promise<string> {
  if (!userId) {
    throw new Error('User ID is required for uploading photos.');
  }

  if (!file) {
    throw new Error('File is required for uploading.');
  }

  // Generate a unique file path
  const fileExtension = file.name.split('.').pop();
  const filePath = `public/${userId}/${uuidv4()}.${fileExtension}`;

  try {
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600', // Cache for 1 hour
        upsert: false, // Don't overwrite existing files with the same name (should be unique due to uuid)
      });

    if (uploadError) {
      console.error('Supabase Storage upload error:', uploadError);
      throw new Error(`Failed to upload photo: ${uploadError.message}`);
    }

    // Get the public URL
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    if (!data?.publicUrl) {
      console.error('Failed to get public URL for:', filePath);
      throw new Error('Failed to get public URL after upload.');
    }

    console.log('Successfully uploaded photo:', data.publicUrl);
    return data.publicUrl;
  } catch (error) {
    console.error('Error in uploadOrganizationPhoto:', error);
    // Re-throw the error to be handled by the caller
    throw error;
  }
} 
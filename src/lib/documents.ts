import { supabase } from './supabase';
import { Database } from './database.types';
import { v4 as uuidv4 } from 'uuid';

type Document = Database['public']['Tables']['documents']['Row'];
type DocumentInsert = Database['public']['Tables']['documents']['Insert'];
type DocumentUpdate = Database['public']['Tables']['documents']['Update'];

interface DocumentResponse {
  success: boolean;
  data?: Document | Document[] | null;
  error?: string;
}

// Special response type for category counts
interface CategoryCountResponse {
  success: boolean;
  data?: Record<string, number> | null;
  error?: string;
}

// Document categories with their display properties
export const DOCUMENT_CATEGORIES = {
  IDENTITY: {
    id: 'identity',
    name: 'Dokumenty tożsamości',
    description: 'Dokumenty potwierdzające tożsamość',
    required: true,
    icon: 'id-card'
  },
  FINANCIAL: {
    id: 'financial',
    name: 'Dokumenty finansowe',
    description: 'Dokumenty bankowe i podatkowe',
    required: true,
    icon: 'bank'
  },
  LEGAL: {
    id: 'legal',
    name: 'Dokumenty prawne',
    description: 'Umowy i inne dokumenty prawne',
    required: false,
    icon: 'file-text'
  },
  OTHER: {
    id: 'other',
    name: 'Inne dokumenty',
    description: 'Pozostałe dokumenty',
    required: false,
    icon: 'files'
  }
};

export const documents = {
  // Get document categories with counts
  async getCategories(userId: string): Promise<CategoryCountResponse> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('category')
        .eq('user_id', userId);

      if (error) throw error;

      // Count documents by category
      const categoryCounts: Record<string, number> = {};
      
      // Initialize all categories with 0 count
      Object.keys(DOCUMENT_CATEGORIES).forEach(key => {
        categoryCounts[DOCUMENT_CATEGORIES[key as keyof typeof DOCUMENT_CATEGORIES].id] = 0;
      });
      
      // Count documents
      data?.forEach(doc => {
        const category = doc.category;
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });

      return {
        success: true,
        data: categoryCounts
      };
    } catch (error) {
      console.error('Error fetching document categories:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  // Get documents by category
  async getByCategory(userId: string, category: string): Promise<DocumentResponse> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .eq('category', category)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error fetching documents:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  // Get all documents for a user
  async getByUserId(userId: string): Promise<DocumentResponse> {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error fetching documents:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  // Upload a new document
  async upload(document: Omit<DocumentInsert, 'id'>): Promise<DocumentResponse> {
    try {
      const newDocument = {
        ...document,
        id: uuidv4(),
        status: 'pending',
        uploaded_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('documents')
        .insert([newDocument])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error uploading document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  },

  // Delete a document
  async delete(documentId: string): Promise<DocumentResponse> {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId);

      if (error) throw error;

      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting document:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}; 
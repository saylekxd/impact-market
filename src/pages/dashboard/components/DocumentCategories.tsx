import React, { useState, useEffect } from 'react';
import { FileText, Upload, AlertCircle, CheckCircle, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { documents, DOCUMENT_CATEGORIES } from '../../../lib/documents';
import { toast } from 'react-hot-toast';

interface CategoryCounts {
  [key: string]: number;
}

interface DocumentCategoriesProps {
  userId: string;
  onSelectCategory: (category: string) => void;
  selectedCategory: string | null;
}

const DocumentCategories: React.FC<DocumentCategoriesProps> = ({
  userId,
  onSelectCategory,
  selectedCategory
}) => {
  const [categoryCounts, setCategoryCounts] = useState<CategoryCounts>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, [userId]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const response = await documents.getCategories(userId);
      if (response.success && response.data) {
        setCategoryCounts(response.data);
      } else {
        toast.error('Nie udało się załadować kategorii dokumentów');
      }
    } catch (error) {
      console.error('Error loading document categories:', error);
      toast.error('Wystąpił błąd podczas ładowania kategorii dokumentów');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'id-card':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'bank':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'file-text':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'files':
        return <FileText className="h-5 w-5 text-gray-500" />;
      default:
        return <FileText className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          Kategorie dokumentów
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Wybierz kategorię, aby zobaczyć lub dodać dokumenty
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : (
        <div className="space-y-3">
          {Object.keys(DOCUMENT_CATEGORIES).map((categoryKey) => {
            const category = DOCUMENT_CATEGORIES[categoryKey as keyof typeof DOCUMENT_CATEGORIES];
            const count = categoryCounts[category.id] || 0;
            const isSelected = selectedCategory === category.id;
            const isCompleted = count > 0;
            const isRequired = category.required;

            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
                }`}
                onClick={() => onSelectCategory(category.id)}
              >
                <div className="flex items-center gap-3">
                  {getCategoryIcon(category.icon)}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      {isRequired}
                    </div>
                    <p className="text-sm text-gray-500">{category.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {isRequired && !isCompleted ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : isCompleted ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : null}
                    <span className="ml-2 text-sm text-gray-600 font-medium">
                      {count} {count === 1 ? 'dokument' : count < 5 ? 'dokumenty' : 'dokumentów'}
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={() => onSelectCategory('all')}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          <FileText className="h-4 w-4" />
          <span>Pokaż wszystkie dokumenty</span>
        </button>
        <button
          onClick={() => {
            /* This will be connected to the upload functionality later */
            toast.success('Funkcja przesyłania dokumentów będzie dostępna wkrótce');
          }}
          className="flex items-center gap-2 text-sm text-green-600 hover:text-green-800 transition-colors mt-2"
        >
          <Upload className="h-4 w-4" />
          <span>Prześlij nowy dokument</span>
        </button>
      </div>
    </div>
  );
};

export default DocumentCategories; 
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import { motion } from 'framer-motion';
import { FileText, Download, Eye, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { documents as documentsApi, DOCUMENT_CATEGORIES } from '../../lib/documents';
import { toast } from 'react-hot-toast';

// This interface represents how we'll format database documents for display
interface DisplayDocument {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  status: string;
  fileUrl: string;
}

// Define document categories for the UI
const DOCUMENT_DISPLAY_CATEGORIES = {
  'identity': 'Dokumenty tożsamości',
  'financial': 'Dokumenty finansowe',
  'legal': 'Dokumenty prawne',
  'other': 'Inne dokumenty'
};

export default function Documents() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [displayedDocuments, setDisplayedDocuments] = useState<DisplayDocument[]>([]);
  const [allDocuments, setAllDocuments] = useState<DisplayDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingDocuments, setPendingDocuments] = useState<DisplayDocument[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  // Load documents from the database
  useEffect(() => {
    if (!user?.id) return;
    
    const loadDocuments = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get all documents for the user
        const response = await documentsApi.getByUserId(user.id);
        
        if (response.success && response.data) {
          // Convert database documents to display format
          const formattedDocs = (response.data as any[]).map(doc => formatDocumentForDisplay(doc));
          setAllDocuments(formattedDocs);
          setDisplayedDocuments(formattedDocs);
          
          // Find documents that need attention
          const needsAttention = formattedDocs.filter(doc => 
            doc.status === 'pending' || doc.status === 'new'
          );
          setPendingDocuments(needsAttention);
          
          // Get category counts
          const categoryResponse = await documentsApi.getCategories(user.id);
          if (categoryResponse.success && categoryResponse.data) {
            setCategoryCounts(categoryResponse.data);
            
            // Get unique categories from documents
            const uniqueCategories = [...new Set(formattedDocs.map(doc => doc.category))];
            setCategories(uniqueCategories);
          }
        } else {
          setError('Nie udało się załadować dokumentów');
          toast.error('Nie udało się załadować dokumentów');
        }
      } catch (error) {
        console.error('Error loading documents:', error);
        setError('Wystąpił błąd podczas ładowania dokumentów');
        toast.error('Wystąpił błąd podczas ładowania dokumentów');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadDocuments();
  }, [user?.id]);

  // Filter documents by category
  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'all') {
      setDisplayedDocuments(
        allDocuments.filter(doc => doc.category === selectedCategory)
      );
    } else {
      setDisplayedDocuments(allDocuments);
    }
  }, [selectedCategory, allDocuments]);

  // Convert database document to display format
  const formatDocumentForDisplay = (doc: any): DisplayDocument => {
    // Extract category name from the category ID
    const categoryKey = Object.keys(DOCUMENT_CATEGORIES).find(
      key => DOCUMENT_CATEGORIES[key as keyof typeof DOCUMENT_CATEGORIES].id === doc.category
    );
    
    const categoryName = categoryKey 
      ? DOCUMENT_CATEGORIES[categoryKey as keyof typeof DOCUMENT_CATEGORIES].name 
      : doc.category;
    
    return {
      id: doc.id,
      title: doc.file_name,
      description: `${doc.file_type}, ${formatFileSize(doc.file_size)}`,
      category: categoryName,
      date: doc.uploaded_at,
      status: doc.status,
      fileUrl: doc.file_path
    };
  };

  // Format file size to human-readable format
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handler for category selection
  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category === 'all' ? null : category);
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let color, text, icon;
    
    switch (status) {
      case 'approved':
        color = 'bg-green-50 text-green-700 border-green-200';
        text = 'Zatwierdzony';
        icon = <CheckCircle className="h-3 w-3 mr-1" />;
        break;
      case 'pending':
        color = 'bg-yellow-50 text-yellow-700 border-yellow-200';
        text = 'Oczekuje';
        icon = <AlertCircle className="h-3 w-3 mr-1" />;
        break;
      case 'rejected':
        color = 'bg-red-50 text-red-700 border-red-200';
        text = 'Odrzucony';
        icon = <AlertCircle className="h-3 w-3 mr-1" />;
        break;
      case 'new':
        color = 'bg-blue-50 text-blue-700 border-blue-200';
        text = 'Nowy';
        icon = <AlertCircle className="h-3 w-3 mr-1" />;
        break;
      default:
        color = 'bg-gray-50 text-gray-700 border-gray-200';
        text = status;
        icon = null;
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {icon}{text}
      </span>
    );
  };

  // Handle document viewing or downloading
  const handleViewDocument = (documentId: string, fileUrl: string) => {
    // In a real app, this would open the document in a viewer or new tab
    toast.success('Otwieranie dokumentu...');
    window.open(fileUrl, '_blank');
  };

  const handleDownloadDocument = (documentId: string, fileUrl: string, fileName: string) => {
    // In a real app, this would download the document
    toast.success('Pobieranie dokumentu...');
    
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold text-black">Dokumenty</h1>
          <p className="mt-1 text-gray-500">
            Przeglądaj i pobieraj dokumenty przesłane przez Wpłać Mi Kawę.
          </p>
        </motion.div>

        {pendingDocuments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          >
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-blue-800">
                  Masz {pendingDocuments.length} {pendingDocuments.length === 1 ? 'dokument' : 'dokumenty'} wymagające uwagi
                </h3>
                <ul className="mt-2 text-sm text-blue-700 space-y-1">
                  {pendingDocuments.map(doc => (
                    <li key={doc.id} className="flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      {doc.title} - <StatusBadge status={doc.status} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Kategorie dokumentów
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => handleSelectCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  !selectedCategory 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                Wszystkie
              </button>
              {Object.keys(DOCUMENT_CATEGORIES).map((key) => {
                const category = DOCUMENT_CATEGORIES[key as keyof typeof DOCUMENT_CATEGORIES];
                const count = categoryCounts[category.id] || 0;
                
                return (
                  <button
                    key={category.id}
                    onClick={() => handleSelectCategory(category.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {category.name} {count > 0 && `(${count})`}
                  </button>
                );
              })}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">{error}</p>
              <p className="text-sm mt-2">Spróbuj odświeżyć stronę lub skontaktuj się z administracją.</p>
            </div>
          ) : displayedDocuments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Brak dokumentów w wybranej kategorii.</p>
            </div>
          ) : (
            <div className="overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dokument
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategoria
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Akcje
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayedDocuments.map((document) => (
                    <tr key={document.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{document.title}</div>
                            <div className="text-sm text-gray-500">{document.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{document.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(document.date).toLocaleDateString('pl-PL')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={document.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          className="text-blue-600 hover:text-blue-900 mx-2"
                          onClick={() => handleViewDocument(document.id, document.fileUrl)}
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        <button 
                          className="text-green-600 hover:text-green-900 mx-2"
                          onClick={() => handleDownloadDocument(document.id, document.fileUrl, document.title)}
                        >
                          <Download className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
} 
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { documentsService } from '../services/documents';
import { supabase } from '../lib/supabase';

export const useDocuments = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    page: 1,
    perPage: 10,
    searchQuery: ''
  });

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const { data, count } = await documentsService.getDocuments({
        ...filters,
        userId: user.id
      });
      
      if (data) {
        setDocuments(data);
        setTotalCount(count || 0);
        setError(null);
      } else {
        setError('No data received from server');
      }
    } catch (err) {
      console.error('Error details:', err);
      setError(err.message || 'Failed to fetch documents');
      setDocuments([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (formData) => {
    try {
      const result = await documentsService.createDocument({
        ...formData,
        user_id: user.id,
        description: formData.description || null
      });
      await fetchDocuments(); // Refresh the list
      return result;
    } catch (err) {
      console.error('Error creating document:', err);
      throw err;
    }
  };

  const updateDocument = async (documentId, updates) => {
    try {
      const result = await documentsService.updateDocument(documentId, updates);
      await fetchDocuments(); // Refresh the list
      return result;
    } catch (err) {
      console.error('Error updating document:', err);
      throw err;
    }
  };

  const deleteDocument = async (documentId) => {
    try {
      // First get the document details to get the bucket_path
      const { data: document } = await documentsService.getDocument(documentId);
      
      if (!document) {
        throw new Error('Document not found');
      }

      // Delete the file from storage first
      const { error: storageError } = await supabase.storage
        .from('document-store')
        .remove([document.bucket_path]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
        // Continue with deletion even if storage deletion fails
      }

      // Then delete the database record
      const { error: dbError } = await supabase
        .from('documentstore')
        .delete()
        .eq('document_id', documentId);

      if (dbError) throw dbError;

      // Update local state
      setDocuments(prev => prev.filter(doc => doc.document_id !== documentId));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      console.error('Error deleting document:', err);
      throw new Error(err.message || 'Failed to delete document');
    }
  };

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user, filters]);

  return {
    documents,
    loading,
    error,
    totalCount,
    filters,
    setFilters,
    refresh: fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument
  };
}; 
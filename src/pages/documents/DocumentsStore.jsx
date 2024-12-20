import React, { useState } from 'react';
import { useDocuments } from '../../hooks/useDocuments';
import { useAuth } from '../../contexts/AuthContext';
import AddDocumentModal from '../../components/modals/AddDocumentModal';
import SuccessModal from '../../components/modals/SuccessModal';
import ViewDocumentModal from '../../components/modals/ViewDocumentModal';
import DeleteModal from '../../components/modals/DeleteModal';
import Pagination from '../../components/common/Pagination';
import { formatFileSize } from '../../utils/formatters';
import { supabase } from '../../lib/supabase';

const DocumentsStore = () => {
  const { user } = useAuth();
  const {
    documents,
    loading,
    error,
    totalCount,
    filters,
    setFilters,
    createDocument,
    updateDocument,
    deleteDocument,
    refresh
  } = useDocuments();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleSearch = (e) => {
    setFilters(prev => ({
      ...prev,
      searchQuery: e.target.value,
      page: 1
    }));
  };

  const handleAddDocument = async (formData) => {
    try {
      await createDocument(formData);
      setIsAddModalOpen(false);
      setSuccessMessage('added');
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('Error adding document:', err);
      alert(err.message || 'Failed to add document');
    }
  };

  const handleViewDocument = (doc) => {
    setSelectedDocument(doc);
    setIsViewModalOpen(true);
  };

  const handleEditDocument = async (documentId, updates) => {
    try {
      await updateDocument(documentId, updates);
      setSuccessMessage('edited');
      setIsSuccessModalOpen(true);
      setIsViewModalOpen(false);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteDocument = async (documentId) => {
    try {
      await deleteDocument(documentId);
      setSuccessMessage('deleted');
      setIsSuccessModalOpen(true);
      setIsViewModalOpen(false);
    } catch (err) {
      throw err;
    }
  };

  const handleDownload = async (document) => {
    try {
      const { data, error } = await supabase.storage
        .from('document-store')
        .download(document.bucket_path);

      if (error) throw error;

      // Create blob URL and trigger download
      const blob = new Blob([data], { type: `application/${document.document_type}` });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.document_title;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document');
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Documents Store ({totalCount})</h1>
              <p className="text-gray-600">Manage your documents</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-[#0D344C] text-white rounded-lg hover:bg-opacity-90"
            >
              + Add New Document
            </button>
          </div>

          {/* Search */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search documents..."
                value={filters.searchQuery}
                onChange={handleSearch}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Document Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map(doc => (
                <tr key={doc.document_id}>
                  <td className="px-6 py-4">{doc.document_title}</td>
                  <td className="px-6 py-4">{doc.document_type.toUpperCase()}</td>
                  <td className="px-6 py-4">{formatFileSize(doc.file_size)}</td>
                  <td className="px-6 py-4">
                    {doc.description || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDocument(doc)}
                        className="p-2 hover:bg-gray-100 rounded-md"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc.document_id)}
                        className="p-2 hover:bg-gray-100 rounded-md text-red-500"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={filters.page}
            totalItems={totalCount}
            itemsPerPage={filters.perPage}
            onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
          />
        </div>
      </div>

      {/* Modals */}
      <AddDocumentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddDocument}
      />

      <ViewDocumentModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        document={selectedDocument}
        onEdit={handleEditDocument}
        onDelete={handleDeleteDocument}
        onDownload={handleDownload}
        onAddNew={() => {
          setIsViewModalOpen(false);
          setIsAddModalOpen(true);
        }}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={successMessage}
        type="document"
      />
    </div>
  );
};

export default DocumentsStore;
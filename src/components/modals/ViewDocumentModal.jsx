import React, { useState, useEffect } from 'react';
import { formatFileSize } from '../../utils/formatters';

const ViewDocumentModal = ({ 
  isOpen, 
  onClose, 
  document, 
  onEdit, 
  onDelete, 
  onDownload,
  onAddNew 
}) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedDoc, setEditedDoc] = useState(null);

  const documentTypes = [
    { value: 'pdf', label: 'PDF' },
    { value: 'jpeg', label: 'JPEG' },
    { value: 'jpg', label: 'JPG' },
    { value: 'png', label: 'PNG' },
    { value: 'doc', label: 'DOC' },
    { value: 'docx', label: 'DOCX' },
    { value: 'xls', label: 'XLS' },
    { value: 'xlsx', label: 'XLSX' }
  ];

  useEffect(() => {
    if (document) {
      setEditedDoc(document);
    }
  }, [document]);

  if (!isOpen || !document || !editedDoc) return null;

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleSave = async () => {
    try {
      await onEdit(document.document_id, editedDoc);
      setIsEditMode(false);
    } catch (error) {
      console.error('Error updating document:', error);
      alert(error.message || 'Failed to update document');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedDoc(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await onDelete(document.document_id);
        onClose();
      } catch (error) {
        console.error('Error deleting document:', error);
        alert(error.message || 'Failed to delete document');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">{editedDoc.document_title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Document Details */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Document Title</label>
              {isEditMode ? (
                <input
                  type="text"
                  name="document_title"
                  value={editedDoc.document_title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
                />
              ) : (
                <p className="font-medium">{editedDoc.document_title}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Document Type</label>
              {isEditMode ? (
                <select
                  name="document_type"
                  value={editedDoc.document_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
                >
                  {documentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="font-medium">{editedDoc.document_type.toUpperCase()}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Description</label>
            {isEditMode ? (
              <textarea
                name="description"
                value={editedDoc.description || ''}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
              />
            ) : (
              <p className="text-sm text-gray-600">{editedDoc.description || 'No description provided'}</p>
            )}
          </div>

          {/* File Details */}
          <div>
            <label className="block text-sm text-gray-600 mb-2">File Details</label>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <svg className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <p className="font-medium">{editedDoc.document_title}</p>
                <p className="text-xs text-gray-500">
                  {editedDoc.document_type.toUpperCase()} • {formatFileSize(editedDoc.file_size)}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <div className="flex gap-4">
              {isEditMode ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center text-gray-600 hover:text-gray-800"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditMode(false)}
                    className="flex items-center text-gray-600 hover:text-gray-800"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEdit}
                    className="flex items-center text-gray-600 hover:text-gray-800"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center text-gray-600 hover:text-gray-800"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                  <button
                    onClick={() => onDownload(editedDoc)}
                    className="flex items-center text-gray-600 hover:text-gray-800"
                  >
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                </>
              )}
            </div>
            <button
              onClick={onAddNew}
              className="bg-[#0D344C] text-white px-4 py-2 rounded-lg hover:bg-opacity-90"
            >
              + Add New Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewDocumentModal; 
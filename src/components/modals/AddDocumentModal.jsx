import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AddDocumentModal = ({ isOpen, onClose, onSubmit }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    document_title: '',
    description: '',
    document_type: '',
    document: null,
    file_size: 0
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10485760) { // 10MB limit
        alert('File size must be less than 10MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        document: file,
        file_size: file.size
      }));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 10485760) { // 10MB limit
        alert('File size must be less than 10MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        document: file,
        file_size: file.size
      }));
    }
    dropZoneRef.current?.classList.remove('border-[#0D344C]');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    dropZoneRef.current?.classList.add('border-[#0D344C]');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dropZoneRef.current?.classList.remove('border-[#0D344C]');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.document) {
      alert('Please select a document to upload');
      return;
    }

    try {
      setLoading(true);
      const submitData = {
        document_title: formData.document_title,
        description: formData.description,
        document_type: formData.document_type,
        document: formData.document,
        file_size: formData.file_size,
        user_id: user.id
      };
      await onSubmit(submitData);
      setFormData({
        document_title: '',
        description: '',
        document_type: '',
        document: null,
        file_size: 0
      });
      onClose();
    } catch (error) {
      console.error('Error submitting document:', error);
      alert(error.message || 'Failed to add document');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[600px] p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Add New Document</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Document Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="document_title"
              value={formData.document_title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
              required
            />
          </div>

          {/* Document Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Document Type <span className="text-red-500">*</span>
            </label>
            <select
              name="document_type"
              value={formData.document_type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
              required
            >
              <option value="">Select type</option>
              {documentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attach Document <span className="text-red-500">*</span>
            </label>
            <div
              ref={dropZoneRef}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
              />
              <div className="space-y-2">
                <div className="text-gray-600">Drag & Drop files here</div>
                <div className="text-sm text-gray-500">
                  Max file size: 10MB<br />
                  Supported formats: PDF, JPG, JPEG, PNG, DOC, DOCX, XLS, XLSX
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                >
                  Browse Files
                </button>
              </div>
              {formData.document && (
                <div className="mt-4 text-sm text-gray-600">
                  Selected: {formData.document.name} ({(formData.document.size / 1024 / 1024).toFixed(2)}MB)
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#0D344C] text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Submit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDocumentModal; 
import React, { useState, useEffect } from 'react';
import { healthRecordsService } from '../../services/healthRecords';

const ViewHealthConditionModal = ({ isOpen, onClose, condition, onEdit, onDelete }) => {
  const [documentUrl, setDocumentUrl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    condition_name: '',
    doctor_name: '',
    date_of_visit: '',
    description: '',
    document: null
  });

  useEffect(() => {
    if (condition) {
      setFormData({
        condition_name: condition.condition_name || '',
        doctor_name: condition.doctor_name || '',
        date_of_visit: condition.date_of_visit || '',
        description: condition.description || '',
        document: null
      });
    }
  }, [condition]);

  useEffect(() => {
    const fetchDocumentUrl = async () => {
      if (condition?.document_url) {
        try {
          const url = await healthRecordsService.getDocumentUrl(condition.document_url);
          setDocumentUrl(url);
        } catch (error) {
          console.error('Error fetching document URL:', error);
        }
      }
    };

    if (isOpen && condition) {
      fetchDocumentUrl();
    }
  }, [isOpen, condition]);

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
      if (file.size > 10485760) {
        alert('File size must be less than 10MB');
        return;
      }
      setFormData(prev => ({
        ...prev,
        document: file
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      await onEdit(condition.id, formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating health condition:', error);
      alert(error.message || 'Failed to update health condition');
    }
  };

  const handleDocumentClick = () => {
    if (documentUrl) {
      window.open(documentUrl, '_blank');
    }
  };

  if (!isOpen || !condition) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">{condition.condition_name}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Condition Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="condition_name"
                  value={formData.condition_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
                />
              ) : (
                <p className="font-medium">{condition.condition_name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Doctor Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="doctor_name"
                  value={formData.doctor_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
                />
              ) : (
                <p className="font-medium">{condition.doctor_name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Date of Visit</label>
              {isEditing ? (
                <input
                  type="date"
                  name="date_of_visit"
                  value={formData.date_of_visit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
                />
              ) : (
                <p className="font-medium">{new Date(condition.date_of_visit).toLocaleDateString()}</p>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Description</label>
            {isEditing ? (
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
              />
            ) : (
              <p className="text-sm">{condition.description}</p>
            )}
          </div>

          {/* Document */}
          <div>
            <label className="block text-sm text-gray-600 mb-1">Document</label>
            {condition.document_url ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <button
                  onClick={handleDocumentClick}
                  className="flex items-center text-[#0D344C] hover:text-opacity-80"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Document
                </button>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No document attached</p>
            )}
            {isEditing && (
              <div className="mt-2">
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center text-gray-600 hover:text-gray-800"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit
                </button>
                <button
                  onClick={() => onDelete(condition.id)}
                  className="flex items-center text-red-600 hover:text-red-800"
                >
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSubmit}
                  className="flex items-center text-green-600 hover:text-green-800"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewHealthConditionModal; 
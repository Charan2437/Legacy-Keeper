import React, { useState, useRef, useEffect } from 'react';
import { formatCurrency } from '../../utils/formatters';
import { businessPlansService } from '../../services/businessPlans';

const ViewBusinessPlanModal = ({ isOpen, onClose, businessPlan, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type_id: '',
    investment_amount: '',
    ownership_percentage: '',
    succession_notes: '',
    government_id: null
  });
  const fileInputRef = useRef(null);
  const [documentUrl, setDocumentUrl] = useState(null);

  useEffect(() => {
    if (businessPlan) {
      setFormData({
        name: businessPlan.name || '',
        type_id: businessPlan.type_id || '',
        investment_amount: businessPlan.investment_amount || '',
        ownership_percentage: businessPlan.ownership_percentage || '',
        succession_notes: businessPlan.succession_notes || '',
        government_id: null
      });
    }
  }, [businessPlan]);

  useEffect(() => {
    const fetchDocumentUrl = async () => {
      if (businessPlan?.government_id_url) {
        try {
          const url = await businessPlansService.getDocumentUrl(businessPlan.government_id_url);
          setDocumentUrl(url);
        } catch (error) {
          console.error('Error fetching document URL:', error);
        }
      }
    };

    if (isOpen && businessPlan) {
      fetchDocumentUrl();
    }
  }, [isOpen, businessPlan]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        government_id: file
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      await onEdit(businessPlan.id, formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating business plan:', error);
      alert(error.message || 'Failed to update business plan');
    }
  };

  const handleDocumentClick = () => {
    if (documentUrl) {
      window.open(documentUrl, '_blank');
    }
  };

  if (!isOpen || !businessPlan) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[600px] p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">View Business Plan</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Business Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C] disabled:bg-gray-50"
            />
          </div>

          {/* Business Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
            <div className="text-gray-900">
              {businessPlan.business_types?.name || 'N/A'}
            </div>
          </div>

          {/* Investment Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Investment Amount</label>
            <input
              type="number"
              name="investment_amount"
              value={formData.investment_amount}
              onChange={handleChange}
              disabled={!isEditing}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C] disabled:bg-gray-50"
            />
          </div>

          {/* Ownership Percentage */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ownership Percentage</label>
            <input
              type="number"
              name="ownership_percentage"
              value={formData.ownership_percentage}
              onChange={handleChange}
              disabled={!isEditing}
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C] disabled:bg-gray-50"
            />
          </div>

          {/* Succession Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Succession Notes</label>
            <textarea
              name="succession_notes"
              value={formData.succession_notes}
              onChange={handleChange}
              disabled={!isEditing}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C] disabled:bg-gray-50"
            />
          </div>

          {/* Government ID Document */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Government ID</label>
            {businessPlan?.government_id_url ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDocumentClick}
                  className="flex items-center space-x-2 text-[#0D344C] hover:text-opacity-80"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm">View Document</span>
                </button>
                {isEditing && (
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, government_id: null }))}
                    className="text-red-500 hover:text-red-600 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No document attached</div>
            )}
          </div>

          {/* File Upload (Only shown in edit mode) */}
          {isEditing && !formData.government_id && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload New Document</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="w-full"
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t">
            <div className="flex gap-4">
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
                    onClick={() => onDelete(businessPlan.id)}
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
    </div>
  );
};

export default ViewBusinessPlanModal; 
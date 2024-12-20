import React, { useState, useRef, useEffect } from 'react';
import { businessPlansService } from '../../services/businessPlans';

const AddBusinessPlanModal = ({ isOpen, onClose, onSubmit }) => {
  const [businessTypes, setBusinessTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type_id: '',
    investment_amount: '',
    ownership_percentage: '',
    succession_notes: '',
    government_id: null
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchBusinessTypes = async () => {
      try {
        const types = await businessPlansService.getBusinessTypes();
        setBusinessTypes(types || []);
      } catch (error) {
        console.error('Error fetching business types:', error);
      }
    };

    if (isOpen) {
      fetchBusinessTypes();
      setFormData({
        name: '',
        type_id: '',
        investment_amount: '',
        ownership_percentage: '',
        succession_notes: '',
        government_id: null
      });
    }
  }, [isOpen]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error.message || 'Failed to add business plan');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Add New Business Plan</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
              />
            </div>

            {/* Business Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type_id"
                value={formData.type_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
              >
                <option value="">Select type</option>
                {businessTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Investment Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Investment Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="investment_amount"
                value={formData.investment_amount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
              />
            </div>

            {/* Ownership Percentage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ownership Percentage <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="ownership_percentage"
                value={formData.ownership_percentage}
                onChange={handleChange}
                required
                min="0"
                max="100"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
              />
            </div>

            {/* Succession Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Succession Notes
              </label>
              <textarea
                name="succession_notes"
                value={formData.succession_notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
              />
            </div>

            {/* Government ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Government ID
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="w-full"
                accept=".pdf,.jpg,.jpeg,.png"
              />
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
                {loading ? 'Adding...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBusinessPlanModal; 
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { insuranceService } from '../../services/insurance';

const COVERAGE_PERIODS = [
  { value: '1', label: '1 Month' },
  { value: '3', label: '3 Months' },
  { value: '6', label: '6 Months' },
  { value: '12', label: '1 Year' },
  { value: '24', label: '2 Years' },
  { value: '36', label: '3 Years' },
  { value: '60', label: '5 Years' }
];

const AddInsuranceModal = ({ isOpen, onClose, onSubmit }) => {
  const { user } = useAuth();
  const [insuranceTypes, setInsuranceTypes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type_id: '',
    amount: '',
    insurance_date: '',
    coverage_period: '',
    paid_to: '',
    description: '',
    remember: false,
    government_id: null
  });

  useEffect(() => {
    const fetchInsuranceTypes = async () => {
      try {
        const types = await insuranceService.getInsuranceTypes();
        setInsuranceTypes(types);
      } catch (error) {
        console.error('Error fetching insurance types:', error);
      }
    };

    if (isOpen) {
      fetchInsuranceTypes();
      // Reset form when modal opens
      setFormData({
        name: '',
        type_id: '',
        amount: '',
        insurance_date: '',
        coverage_period: '',
        paid_to: '',
        description: '',
        remember: false,
        government_id: null
      });
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'file' ? files[0] : 
              value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const processedData = {
        ...formData,
        user_id: user.id,
        amount: parseFloat(formData.amount),
        start_date: formData.insurance_date,
        coverage_period: parseInt(formData.coverage_period),
        reminder_enabled: formData.remember,
        status: 'Active'
      };

      await onSubmit(processedData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert(error.message || 'Failed to add insurance');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Add New Insurance</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Insurance Name & Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance Type
                </label>
                <select
                  name="type_id"
                  value={formData.type_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
                  required
                >
                  <option value="">Select type</option>
                  {insuranceTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Remember Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="remember"
                id="remember"
                checked={formData.remember}
                onChange={handleChange}
                className="rounded border-gray-300 text-[#0D344C] focus:ring-[#0D344C]"
              />
              <label htmlFor="remember" className="text-sm text-gray-700">
                Do you want to remember on this
              </label>
            </div>

            {/* Insurance Date & Coverage Period */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance Date
                </label>
                <input
                  type="date"
                  name="insurance_date"
                  value={formData.insurance_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coverage Period Time
                </label>
                <select
                  name="coverage_period"
                  value={formData.coverage_period}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
                  required
                >
                  <option value="">Select period</option>
                  {COVERAGE_PERIODS.map(period => (
                    <option key={period.value} value={period.value}>
                      {period.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Amount & Paid To */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Paid To
                </label>
                <input
                  type="text"
                  name="paid_to"
                  value={formData.paid_to}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Insurance Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
              />
            </div>

            {/* Government ID Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Government ID
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="mt-4 flex text-sm text-gray-600 justify-center">
                    <label htmlFor="government-id" className="relative cursor-pointer bg-white rounded-md font-medium text-[#0D344C] hover:text-opacity-90">
                      <span>Upload a file</span>
                      <input
                        id="government-id"
                        name="government_id"
                        type="file"
                        className="sr-only"
                        onChange={handleChange}
                        accept="image/*,.pdf"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    Supported format: pdf, jpg, jpeg
                  </p>
                </div>
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
                {loading ? 'Adding...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddInsuranceModal; 
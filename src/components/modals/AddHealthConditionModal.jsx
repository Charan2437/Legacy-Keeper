import React, { useState, useRef } from 'react';

const AddHealthConditionModal = ({ isOpen, onClose, memberId, onSubmit }) => {
  const [formData, setFormData] = useState({
    condition_name: '',
    doctor_name: '',
    date_of_visit: '',
    description: '',
    document: null
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10485760) { // 10MB limit
        setErrors(prev => ({ ...prev, document: 'File size must be less than 10MB' }));
        return;
      }
      setFormData(prev => ({
        ...prev,
        document: file
      }));
      setErrors(prev => ({ ...prev, document: '' }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    dropZoneRef.current?.classList.add('border-[#0D344C]');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dropZoneRef.current?.classList.remove('border-[#0D344C]');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dropZoneRef.current?.classList.remove('border-[#0D344C]');
    const file = e.dataTransfer.files[0];
    if (file) {
      if (file.size > 10485760) {
        setErrors(prev => ({ ...prev, document: 'File size must be less than 10MB' }));
        return;
      }
      setFormData(prev => ({
        ...prev,
        document: file
      }));
      setErrors(prev => ({ ...prev, document: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.condition_name.trim()) newErrors.condition_name = 'Condition name is required';
    if (!formData.doctor_name.trim()) newErrors.doctor_name = 'Doctor name is required';
    if (!formData.date_of_visit) newErrors.date_of_visit = 'Date of visit is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        await onSubmit({
          ...formData,
          member_id: memberId
        });
        onClose();
      } catch (error) {
        console.error('Error submitting form:', error);
        alert(error.message || 'Failed to add health condition');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      condition_name: '',
      doctor_name: '',
      date_of_visit: '',
      description: '',
      document: null
    });
    setErrors({});
  };

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">Add Health Condition</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Condition Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="condition_name"
                value={formData.condition_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.condition_name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]`}
              />
              {errors.condition_name && <p className="text-red-500 text-xs mt-1">{errors.condition_name}</p>}
            </div>

            {/* Doctor Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="doctor_name"
                value={formData.doctor_name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.doctor_name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]`}
              />
              {errors.doctor_name && <p className="text-red-500 text-xs mt-1">{errors.doctor_name}</p>}
            </div>
          </div>

          {/* Date of Visit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Visit <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date_of_visit"
              value={formData.date_of_visit}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.date_of_visit ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]`}
            />
            {errors.date_of_visit && <p className="text-red-500 text-xs mt-1">{errors.date_of_visit}</p>}
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
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
            />
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attach Document
            </label>
            <div
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center"
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
              />
              <div className="text-sm text-gray-600">
                Drag & Drop files here
                <br />
                <span className="text-xs text-gray-500">Max size: 10MB. Supported: PDF, JPG, PNG</span>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
              >
                Browse Files
              </button>
              {formData.document && (
                <div className="mt-2 text-sm text-gray-600">
                  Selected: {formData.document.name}
                </div>
              )}
              {errors.document && <p className="text-red-500 text-xs mt-1">{errors.document}</p>}
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
  );
};

export default AddHealthConditionModal; 
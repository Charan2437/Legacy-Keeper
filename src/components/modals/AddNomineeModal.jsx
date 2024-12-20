import React, { useState, useRef } from 'react';

const AddNomineeModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    relationship: '',
    phone: '',
    governmentId: '',
    accessCategories: [],
  });
  const [errors, setErrors] = useState({});
  const [selectedFiles, setSelectedFiles] = useState([]);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const relationships = ['Brother', 'Sister', 'Spouse', 'Parent', 'Child', 'Other'];
  const categories = ['Loans', 'Insurance', 'Investments', 'Documents'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      accessCategories: prev.accessCategories.includes(category)
        ? prev.accessCategories.filter(c => c !== category)
        : [...prev.accessCategories, category]
    }));
    if (errors.accessCategories) {
      setErrors(prev => ({ ...prev, accessCategories: '' }));
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    if (errors.files) {
      setErrors(prev => ({ ...prev, files: '' }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    dropZoneRef.current.classList.add('border-[#0D344C]');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dropZoneRef.current.classList.remove('border-[#0D344C]');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dropZoneRef.current.classList.remove('border-[#0D344C]');
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(files);
    if (errors.files) {
      setErrors(prev => ({ ...prev, files: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.relationship) newErrors.relationship = 'Relationship is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (formData.accessCategories.length === 0) newErrors.accessCategories = 'Select at least one category';
    if (selectedFiles.length === 0) newErrors.files = 'Government ID is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({ ...formData, files: selectedFiles });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-[78.9%] max-w-[1200px] p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Add Nominee</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nominee Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]`}
                placeholder="Jacob Jones"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]`}
                placeholder="debra.holt@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Relationship Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship <span className="text-red-500">*</span>
              </label>
              <select
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.relationship ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]`}
              >
                <option value="">Select</option>
                {relationships.map(rel => (
                  <option key={rel} value={rel}>{rel}</option>
                ))}
              </select>
              {errors.relationship && <p className="text-red-500 text-xs mt-1">{errors.relationship}</p>}
            </div>

            {/* Phone Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]`}
                placeholder="1234567890"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Access Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access to Categories <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategoryToggle(category)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      formData.accessCategories.includes(category)
                        ? 'bg-[#0D344C] text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              {errors.accessCategories && <p className="text-red-500 text-xs mt-1">{errors.accessCategories}</p>}
            </div>

            {/* Government ID Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Government ID <span className="text-red-500">*</span>
              </label>
              <div
                ref={dropZoneRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed ${errors.files ? 'border-red-500' : 'border-gray-300'} rounded-lg p-4 text-center transition-colors duration-200`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="text-sm text-gray-600">
                    Drag & Drop files here
                    <br />
                    <span className="text-xs text-gray-500">Supported format: .pdf, jpg, jpeg</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="mt-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Browse Files
                  </button>
                </label>
                {selectedFiles.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    {selectedFiles.map(file => file.name).join(', ')}
                  </div>
                )}
              </div>
              {errors.files && <p className="text-red-500 text-xs mt-1">{errors.files}</p>}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0D344C] text-white rounded-lg hover:bg-opacity-90"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNomineeModal; 
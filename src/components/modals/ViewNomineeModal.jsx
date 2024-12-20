import React, { useState, useEffect, useRef } from 'react';

const ViewNomineeModal = ({ isOpen, onClose, nominee, onSubmit }) => {
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    relationship: '',
    phone: '',
    accessCategories: [],
    governmentId: null
  });
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    if (nominee) {
      setFormData({
        name: nominee.name || '',
        email: nominee.email || '',
        relationship: nominee.relationship || '',
        phone: nominee.phone || '',
        accessCategories: nominee.accessCategories || [],
        governmentId: nominee.governmentId || null
      });
    }
  }, [nominee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
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
  };

  const handleSubmit = () => {
    onSubmit({ ...formData, files: selectedFiles });
  };

  const relationships = ['Brother', 'Sister', 'Spouse', 'Parent', 'Child', 'Other'];
  const categories = ['Loans', 'Insurance', 'Investments', 'Documents'];

  const handleCategoryToggle = (category) => {
    setFormData(prev => ({
      ...prev,
      accessCategories: prev.accessCategories.includes(category)
        ? prev.accessCategories.filter(c => c !== category)
        : [...prev.accessCategories, category]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[78.9%] max-w-[1200px] p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">View Nominee</h2>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Nominee Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nominee Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
              />
            </div>

            {/* Relationship */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship
              </label>
              <select
                name="relationship"
                value={formData.relationship}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
              >
                <option value="">Select</option>
                {relationships.map(rel => (
                  <option key={rel} value={rel}>{rel}</option>
                ))}
              </select>
            </div>

            {/* Access Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access to Categories
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
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
              />
            </div>

            {/* Phone number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
              />
            </div>

            {/* Government ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Government ID
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
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-[#0D344C] text-white rounded-lg hover:bg-opacity-90"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewNomineeModal; 
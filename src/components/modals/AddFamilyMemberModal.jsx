import React, { useState } from 'react';

const AddFamilyMemberModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    date_of_birth: '',
    gender: '',
    blood_group: '',
    contact_number: '',
    secondary_contact: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genders = ['Male', 'Female', 'Other'];

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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.blood_group) newErrors.blood_group = 'Blood group is required';
    if (!formData.contact_number.trim()) newErrors.contact_number = 'Contact number is required';
    
    // Validate phone numbers
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (formData.contact_number && !phoneRegex.test(formData.contact_number.replace(/\s/g, ''))) {
      newErrors.contact_number = 'Invalid contact number format';
    }
    if (formData.secondary_contact && !phoneRegex.test(formData.secondary_contact.replace(/\s/g, ''))) {
      newErrors.secondary_contact = 'Invalid secondary contact format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        await onSubmit(formData);
        onClose();
      } catch (error) {
        console.error('Error submitting form:', error);
        alert(error.message || 'Failed to add family member');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      date_of_birth: '',
      gender: '',
      blood_group: '',
      contact_number: '',
      secondary_contact: ''
    });
    setErrors({});
  };

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
          <h2 className="text-lg font-medium">Add Family Member</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className={`w-full px-3 py-2 border ${errors.date_of_birth ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]`}
            />
            {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.gender ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]`}
              >
                <option value="">Select gender</option>
                {genders.map(gender => (
                  <option key={gender} value={gender}>{gender}</option>
                ))}
              </select>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Blood Group <span className="text-red-500">*</span>
              </label>
              <select
                name="blood_group"
                value={formData.blood_group}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.blood_group ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]`}
              >
                <option value="">Select blood group</option>
                {bloodGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
              {errors.blood_group && <p className="text-red-500 text-xs mt-1">{errors.blood_group}</p>}
            </div>
          </div>

          {/* Contact Numbers */}
          <div className="grid grid-cols-2 gap-4">
            {/* Primary Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="contact_number"
                value={formData.contact_number}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className={`w-full px-3 py-2 border ${errors.contact_number ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]`}
              />
              {errors.contact_number && <p className="text-red-500 text-xs mt-1">{errors.contact_number}</p>}
            </div>

            {/* Secondary Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secondary Contact
              </label>
              <input
                type="tel"
                name="secondary_contact"
                value={formData.secondary_contact}
                onChange={handleChange}
                placeholder="+91 9876543210"
                className={`w-full px-3 py-2 border ${errors.secondary_contact ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]`}
              />
              {errors.secondary_contact && <p className="text-red-500 text-xs mt-1">{errors.secondary_contact}</p>}
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

export default AddFamilyMemberModal; 
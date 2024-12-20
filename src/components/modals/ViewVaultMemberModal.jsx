import React, { useState, useRef } from 'react';

const ViewVaultMemberModal = ({ isOpen, onClose, member, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    role: '',
    contact_number: '',
    email: '',
    notes: '',
    document: null
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const relationships = [
    'Spouse', 'Child', 'Parent', 'Sibling', 
    'Grandparent', 'Grandchild', 'Friend', 'Other'
  ];

  const roles = ['Owner', 'Beneficiary', 'Trustee'];

  React.useEffect(() => {
    if (member) {
      setFormData({
        name: member.name || '',
        relationship: member.relationship || '',
        role: member.role || '',
        contact_number: member.contact_number || '',
        email: member.email || '',
        notes: member.notes || '',
        document: null
      });
    }
  }, [member]);

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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.relationship) newErrors.relationship = 'Relationship is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.contact_number.trim()) newErrors.contact_number = 'Contact number is required';
    
    // Validate phone number
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (formData.contact_number && !phoneRegex.test(formData.contact_number.replace(/\s/g, ''))) {
      newErrors.contact_number = 'Invalid contact number format';
    }

    // Validate email if provided
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setLoading(true);
      try {
        await onEdit(member.id, formData);
        setIsEditing(false);
      } catch (error) {
        console.error('Error updating member:', error);
        alert(error.message || 'Failed to update member');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDocumentClick = () => {
    if (member.documentUrl) {
      window.open(member.documentUrl, '_blank');
    }
  };

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium">View Member Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            {isEditing ? (
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
            ) : (
              <p className="text-gray-900">{member.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Relationship */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
              {isEditing ? (
                <div>
                  <select
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors.relationship ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]`}
                  >
                    <option value="">Select relationship</option>
                    {relationships.map(rel => (
                      <option key={rel} value={rel}>{rel}</option>
                    ))}
                  </select>
                  {errors.relationship && <p className="text-red-500 text-xs mt-1">{errors.relationship}</p>}
                </div>
              ) : (
                <p className="text-gray-900">{member.relationship}</p>
              )}
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              {isEditing ? (
                <div>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors.role ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]`}
                  >
                    <option value="">Select role</option>
                    {roles.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                  {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                </div>
              ) : (
                <p className="text-gray-900">{member.role}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Contact Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
              {isEditing ? (
                <div>
                  <input
                    type="tel"
                    name="contact_number"
                    value={formData.contact_number}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors.contact_number ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]`}
                  />
                  {errors.contact_number && <p className="text-red-500 text-xs mt-1">{errors.contact_number}</p>}
                </div>
              ) : (
                <p className="text-gray-900">{member.contact_number}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              {isEditing ? (
                <div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
              ) : (
                <p className="text-gray-900">{member.email || '-'}</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            {isEditing ? (
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
              />
            ) : (
              <p className="text-gray-900">{member.notes || '-'}</p>
            )}
          </div>

          {/* Document */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Document</label>
            {member.document_url ? (
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
              <p className="text-gray-500">No document attached</p>
            )}
            {isEditing && (
              <div className="mt-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="w-full"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                {errors.document && <p className="text-red-500 text-xs mt-1">{errors.document}</p>}
              </div>
            )}
          </div>

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
                    onClick={() => onDelete(member.id)}
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
                    disabled={loading}
                    className="flex items-center text-green-600 hover:text-green-800"
                  >
                    {loading ? 'Saving...' : 'Save'}
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

export default ViewVaultMemberModal; 
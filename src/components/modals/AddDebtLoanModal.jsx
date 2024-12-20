import React, { useState, useRef, useEffect } from 'react';
import { PAYMENT_METHODS } from '../../constants/enums';

const AddDebtLoanModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    flow_type: 'Given',
    person_name: '',
    create_request: false,
    amount: '',
    interest_amount: '',
    amount_due: '',
    payment_mode: '',
    start_date: '',
    due_date: '',
    security: '',
    purpose: '',
    document: null
  });

  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        document: file
      }));
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
    const file = e.dataTransfer.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        document: file
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Calculate amount_due (principal + interest)
    const principal = parseFloat(formData.amount) || 0;
    const interest = parseFloat(formData.interest_amount) || 0;
    const amount_due = principal + interest;

    // Create the submission data with amount_due
    const submissionData = {
      ...formData,
      amount: principal,
      interest_amount: interest,
      amount_due: amount_due
    };

    onSubmit(submissionData);
  };

  useEffect(() => {
    const principal = parseFloat(formData.amount) || 0;
    const interest = parseFloat(formData.interest_amount) || 0;
    const amount_due = principal + interest;

    setFormData(prev => ({
      ...prev,
      amount_due: amount_due
    }));
  }, [formData.amount, formData.interest_amount]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[600px] p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Add New Debts and Loans</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Money Given/Received & Person */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Money Given/Received
              </label>
              <select
                name="flow_type"
                value={formData.flow_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
                required
              >
                <option value="Given">Given</option>
                <option value="Received">Received</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Person
              </label>
              <input
                type="text"
                name="person_name"
                value={formData.person_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
                required
              />
            </div>
          </div>

          {/* Create Request */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="create_request"
                checked={formData.create_request}
                onChange={handleChange}
                className="rounded text-[#0D344C] focus:ring-[#0D344C]"
              />
              <span className="text-sm font-medium text-gray-700">Create Request</span>
            </label>
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Mode
            </label>
            <select
              name="payment_mode"
              value={formData.payment_mode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
              required
            >
              <option value="">Select payment mode</option>
              {Object.values(PAYMENT_METHODS).map(method => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          {/* Amount & Interest */}
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
                Interest
              </label>
              <input
                type="number"
                name="interest_amount"
                value={formData.interest_amount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
              />
            </div>
          </div>

          {/* Amount Due On & Start Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount Due On
              </label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
                required
              />
            </div>
          </div>

          {/* Security */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Security
            </label>
            <input
              type="text"
              name="security"
              value={formData.security}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
              placeholder="Enter security details"
            />
          </div>

          {/* Purpose/Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Purpose/Description
            </label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
              placeholder="Enter purpose or description"
              required
            />
          </div>

          {/* Attachment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attachment
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
                {formData.document ? (
                  <div className="flex items-center justify-center gap-2">
                    <span>{formData.document.name}</span>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, document: null }))}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <>
                    <div>Drag & Drop files here</div>
                    <span className="text-xs text-gray-500">Supported format: .pdf, jpg, jpeg</span>
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Browse Files
                      </button>
                    </div>
                  </>
                )}
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

export default AddDebtLoanModal; 
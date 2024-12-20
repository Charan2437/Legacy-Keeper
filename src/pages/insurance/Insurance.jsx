import React, { useState, useEffect } from 'react';
import { useInsurance } from '../../hooks/useInsurance';
import { useAuth } from '../../contexts/AuthContext';
import AddInsuranceModal from '../../components/modals/AddInsuranceModal';
import ViewInsuranceModal from '../../components/modals/ViewInsuranceModal';
import DeleteModal from '../../components/modals/DeleteModal';
import SuccessModal from '../../components/modals/SuccessModal';
import { formatCurrency } from '../../utils/formatters';

// Icons for each insurance type
const TYPE_ICONS = {
  'All': '📋',
  'Health': '🏥',
  'Life': '💗',
  'Vehicle': '🚗',
  'Property': '🏠',
  'Term': '📅',
  'Content': '📦',
  'Travel': '✈️',
  'Other': '📄'
};

const Insurance = () => {
  const { user } = useAuth();
  const {
    insurances,
    insuranceTypes,
    loading,
    error,
    totalCount,
    totalAmount,
    filters,
    setFilters,
    createInsurance,
    deleteInsurance,
    refresh
  } = useInsurance();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedInsurance, setSelectedInsurance] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSearch = (e) => {
    setFilters(prev => ({
      ...prev,
      searchQuery: e.target.value,
      page: 1
    }));
  };

  const handleTypeFilter = (typeId) => {
    setFilters(prev => ({
      ...prev,
      type: typeId === 'all' ? null : typeId,
      page: 1
    }));
  };

  const handleAddInsurance = async (formData) => {
    try {
      await createInsurance(formData);
      setIsAddModalOpen(false);
      setSuccessMessage('Insurance added successfully');
      setIsSuccessModalOpen(true);
      refresh();
    } catch (err) {
      console.error('Error adding insurance:', err);
      alert(err.message || 'Failed to add insurance');
    }
  };

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Insurance ({totalCount})</h1>
              <p className="text-gray-600">Check Your Insurance</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-[#0D344C] text-white rounded-lg hover:bg-opacity-90"
            >
              + Add New Insurance
            </button>
          </div>

          {/* Insurance Methods */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Insurance Methods</h3>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {/* All Insurance Type Button */}
              <button
                key="all"
                onClick={() => handleTypeFilter('all')}
                className={`flex flex-col items-center p-4 rounded-lg border min-w-[100px] ${
                  !filters.type ? 'border-[#0D344C] bg-blue-50' : 'border-gray-200'
                }`}
              >
                <span className="text-2xl mb-2">{TYPE_ICONS['All']}</span>
                <span className="text-sm">All</span>
              </button>

              {/* Dynamic Insurance Type Buttons */}
              {insuranceTypes.map(type => (
                <button
                  key={type.id}
                  onClick={() => handleTypeFilter(type.id)}
                  className={`flex flex-col items-center p-4 rounded-lg border min-w-[100px] ${
                    filters.type === type.id ? 'border-[#0D344C] bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <span className="text-2xl mb-2">{TYPE_ICONS[type.name] || '📄'}</span>
                  <span className="text-sm">{type.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-4 flex justify-between items-center">
            <input
              type="text"
              placeholder="Search insurances..."
              value={filters.searchQuery}
              onChange={handleSearch}
              className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
            />
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2">
                <span>Filters</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg">
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Insurance Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Insurance Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Insurance Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {insurances.map(insurance => (
                <tr key={insurance.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(insurance.start_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{insurance.description}</td>
                  <td className="px-6 py-4">{insurance.insurance_types.name}</td>
                  <td className="px-6 py-4">{formatCurrency(insurance.amount)}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedInsurance(insurance);
                          setIsViewModalOpen(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-md"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedInsurance(insurance);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-md text-red-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <AddInsuranceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddInsurance}
      />

      <ViewInsuranceModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        insurance={selectedInsurance}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={async () => {
          try {
            await deleteInsurance(selectedInsurance.id);
            setIsDeleteModalOpen(false);
            setSuccessMessage('Insurance deleted successfully');
            setIsSuccessModalOpen(true);
            refresh();
          } catch (err) {
            console.error('Error deleting insurance:', err);
            alert(err.message || 'Failed to delete insurance');
          }
        }}
        title="Delete Insurance"
        message="Are you sure you want to delete this insurance? This action cannot be undone."
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={successMessage}
      />
    </div>
  );
};

export default Insurance; 
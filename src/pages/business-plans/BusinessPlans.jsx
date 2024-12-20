import React, { useState } from 'react';
import { useBusinessPlans } from '../../hooks/useBusinessPlans';
import { useAuth } from '../../contexts/AuthContext';
import AddBusinessPlanModal from '../../components/modals/AddBusinessPlanModal';
import ViewBusinessPlanModal from '../../components/modals/ViewBusinessPlanModal';
import SuccessModal from '../../components/modals/SuccessModal';
import Pagination from '../../components/common/Pagination';
import { formatCurrency } from '../../utils/formatters';

const BusinessPlans = () => {
  const { user } = useAuth();
  const {
    businessPlans,
    loading,
    error,
    totalCount,
    filters,
    setFilters,
    createBusinessPlan,
    updateBusinessPlan,
    deleteBusinessPlan,
    refresh
  } = useBusinessPlans();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSearch = (e) => {
    setFilters(prev => ({
      ...prev,
      searchQuery: e.target.value,
      page: 1
    }));
  };

  const handleAddBusinessPlan = async (formData) => {
    try {
      await createBusinessPlan(formData);
      setIsAddModalOpen(false);
      setSuccessMessage('added');
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('Error adding business plan:', err);
      alert(err.message || 'Failed to add business plan');
    }
  };

  const handleViewPlan = (plan) => {
    setSelectedPlan(plan);
    setIsViewModalOpen(true);
  };

  const handleEditPlan = async (id, updates) => {
    try {
      await updateBusinessPlan(id, updates);
      setSuccessMessage('edited');
      setIsSuccessModalOpen(true);
      setIsViewModalOpen(false);
    } catch (err) {
      console.error('Error updating business plan:', err);
      alert(err.message || 'Failed to update business plan');
    }
  };

  const handleDeletePlan = async (id) => {
    try {
      await deleteBusinessPlan(id);
      setSuccessMessage('deleted');
      setIsSuccessModalOpen(true);
      setIsViewModalOpen(false);
    } catch (err) {
      console.error('Error deleting business plan:', err);
      alert(err.message || 'Failed to delete business plan');
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Business Plans ({totalCount})</h1>
              <p className="text-gray-600">Manage your business plans and successions</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-[#0D344C] text-white rounded-lg hover:bg-opacity-90"
            >
              + Add New Business Plan
            </button>
          </div>

          {/* Search */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search business plans..."
                value={filters.searchQuery}
                onChange={handleSearch}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Business Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Business Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Investment Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ownership %
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {businessPlans.map(plan => (
                <tr key={plan.id}>
                  <td className="px-6 py-4">{plan.name}</td>
                  <td className="px-6 py-4">{plan.business_types?.name}</td>
                  <td className="px-6 py-4">{formatCurrency(plan.investment_amount)}</td>
                  <td className="px-6 py-4">{plan.ownership_percentage}%</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewPlan(plan)}
                        className="p-2 hover:bg-gray-100 rounded-md"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="p-2 hover:bg-gray-100 rounded-md text-red-500"
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

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <Pagination
            currentPage={filters.page}
            totalItems={totalCount}
            itemsPerPage={filters.perPage}
            onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
          />
        </div>
      </div>

      {/* Modals */}
      <AddBusinessPlanModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddBusinessPlan}
      />

      <ViewBusinessPlanModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        businessPlan={selectedPlan}
        onEdit={handleEditPlan}
        onDelete={handleDeletePlan}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={successMessage}
        type="business plan"
      />
    </div>
  );
};

export default BusinessPlans; 
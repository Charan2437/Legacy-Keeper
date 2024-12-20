import React, { useState } from 'react';
import { useDebtsLoans } from '../../hooks/useDebtsLoans';
import { useAuth } from '../../contexts/AuthContext';
import { debtsLoansService } from '../../services/debtsLoans';
import AddDebtLoanModal from '../../components/modals/AddDebtLoanModal';
import DeleteModal from '../../components/modals/DeleteModal';
import SuccessModal from '../../components/modals/SuccessModal';
import ViewDebtLoanModal from '../../components/modals/ViewDebtLoanModal';
import Pagination from '../../components/common/Pagination';
import { formatCurrency } from '../../utils/formatters';

const DebtsAndLoans = () => {
  const { user } = useAuth();
  const {
    debtsLoans,
    loading,
    error,
    totalCount,
    filters,
    setFilters,
    createDebtLoan,
    deleteDebtLoan,
    refresh
  } = useDebtsLoans();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedDebtLoan, setSelectedDebtLoan] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSearch = (e) => {
    setFilters(prev => ({
      ...prev,
      searchQuery: e.target.value,
      page: 1
    }));
  };

  const handleFlowTypeFilter = (type) => {
    setFilters(prev => ({
      ...prev,
      flowType: type === 'All' ? null : type,
      page: 1
    }));
  };

  const handleAddDebtLoan = async (formData) => {
    try {
      let document_url = null;
      if (formData.document) {
        document_url = await debtsLoansService.uploadDocument(formData.document, user.id);
      }

      const debtLoanData = {
        flow_type: formData.flow_type,
        person_name: formData.person_name,
        create_request: formData.create_request,
        amount: parseFloat(formData.amount),
        interest_amount: parseFloat(formData.interest_amount || 0),
        amount_due: parseFloat(formData.amount_due),
        payment_mode: formData.payment_mode,
        start_date: formData.start_date,
        due_date: formData.due_date,
        security: formData.security,
        purpose: formData.purpose,
        document_url
      };

      await createDebtLoan(debtLoanData);
      setIsAddModalOpen(false);
      setSuccessMessage('added');
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('Error adding debt/loan:', err);
      alert(err.message || 'Failed to add debt/loan');
    }
  };

  const handleEdit = (debtLoan) => {
    setSelectedDebtLoan(debtLoan);
    console.log('Edit debt/loan:', debtLoan);
  };

  const handleView = (debtLoan) => {
    setSelectedDebtLoan(debtLoan);
    setIsViewModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteDebtLoan(selectedDebtLoan.id);
      setIsDeleteModalOpen(false);
      setSuccessMessage('deleted');
      setIsSuccessModalOpen(true);
      await refresh();
    } catch (err) {
      console.error('Error deleting debt/loan:', err);
      alert(err.message || 'Failed to delete debt/loan');
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold">Debts and Loans</h1>
              <div className="mt-4 flex gap-4">
                <button
                  onClick={() => handleFlowTypeFilter('Given')}
                  className={`px-4 py-2 rounded-lg ${
                    filters.flowType === 'Given' ? 'bg-[#0D344C] text-white' : 'bg-gray-100'
                  }`}
                >
                  Money Given (25)
                </button>
                <button
                  onClick={() => handleFlowTypeFilter('Received')}
                  className={`px-4 py-2 rounded-lg ${
                    filters.flowType === 'Received' ? 'bg-[#0D344C] text-white' : 'bg-gray-100'
                  }`}
                >
                  Money Received (18)
                </button>
              </div>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-[#0D344C] text-white rounded-lg hover:bg-opacity-90"
            >
              + Add New Entry
            </button>
          </div>

          {/* Search and Filters */}
          <div className="mt-4 flex gap-4">
            <input
              type="text"
              placeholder="Search..."
              value={filters.searchQuery}
              onChange={handleSearch}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
            />
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Filters
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Download
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Request Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Person
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Mode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interest
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount Due On
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Security
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {debtsLoans.map(item => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(item.start_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{item.purpose}</td>
                  <td className="px-6 py-4">{item.person_name}</td>
                  <td className="px-6 py-4">{item.payment_mode}</td>
                  <td className="px-6 py-4">{formatCurrency(item.amount)}</td>
                  <td className="px-6 py-4">{formatCurrency(item.interest_amount)}</td>
                  <td className="px-6 py-4">
                    {new Date(item.due_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{item.security}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(item)}
                        className="p-2 hover:bg-gray-100 rounded-md"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDebtLoan(item);
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

        {/* Pagination */}
        <div className="p-4">
          <Pagination
            currentPage={filters.page}
            totalItems={totalCount}
            itemsPerPage={filters.perPage}
            onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
          />
        </div>
      </div>

      {/* Modals */}
      <AddDebtLoanModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddDebtLoan}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={successMessage}
        type="debt/loan"
      />

      <ViewDebtLoanModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        debtLoan={selectedDebtLoan}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDelete}
        title="Delete Debt/Loan"
        message="Are you sure you want to delete this debt/loan record? This action cannot be undone."
      />
    </div>
  );
};

export default DebtsAndLoans; 
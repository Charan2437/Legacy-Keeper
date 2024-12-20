import React, { useState } from 'react';
import { useTransactions } from '../../hooks/useTransactions';
import { useAuth } from '../../contexts/AuthContext';
import { transactionService } from '../../services/transactions';
import AddTransactionModal from '../../components/modals/AddTransactionModal';
import DeleteModal from '../../components/modals/DeleteModal';
import SuccessModal from '../../components/modals/SuccessModal';
import ViewTransactionModal from '../../components/modals/ViewTransactionModal';
import Pagination from '../../components/common/Pagination';
import { formatCurrency } from '../../utils/formatters';
import { PAYMENT_METHODS } from '../../constants/enums';

const Transactions = () => {
  const { user } = useAuth();
  const {
    transactions,
    setTransactions,
    loading,
    error,
    totalCount,
    filters,
    setFilters,
    createTransaction,
    updateTransaction,
    deleteTransaction
  } = useTransactions();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSearch = (e) => {
    setFilters(prev => ({
      ...prev,
      searchQuery: e.target.value,
      page: 1
    }));
  };

  const handlePaymentModeFilter = (mode) => {
    setFilters(prev => ({
      ...prev,
      paymentMode: mode === 'All' ? null : mode,
      page: 1
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleAddTransaction = async (formData) => {
    try {
      // Upload document if exists
      let document_url = null;
      if (formData.document) {
        document_url = await transactionService.uploadDocument(formData.document, user.id);
      }

      // Create transaction with document URL
      const transactionData = {
        name: formData.name,
        person_party: formData.person_party,
        type: formData.type,
        payment_mode: formData.payment_mode,
        amount: parseFloat(formData.amount),
        description: formData.description,
        document_url
      };

      console.log('Submitting transaction:', transactionData);
      await createTransaction(transactionData);
      setIsAddModalOpen(false);
      setSuccessMessage('added');
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('Error adding transaction:', err);
      alert(err.message || 'Failed to add transaction');
    }
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setIsViewModalOpen(true);
  };

  const handleUpdateTransaction = async (formData) => {
    try {
      // Upload new document if exists
      let document_url = formData.document_url;
      if (formData.document && typeof formData.document !== 'string') {
        document_url = await transactionService.uploadDocument(formData.document, user.id);
      }

      // Update transaction with document URL
      const transactionData = {
        name: formData.name,
        person_party: formData.person_party,
        type: formData.type,
        payment_mode: formData.payment_mode,
        amount: parseFloat(formData.amount),
        description: formData.description,
        document_url
      };

      await updateTransaction(selectedTransaction.id, transactionData);
      setIsViewModalOpen(false);
      setSuccessMessage('edited');
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('Error updating transaction:', err);
      // Handle error
    }
  };

  const handleDeleteClick = (transaction) => {
    setSelectedTransaction(transaction);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteTransaction(selectedTransaction.id);
      setIsDeleteModalOpen(false);
      setSuccessMessage('deleted');
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('Error deleting transaction:', err);
      // Handle error
    }
  };

  const handleTransactionUpdate = (updatedTransaction) => {
    setTransactions(prev => 
      prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
    );
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold">Transactions</h1>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-[#0D344C] text-white rounded-lg hover:bg-opacity-90"
            >
              + Add New Transaction
            </button>
          </div>

          {/* Search and Filters */}
          <div className="mt-4 flex gap-4">
            <input
              type="text"
              placeholder="Search transactions..."
              value={filters.searchQuery}
              onChange={handleSearch}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
            />
          </div>

          {/* Payment Mode Filter */}
          <div className="mt-4 flex gap-4">
            <button
              key="All"
              onClick={() => handlePaymentModeFilter('All')}
              className={`px-4 py-2 rounded-lg ${
                !filters.paymentMode ? 'bg-[#0D344C] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {Object.values(PAYMENT_METHODS).map(mode => (
              <button
                key={mode}
                onClick={() => handlePaymentModeFilter(mode)}
                className={`px-4 py-2 rounded-lg ${
                  filters.paymentMode === mode
                    ? 'bg-[#0D344C] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Person/Party
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Mode
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{transaction.name}</td>
                  <td className="px-6 py-4">{transaction.person_party}</td>
                  <td className="px-6 py-4">{transaction.payment_mode}</td>
                  <td className="px-6 py-4">{formatCurrency(transaction.amount)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      transaction.type === 'Paid' 
                        ? 'bg-red-100 text-red-600' 
                        : 'bg-green-100 text-green-600'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewTransaction(transaction)}
                        className="p-2 hover:bg-gray-100 rounded-md"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(transaction)}
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
        <Pagination
          currentPage={filters.page}
          totalItems={totalCount}
          itemsPerPage={filters.perPage}
          onPageChange={handlePageChange}
        />

        {/* Modals */}
        <AddTransactionModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddTransaction}
        />

        <ViewTransactionModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          transaction={selectedTransaction}
          onUpdate={handleTransactionUpdate}
        />

        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onDelete={handleDelete}
          type="transaction"
          nomineeName={selectedTransaction?.name}
        />

        <SuccessModal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          message={successMessage}
          type="transaction"
        />
      </div>
    </div>
  );
};

export default Transactions; 
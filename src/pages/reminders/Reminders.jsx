import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useReminders } from '../../hooks/useReminders';
import AddReminderModal from '../../components/modals/AddReminderModal';
import ViewReminderModal from '../../components/modals/ViewReminderModal';
import DeleteModal from '../../components/modals/DeleteModal';
import SuccessModal from '../../components/modals/SuccessModal';
import Pagination from '../../components/common/Pagination';

const Reminders = () => {
  const { user } = useAuth();
  const {
    reminders,
    loading,
    error,
    totalCount,
    filters,
    setFilters,
    createReminder,
    updateReminder,
    deleteReminder
  } = useReminders();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSearch = (e) => {
    setFilters(prev => ({
      ...prev,
      searchQuery: e.target.value,
      page: 1
    }));
  };

  const handleAddReminder = async (formData) => {
    try {
      await createReminder({
        ...formData,
        user_id: user.id
      });
      setIsAddModalOpen(false);
      setSuccessMessage('added');
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('Error adding reminder:', err);
      alert(err.message || 'Failed to add reminder');
    }
  };

  const handleViewReminder = (reminder) => {
    setSelectedReminder(reminder);
    setIsViewModalOpen(true);
  };

  const handleEditReminder = async (id, updates) => {
    try {
      await updateReminder(id, updates);
      setIsViewModalOpen(false);
      setSuccessMessage('edited');
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('Error updating reminder:', err);
      alert(err.message || 'Failed to update reminder');
    }
  };

  const handleDeleteClick = (reminder) => {
    if (!reminder?.id) {
      console.error('No reminder ID found:', reminder);
      return;
    }
    setSelectedReminder(reminder);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      if (!selectedReminder?.id) {
        throw new Error('No reminder ID found');
      }
      await deleteReminder(selectedReminder.id);
      setIsDeleteModalOpen(false);
      setSuccessMessage('deleted');
      setIsSuccessModalOpen(true);
      setSelectedReminder(null);
    } catch (err) {
      console.error('Error deleting reminder:', err);
      alert(err.message || 'Failed to delete reminder');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Welcome {user?.user_metadata?.full_name || 'User'}!</h1>
          <p className="text-gray-600">Check Your Family Vault</p>
        </div>
      </div>

      {/* Reminders Section */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              Reminders ({totalCount})
            </h2>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-[#0D344C] text-white rounded-lg hover:bg-opacity-90"
            >
              + Add New Reminder
            </button>
          </div>

          {/* Search and Download */}
          <div className="flex justify-between items-center">
            <div className="relative w-96">
              <input
                type="text"
                placeholder="Search"
                value={filters.searchQuery}
                onChange={handleSearch}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
              />
            </div>
            <button className="px-4 py-2 text-gray-600 hover:text-gray-800">
              Download
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Reminder name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Start Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Frequency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Notes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reminders.map(reminder => (
                <tr key={reminder.id}>
                  <td className="px-6 py-4">{reminder.title}</td>
                  <td className="px-6 py-4">{reminder.type}</td>
                  <td className="px-6 py-4">
                    {new Date(reminder.start_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">{reminder.frequency}</td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs truncate">
                      {reminder.description}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewReminder(reminder)}
                        className="p-2 hover:bg-gray-100 rounded-md"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(reminder)}
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
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm text-gray-700">
                10 Items per page
              </span>
            </div>
            <Pagination
              currentPage={filters.page}
              totalItems={totalCount}
              itemsPerPage={10}
              onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddReminderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddReminder}
      />

      <ViewReminderModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        reminder={selectedReminder}
        onSubmit={handleEditReminder}
        onDelete={handleDeleteClick}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDelete}
        type="reminder"
        name={selectedReminder?.title}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={successMessage}
        type="reminder"
      />
    </div>
  );
};

export default Reminders; 
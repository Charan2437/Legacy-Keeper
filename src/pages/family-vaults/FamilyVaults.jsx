import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFamilyVaults } from '../../hooks/useFamilyVaults';
import AddVaultModal from '../../components/modals/AddVaultModal';
import DeleteModal from '../../components/modals/DeleteModal';
import SuccessModal from '../../components/modals/SuccessModal';
import Pagination from '../../components/common/Pagination';

const FamilyVaults = () => {
  const navigate = useNavigate();
  const {
    vaults,
    loading,
    error,
    totalCount,
    filters,
    setFilters,
    createVault,
    deleteVault
  } = useFamilyVaults();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [vaultToDelete, setVaultToDelete] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSearch = (e) => {
    setFilters(prev => ({
      ...prev,
      searchQuery: e.target.value,
      page: 1
    }));
  };

  const handleAddVault = async (formData) => {
    try {
      await createVault(formData);
      setIsAddModalOpen(false);
      setSuccessMessage('added');
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('Error adding vault:', err);
      alert(err.message || 'Failed to add vault');
    }
  };

  const handleViewVault = (vault) => {
    if (vault?.name) {
      const urlName = encodeURIComponent(vault.name.toLowerCase().replace(/\s+/g, '-'));
      navigate(`/family/vaults/${urlName}`);
    }
  };

  const handleDeleteVault = async () => {
    try {
      await deleteVault(vaultToDelete.id);
      setIsDeleteModalOpen(false);
      setSuccessMessage('deleted');
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('Error deleting vault:', err);
      alert(err.message || 'Failed to delete vault');
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D344C]"></div>
    </div>
  );
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Family Vaults ({totalCount})</h1>
              <p className="text-gray-600">Manage your family vaults and members</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-[#0D344C] text-white rounded-lg hover:bg-opacity-90"
            >
              + Add New Vault
            </button>
          </div>

          {/* Search */}
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search vaults..."
                value={filters.searchQuery}
                onChange={handleSearch}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0D344C]"
              />
            </div>
          </div>
        </div>

        {/* Vaults Grid */}
        <div className="p-6">
          {vaults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vaults.map(vault => (
                <div
                  key={vault.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-medium">{vault.name}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewVault(vault)}
                        className="p-2 hover:bg-gray-100 rounded-md"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          setVaultToDelete(vault);
                          setIsDeleteModalOpen(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-md text-red-500"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-4">{vault.description || 'No description'}</p>
                  <div className="text-sm text-gray-500">
                    Created {new Date(vault.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4">
                <svg className="w-full h-full text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-2">No Vaults Found</p>
            </div>
          )}
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
      <AddVaultModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddVault}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteVault}
        type="vault"
        name={vaultToDelete?.name}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={successMessage}
        type="vault"
      />
    </div>
  );
};

export default FamilyVaults; 
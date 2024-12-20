import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import AddTrusteeModal from '../../components/modals/AddTrusteeModal';
import SuccessModal from '../../components/modals/SuccessModal';
import ViewNomineeModal from '../../components/modals/ViewNomineeModal';
import DeleteModal from '../../components/modals/DeleteModal';
import Pagination from '../../components/common/Pagination';

const Trustees = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedTrustee, setSelectedTrustee] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('added');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [trusteeToDelete, setTrusteeToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const trustees = [
    { name: 'Jacob Jones', email: 'debra.holt@example.com', phone: '8935647836', secondaryPhone: '4589647836' },
    { name: 'Savannah Nguyen', email: 'alma.lawson@example.com', phone: '5698647836', secondaryPhone: '8063647836' },
    { name: 'Cameron Williamson', email: 'willie.jennings@example.com', phone: '7202647836', secondaryPhone: '2478647836' },
    { name: 'Albert Flores', email: 'tanya.hill@example.com', phone: '8512647836', secondaryPhone: '5899647836' },
    { name: 'Devon Lane', email: 'georgia.young@example.com', phone: '2896647836', secondaryPhone: '1478647836' },
    { name: 'Cody Fisher', email: 'curtis.weaver@example.com', phone: '1236647836', secondaryPhone: '6578647836' },
    { name: 'Dianne Russell', email: 'dolores.chambers@example.com', phone: '8946647836', secondaryPhone: '3569647836' },
    { name: 'Jenny Wilson', email: 'debbie.baker@example.com', phone: '0789647836', secondaryPhone: '4589647836' },
    { name: 'Kathryn Murphy', email: 'deanna.curtis@example.com', phone: '9536647836', secondaryPhone: '6874647836' },
    { name: 'Darlene Robertson', email: 'Paid', phone: '6792647836', secondaryPhone: '1798647836' },
  ];

  const filteredTrustees = useMemo(() => {
    return trustees.filter(trustee =>
      trustee.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [trustees, searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAddTrustee = (formData) => {
    console.log('New Trustee Data:', formData);
    setSuccessMessage('added');
    setIsModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
  };

  const handleViewTrustee = (trustee) => {
    setSelectedTrustee(trustee);
    setIsViewModalOpen(true);
  };

  const handleViewSubmit = (formData) => {
    console.log('Updated Trustee Data:', formData);
    setSuccessMessage('edited');
    setIsViewModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  const handleDeleteClick = (trustee) => {
    setTrusteeToDelete(trustee);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    console.log('Deleting trustee:', trusteeToDelete);
    setIsDeleteModalOpen(false);
    setSuccessMessage('deleted');
    setIsSuccessModalOpen(true);
  };

  // Calculate pagination
  const currentItems = filteredTrustees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full">
      {/* Header with Breadcrumb */}
      <div className="w-full bg-white px-6 py-4 border-b border-gray-200">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center text-sm text-gray-500">
            <Link to="/" className="hover:text-gray-700">Dashboard</Link>
            <span className="mx-2">›</span>
            <span className="text-gray-900">Trustees</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full p-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-semibold">
              Trustees ({filteredTrustees.length})
            </h1>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#0D344C] text-white px-4 py-2 rounded-lg hover:bg-opacity-90"
            >
              + Add Trustee
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-80">
              <input
                type="text"
                placeholder="Search by name"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg pl-10"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </div>
            <div className="flex gap-4">
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg">
                <span>Filters</span>
              </button>
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg">
                <span>Download</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-gray-200">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Name</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Email Address</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Phone Number</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Secondary Phone Number</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((trustee, index) => (
                  <tr key={index} className="border-b border-gray-200 last:border-b-0">
                    <td className="px-6 py-4">{trustee.name}</td>
                    <td className="px-6 py-4">{trustee.email}</td>
                    <td className="px-6 py-4">{trustee.phone}</td>
                    <td className="px-6 py-4">{trustee.secondaryPhone}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewTrustee(trustee)}
                          className="p-2 hover:bg-gray-100 rounded-md"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(trustee)}
                          className="p-2 hover:bg-gray-100 rounded-md text-red-500"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTrustees.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      No trustees found matching "{searchQuery}"
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            totalItems={filteredTrustees.length}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />

          {/* Add Modal */}
          <AddTrusteeModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleAddTrustee}
          />

          {/* Success Modal */}
          <SuccessModal
            isOpen={isSuccessModalOpen}
            onClose={handleSuccessModalClose}
            message={successMessage}
            type="trustee"
          />

          {/* View/Edit Modal */}
          <ViewNomineeModal
            isOpen={isViewModalOpen}
            onClose={() => setIsViewModalOpen(false)}
            nominee={selectedTrustee || {}}
            onSubmit={handleViewSubmit}
            title="View Trustee"
            type="trustee"
            fields={[
              { name: 'name', label: 'Trustee Name' },
              { name: 'email', label: 'Email Address' },
              { name: 'phone', label: 'Phone Number' },
              { name: 'secondaryPhone', label: 'Secondary Phone Number' }
            ]}
          />

          {/* Delete Modal */}
          <DeleteModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onDelete={handleDelete}
            nomineeName={trusteeToDelete?.name}
            type="trustee"
          />
        </div>
      </div>
    </div>
  );
};

export default Trustees; 
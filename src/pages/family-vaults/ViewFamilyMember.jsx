import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { familyVaultsService } from '../../services/familyVaults';
import { useVaultMembers } from '../../hooks/useFamilyVaults';
import AddVaultMemberModal from '../../components/modals/AddVaultMemberModal';
import ViewVaultMemberModal from '../../components/modals/ViewVaultMemberModal';
import DeleteModal from '../../components/modals/DeleteModal';
import SuccessModal from '../../components/modals/SuccessModal';
import EmptyState from '../../components/common/EmptyState';

const ViewFamilyMember = () => {
  const { vaultName } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [vault, setVault] = useState(null);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isViewMemberModalOpen, setIsViewMemberModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isDeleteMemberModalOpen, setIsDeleteMemberModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    members,
    loading: membersLoading,
    error: membersError,
    createMember,
    updateMember,
    deleteMember,
    getDocumentUrl
  } = useVaultMembers(vault?.id);

  useEffect(() => {
    console.log('Auth state:', { 
      isAuthenticated: !!user, 
      userId: user?.id,
      vaultName 
    });
  }, [user, vaultName]);

  useEffect(() => {
    const fetchVault = async () => {
      if (!vaultName || !user) {
        console.log('Missing required data:', { vaultName, userId: user?.id });
        return;
      }

      try {
        setLoading(true);
        const decodedName = decodeURIComponent(vaultName);
        const formattedName = decodedName
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        console.log('Formatted name:', formattedName);

        const data = await familyVaultsService.getVaultByName(formattedName, user.id);
        console.log('Fetched vault data:', data);

        if (data) {
          setVault(data);
          setError(null);
        } else {
          setError('Vault not found');
          navigate('/family/vaults');
        }
      } catch (err) {
        console.error('Error fetching vault:', err);
        setError(err.message || 'Failed to fetch vault details');
        navigate('/family/vaults');
      } finally {
        setLoading(false);
      }
    };

    fetchVault();
  }, [vaultName, user, navigate]);

  const handleAddMember = async (formData) => {
    try {
      await createMember(formData);
      setIsAddMemberModalOpen(false);
      setSuccessMessage('added');
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('Error adding member:', err);
      alert(err.message || 'Failed to add member');
    }
  };

  const handleViewMember = async (member) => {
    if (member.document_url) {
      try {
        const url = await getDocumentUrl(member.document_url);
        member.documentUrl = url;
      } catch (error) {
        console.error('Error getting document URL:', error);
      }
    }
    setSelectedMember(member);
    setIsViewMemberModalOpen(true);
  };

  const handleEditMember = async (id, updates) => {
    try {
      await updateMember(id, updates);
      setSuccessMessage('updated');
      setIsSuccessModalOpen(true);
      setIsViewMemberModalOpen(false);
    } catch (err) {
      console.error('Error updating member:', err);
      alert(err.message || 'Failed to update member');
    }
  };

  const handleDeleteMember = async () => {
    try {
      await deleteMember(memberToDelete.id);
      setIsDeleteMemberModalOpen(false);
      setSuccessMessage('deleted');
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('Error deleting member:', err);
      alert(err.message || 'Failed to delete member');
    }
  };

  if (loading || membersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D344C]"></div>
      </div>
    );
  }

  if (error || membersError) {
    return (
      <EmptyState
        title="Error"
        message={error || membersError}
        actionText="Go Back"
        onAction={() => navigate('/family/vaults')}
      />
    );
  }

  if (!vault) {
    return (
      <EmptyState
        title="Vault Not Found"
        message="The vault you're looking for doesn't exist or you don't have access to it."
        actionText="Go Back"
        onAction={() => navigate('/family/vaults')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <button
                  onClick={() => navigate('/family/vaults')}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Family Vaults
                </button>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-4 text-gray-500">{vault.name}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Vault Details Card */}
        <div className="bg-white shadow-sm rounded-lg mb-6 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{vault.name}</h1>
              <p className="mt-2 text-gray-600">{vault.description || 'No description provided'}</p>
            </div>
            <button
              onClick={() => setIsAddMemberModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0D344C] hover:bg-opacity-90 focus:outline-none"
            >
              Add Member
            </button>
          </div>
        </div>

        {/* Members List */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Vault Members ({members?.length || 0})
            </h2>
          </div>

          {members && members.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Relationship
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{member.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{member.role}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{member.relationship}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{member.contact_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewMember(member)}
                          className="text-[#0D344C] hover:text-opacity-80 mr-4"
                        >
                          View
                        </button>
                        <button
                          onClick={() => {
                            setMemberToDelete(member);
                            setIsDeleteMemberModalOpen(true);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <EmptyState
                title="No Members Found"
                message="Start by adding members to your vault."
                actionText="Add Member"
                onAction={() => setIsAddMemberModalOpen(true)}
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddVaultMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onSubmit={handleAddMember}
      />

      <ViewVaultMemberModal
        isOpen={isViewMemberModalOpen}
        onClose={() => setIsViewMemberModalOpen(false)}
        member={selectedMember}
        onEdit={handleEditMember}
        onDelete={(id) => {
          setMemberToDelete({ id });
          setIsViewMemberModalOpen(false);
          setIsDeleteMemberModalOpen(true);
        }}
      />

      <DeleteModal
        isOpen={isDeleteMemberModalOpen}
        onClose={() => setIsDeleteMemberModalOpen(false)}
        onDelete={handleDeleteMember}
        type="member"
        name={memberToDelete?.name}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={successMessage}
        type="vault member"
      />
    </div>
  );
};

export default ViewFamilyMember; 
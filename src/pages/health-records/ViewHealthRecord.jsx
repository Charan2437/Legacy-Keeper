import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { healthRecordsService } from '../../services/healthRecords';
import { useHealthConditions } from '../../hooks/useHealthRecords';
import AddHealthConditionModal from '../../components/modals/AddHealthConditionModal';
import ViewHealthConditionModal from '../../components/modals/ViewHealthConditionModal';
import DeleteModal from '../../components/modals/DeleteModal';
import SuccessModal from '../../components/modals/SuccessModal';
import EditFamilyMemberModal from '../../components/modals/EditFamilyMemberModal';

const ViewHealthRecord = () => {
  const { memberName } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [member, setMember] = useState(null);
  const [isAddConditionModalOpen, setIsAddConditionModalOpen] = useState(false);
  const [isViewConditionModalOpen, setIsViewConditionModalOpen] = useState(false);
  const [selectedCondition, setSelectedCondition] = useState(null);
  const [isDeleteMemberModalOpen, setIsDeleteMemberModalOpen] = useState(false);
  const [isDeleteConditionModalOpen, setIsDeleteConditionModalOpen] = useState(false);
  const [conditionToDelete, setConditionToDelete] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditMemberModalOpen, setIsEditMemberModalOpen] = useState(false);

  // Fetch member details
  useEffect(() => {
    const fetchMember = async () => {
      try {
        setLoading(true);
        const data = await healthRecordsService.getFamilyMemberByName(memberName);
        if (data) {
          setMember(data);
          setError(null);
        } else {
          setError('Member not found');
        }
      } catch (err) {
        console.error('Error fetching member:', err);
        setError(err.message || 'Failed to fetch member details');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMember();
    }
  }, [memberName, user]);

  // Use the health conditions hook
  const {
    conditions,
    loading: conditionsLoading,
    error: conditionsError,
    createCondition,
    updateCondition,
    deleteCondition
  } = useHealthConditions(member?.id);

  const handleBack = () => {
    navigate('/family/health-records');
  };

  const handleAddCondition = async (formData) => {
    try {
      await createCondition({
        ...formData,
        member_id: member.id,
        user_id: user.id
      });
      setIsAddConditionModalOpen(false);
      setSuccessMessage('added');
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('Error adding health condition:', err);
      alert(err.message || 'Failed to add health condition');
    }
  };

  const handleViewCondition = (condition) => {
    setSelectedCondition(condition);
    setIsViewConditionModalOpen(true);
  };

  const handleEditCondition = async (id, updates) => {
    try {
      await updateCondition(id, updates);
      setSuccessMessage('edited');
      setIsSuccessModalOpen(true);
      setIsViewConditionModalOpen(false);
    } catch (err) {
      console.error('Error updating health condition:', err);
      alert(err.message || 'Failed to update health condition');
    }
  };

  const handleDeleteMember = async () => {
    try {
      await healthRecordsService.deleteFamilyMember(member.id);
      setIsDeleteMemberModalOpen(false);
      setSuccessMessage('deleted');
      setIsSuccessModalOpen(true);
      setTimeout(() => {
        navigate('/family/health-records');
      }, 2000);
    } catch (err) {
      console.error('Error deleting member:', err);
      alert(err.message || 'Failed to delete member');
    }
  };

  const handleDeleteCondition = async () => {
    try {
      await deleteCondition(conditionToDelete.id);
      setIsDeleteConditionModalOpen(false);
      setSuccessMessage('deleted');
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error('Error deleting condition:', err);
      alert(err.message || 'Failed to delete condition');
    }
  };

  const handleEditMember = async (updates) => {
    try {
      await healthRecordsService.updateFamilyMember(member.id, updates);
      setIsEditMemberModalOpen(false);
      setSuccessMessage('edited');
      setIsSuccessModalOpen(true);
      // Refresh member data
      const updatedMember = await healthRecordsService.getFamilyMemberByName(memberName);
      setMember(updatedMember);
    } catch (err) {
      console.error('Error updating family member:', err);
      alert(err.message || 'Failed to update family member');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!member) return <div>Member not found</div>;

  return (
    <div className="w-full">
      <div className="w-full p-6">
        <div className="max-w-[1200px] mx-auto">
          {/* Breadcrumb and Actions */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2 text-sm">
              <span 
                className="text-gray-600 cursor-pointer hover:text-gray-800"
                onClick={handleBack}
              >
                Health Records
              </span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">{member.name}</span>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsEditMemberModalOpen(true)}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" 
                  />
                </svg>
                Edit
              </button>
              <button 
                onClick={() => setIsDeleteMemberModalOpen(true)}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                  />
                </svg>
                Delete
              </button>
            </div>
          </div>

          {/* Profile Details Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-6">Profile Details</h2>
            <div className="flex gap-6">
              {/* Profile Information */}
              <div className="flex-1 grid grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Name</label>
                  <p className="font-medium">{member.name}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Date of Birth</label>
                  <p className="font-medium">{new Date(member.date_of_birth).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Gender</label>
                  <p className="font-medium">{member.gender}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Blood Group</label>
                  <p className="font-medium">{member.blood_group}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Contact Number</label>
                  <p className="font-medium">{member.contact_number}</p>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Secondary Contact</label>
                  <p className="font-medium">{member.secondary_contact || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Health Conditions Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Health Conditions ({conditions?.length || 0})</h2>
              <button 
                onClick={() => setIsAddConditionModalOpen(true)}
                className="bg-[#0D344C] text-white px-4 py-2 rounded-lg hover:bg-opacity-90"
              >
                + Add New Health Condition
              </button>
            </div>

            {conditions && conditions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Date</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Condition Name</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Doctor Name</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Date of Visit</th>
                      <th className="text-left px-6 py-4 text-sm font-medium text-gray-500">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conditions.map((condition) => (
                      <tr key={condition.id} className="border-b border-gray-200 last:border-b-0">
                        <td className="px-6 py-4">
                          {new Date(condition.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">{condition.condition_name}</td>
                        <td className="px-6 py-4">{condition.doctor_name}</td>
                        <td className="px-6 py-4">
                          {new Date(condition.date_of_visit).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleViewCondition(condition)}
                              className="p-2 hover:bg-gray-100 rounded-md"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => {
                                setConditionToDelete(condition);
                                setIsDeleteConditionModalOpen(true);
                              }}
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
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4">
                  <svg className="w-full h-full text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-2">No Health Conditions Found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddHealthConditionModal
        isOpen={isAddConditionModalOpen}
        onClose={() => setIsAddConditionModalOpen(false)}
        memberId={member.id}
        onSubmit={handleAddCondition}
      />

      <ViewHealthConditionModal
        isOpen={isViewConditionModalOpen}
        onClose={() => setIsViewConditionModalOpen(false)}
        condition={selectedCondition}
        onEdit={handleEditCondition}
        onDelete={(id) => {
          setConditionToDelete({ id });
          setIsViewConditionModalOpen(false);
          setIsDeleteConditionModalOpen(true);
        }}
      />

      <DeleteModal
        isOpen={isDeleteMemberModalOpen}
        onClose={() => setIsDeleteMemberModalOpen(false)}
        onDelete={handleDeleteMember}
        type="member"
        memberName={member.name}
      />

      <DeleteModal
        isOpen={isDeleteConditionModalOpen}
        onClose={() => setIsDeleteConditionModalOpen(false)}
        onDelete={handleDeleteCondition}
        type="health condition"
        conditionName={conditionToDelete?.condition_name}
      />

      <SuccessModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={successMessage}
        type="health record"
      />

      <EditFamilyMemberModal
        isOpen={isEditMemberModalOpen}
        onClose={() => setIsEditMemberModalOpen(false)}
        member={member}
        onSubmit={handleEditMember}
      />
    </div>
  );
};

export default ViewHealthRecord; 
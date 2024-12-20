import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { healthRecordsService } from '../services/healthRecords';

export const useHealthRecords = () => {
  const { user } = useAuth();
  const [familyMembers, setFamilyMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    page: 1,
    perPage: 10,
    searchQuery: ''
  });

  const fetchFamilyMembers = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const { data, count } = await healthRecordsService.getFamilyMembers({
        ...filters,
        userId: user.id
      });
      
      setFamilyMembers(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching family members:', err);
      setError(err.message);
      setFamilyMembers([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [filters, user]);

  useEffect(() => {
    fetchFamilyMembers();
  }, [fetchFamilyMembers]);

  const createFamilyMember = async (memberData) => {
    try {
      const newMember = await healthRecordsService.createFamilyMember({
        ...memberData,
        user_id: user.id
      });
      await fetchFamilyMembers();
      return newMember;
    } catch (err) {
      console.error('Error creating family member:', err);
      throw err;
    }
  };

  const updateFamilyMember = async (memberId, updates) => {
    try {
      const updatedMember = await healthRecordsService.updateFamilyMember(memberId, updates);
      await fetchFamilyMembers();
      return updatedMember;
    } catch (err) {
      console.error('Error updating family member:', err);
      throw err;
    }
  };

  const deleteFamilyMember = async (memberId) => {
    try {
      await healthRecordsService.deleteFamilyMember(memberId);
      await fetchFamilyMembers();
    } catch (err) {
      console.error('Error deleting family member:', err);
      throw err;
    }
  };

  return {
    familyMembers,
    loading,
    error,
    totalCount,
    filters,
    setFilters,
    refresh: fetchFamilyMembers,
    createFamilyMember,
    updateFamilyMember,
    deleteFamilyMember
  };
};

// Separate hook for health conditions
export const useHealthConditions = (memberId) => {
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConditions = useCallback(async () => {
    if (!memberId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await healthRecordsService.getHealthConditions(memberId);
      setConditions(data || []);
    } catch (err) {
      console.error('Error fetching health conditions:', err);
      setError(err.message);
      setConditions([]);
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    fetchConditions();
  }, [fetchConditions]);

  const createCondition = async (conditionData) => {
    try {
      await healthRecordsService.createHealthCondition({
        ...conditionData,
        member_id: memberId
      });
      await fetchConditions();
    } catch (err) {
      console.error('Error creating health condition:', err);
      throw err;
    }
  };

  const updateCondition = async (conditionId, updates) => {
    try {
      await healthRecordsService.updateHealthCondition(conditionId, updates);
      await fetchConditions();
    } catch (err) {
      console.error('Error updating health condition:', err);
      throw err;
    }
  };

  const deleteCondition = async (conditionId) => {
    try {
      await healthRecordsService.deleteHealthCondition(conditionId);
      await fetchConditions();
    } catch (err) {
      console.error('Error deleting health condition:', err);
      throw err;
    }
  };

  return {
    conditions,
    loading,
    error,
    refresh: fetchConditions,
    createCondition,
    updateCondition,
    deleteCondition
  };
}; 
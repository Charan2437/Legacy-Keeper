import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { familyVaultsService } from '../services/familyVaults';

// Hook for managing vaults
export const useFamilyVaults = () => {
  const { user } = useAuth();
  const [vaults, setVaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    page: 1,
    perPage: 10,
    searchQuery: ''
  });

  const fetchVaults = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { data, count } = await familyVaultsService.getVaults({
        ...filters,
        userId: user.id
      });
      
      setVaults(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching vaults:', err);
      setError(err.message);
      setVaults([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [filters, user]);

  useEffect(() => {
    fetchVaults();
  }, [fetchVaults]);

  const createVault = async (vaultData) => {
    try {
      const newVault = await familyVaultsService.createVault({
        ...vaultData,
        user_id: user.id
      });
      await fetchVaults();
      return newVault;
    } catch (err) {
      console.error('Error creating vault:', err);
      throw err;
    }
  };

  const updateVault = async (vaultId, updates) => {
    try {
      const updatedVault = await familyVaultsService.updateVault(vaultId, updates);
      await fetchVaults();
      return updatedVault;
    } catch (err) {
      console.error('Error updating vault:', err);
      throw err;
    }
  };

  const deleteVault = async (vaultId) => {
    try {
      await familyVaultsService.deleteVault(vaultId);
      await fetchVaults();
    } catch (err) {
      console.error('Error deleting vault:', err);
      throw err;
    }
  };

  return {
    vaults,
    loading,
    error,
    totalCount,
    filters,
    setFilters,
    refresh: fetchVaults,
    createVault,
    updateVault,
    deleteVault
  };
};

// Hook for managing vault members
export const useVaultMembers = (vaultId) => {
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMembers = useCallback(async () => {
    if (!vaultId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await familyVaultsService.getVaultMembers(vaultId);
      setMembers(data || []);
    } catch (err) {
      console.error('Error fetching vault members:', err);
      setError(err.message);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [vaultId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const createMember = async (memberData) => {
    try {
      await familyVaultsService.createVaultMember({
        ...memberData,
        vault_id: vaultId,
        user_id: user.id
      });
      await fetchMembers();
    } catch (err) {
      console.error('Error creating vault member:', err);
      throw err;
    }
  };

  const updateMember = async (memberId, updates) => {
    try {
      await familyVaultsService.updateVaultMember(memberId, {
        ...updates,
        user_id: user.id
      });
      await fetchMembers();
    } catch (err) {
      console.error('Error updating vault member:', err);
      throw err;
    }
  };

  const deleteMember = async (memberId) => {
    try {
      await familyVaultsService.deleteVaultMember(memberId);
      await fetchMembers();
    } catch (err) {
      console.error('Error deleting vault member:', err);
      throw err;
    }
  };

  const getDocumentUrl = async (filePath) => {
    try {
      return await familyVaultsService.getDocumentUrl(filePath);
    } catch (err) {
      console.error('Error getting document URL:', err);
      throw err;
    }
  };

  return {
    members,
    loading,
    error,
    refresh: fetchMembers,
    createMember,
    updateMember,
    deleteMember,
    getDocumentUrl
  };
}; 
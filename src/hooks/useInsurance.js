import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { insuranceService } from '../services/insurance';

export const useInsurance = () => {
  const { user } = useAuth();
  const [insurances, setInsurances] = useState([]);
  const [insuranceTypes, setInsuranceTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);

  const [filters, setFilters] = useState({
    page: 1,
    perPage: 10,
    type: null,
    searchQuery: ''
  });

  useEffect(() => {
    const fetchInsuranceTypes = async () => {
      try {
        const types = await insuranceService.getInsuranceTypes();
        setInsuranceTypes(types);
      } catch (err) {
        console.error('Error fetching insurance types:', err);
      }
    };

    fetchInsuranceTypes();
  }, []);

  const fetchInsurances = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const { data, count, totalAmount } = await insuranceService.getInsurances({
        ...filters,
        userId: user.id
      });
      setInsurances(data || []);
      setTotalCount(count || 0);
      setTotalAmount(totalAmount || 0);
    } catch (err) {
      console.error('Error fetching insurances:', err);
      setError(err.message);
      setInsurances([]);
      setTotalCount(0);
      setTotalAmount(0);
    } finally {
      setLoading(false);
    }
  }, [filters, user]);

  useEffect(() => {
    fetchInsurances();
  }, [fetchInsurances]);

  const createInsurance = async (insuranceData) => {
    try {
      const newInsurance = await insuranceService.createInsurance({
        ...insuranceData,
        user_id: user.id
      });
      setInsurances(prev => [newInsurance, ...prev]);
      return newInsurance;
    } catch (err) {
      console.error('Error creating insurance:', err);
      throw err;
    }
  };

  const updateInsurance = async (id, updates) => {
    try {
      const updatedInsurance = await insuranceService.updateInsurance(id, updates);
      setInsurances(prev => prev.map(insurance => 
        insurance.id === id ? updatedInsurance : insurance
      ));
      return updatedInsurance;
    } catch (err) {
      console.error('Error updating insurance:', err);
      throw err;
    }
  };

  const deleteInsurance = async (id) => {
    try {
      await insuranceService.deleteInsurance(id);
      setInsurances(prev => prev.filter(insurance => insurance.id !== id));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      console.error('Error deleting insurance:', err);
      throw err;
    }
  };

  return {
    insurances,
    insuranceTypes,
    loading,
    error,
    totalCount,
    totalAmount,
    filters,
    setFilters,
    createInsurance,
    updateInsurance,
    deleteInsurance,
    refresh: fetchInsurances
  };
}; 
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { businessPlansService } from '../services/businessPlans';

export const useBusinessPlans = () => {
  const { user } = useAuth();
  const [businessPlans, setBusinessPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    page: 1,
    perPage: 10,
    searchQuery: ''
  });

  const fetchBusinessPlans = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const { data, count } = await businessPlansService.getBusinessPlans({
        ...filters,
        userId: user.id
      });
      
      setBusinessPlans(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching business plans:', err);
      setError(err.message);
      setBusinessPlans([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [filters, user]);

  useEffect(() => {
    fetchBusinessPlans();
  }, [fetchBusinessPlans]);

  const createBusinessPlan = async (planData) => {
    try {
      const newPlan = await businessPlansService.createBusinessPlan({
        ...planData,
        user_id: user.id
      });
      await fetchBusinessPlans();
      return newPlan;
    } catch (err) {
      console.error('Error creating business plan:', err);
      throw err;
    }
  };

  const updateBusinessPlan = async (id, updates) => {
    try {
      const updatedPlan = await businessPlansService.updateBusinessPlan(id, {
        ...updates,
        user_id: user.id
      });
      await fetchBusinessPlans();
      return updatedPlan;
    } catch (err) {
      console.error('Error updating business plan:', err);
      throw err;
    }
  };

  const deleteBusinessPlan = async (id) => {
    try {
      await businessPlansService.deleteBusinessPlan(id);
      await fetchBusinessPlans();
    } catch (err) {
      console.error('Error deleting business plan:', err);
      throw err;
    }
  };

  return {
    businessPlans,
    loading,
    error,
    totalCount,
    filters,
    setFilters,
    refresh: fetchBusinessPlans,
    createBusinessPlan,
    updateBusinessPlan,
    deleteBusinessPlan
  };
}; 
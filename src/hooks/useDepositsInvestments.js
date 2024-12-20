import { useState, useEffect, useCallback } from 'react';
import { depositsInvestmentsService } from '../services/depositsInvestments';
import { useAuth } from '../contexts/AuthContext';

export const useDepositsInvestments = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const { user, loading: authLoading } = useAuth();

  const [filters, setFilters] = useState({
    page: 1,
    perPage: 10,
    paymentMethod: null,
    searchQuery: ''
  });

  const fetchInvestments = useCallback(async () => {
    if (!user || authLoading) return;

    try {
      setLoading(true);
      setError(null);
      const { data, count, totalAmount } = await depositsInvestmentsService.getInvestments({
        ...filters,
        userId: user.id
      });
      setInvestments(data || []);
      setTotalCount(count || 0);
      setTotalAmount(totalAmount || 0);
    } catch (err) {
      console.error('Error fetching investments:', err);
      setError(err.message);
      setInvestments([]);
      setTotalCount(0);
      setTotalAmount(0);
    } finally {
      setLoading(false);
    }
  }, [filters, user, authLoading]);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  const createInvestment = async (investmentData) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const newInvestment = await depositsInvestmentsService.createInvestment({
        ...investmentData,
        user_id: user.id
      });
      setInvestments(prev => [newInvestment, ...prev]);
      return newInvestment;
    } catch (err) {
      console.error('Error creating investment:', err);
      throw err;
    }
  };

  const deleteInvestment = async (id) => {
    try {
      if (!user) throw new Error('User not authenticated');

      await depositsInvestmentsService.deleteInvestment(id);
      setInvestments(prev => prev.filter(i => i.id !== id));
    } catch (err) {
      console.error('Error deleting investment:', err);
      throw err;
    }
  };

  return {
    investments,
    loading,
    error,
    totalCount,
    totalAmount,
    filters,
    setFilters,
    createInvestment,
    deleteInvestment,
    refresh: fetchInvestments
  };
}; 
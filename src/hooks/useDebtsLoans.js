import { useState, useEffect, useCallback } from 'react';
import { debtsLoansService } from '../services/debtsLoans';
import { useAuth } from '../contexts/AuthContext';

export const useDebtsLoans = () => {
  const [debtsLoans, setDebtsLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const { user, loading: authLoading } = useAuth();

  const [filters, setFilters] = useState({
    page: 1,
    perPage: 10,
    flowType: null,
    searchQuery: ''
  });

  const fetchDebtsLoans = useCallback(async () => {
    if (!user || authLoading) return;

    try {
      setLoading(true);
      setError(null);
      const { data, count } = await debtsLoansService.getDebtsLoans({
        ...filters,
        userId: user.id
      });
      setDebtsLoans(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching debts and loans:', err);
      setError(err.message);
      setDebtsLoans([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [filters, user, authLoading]);

  useEffect(() => {
    fetchDebtsLoans();
  }, [fetchDebtsLoans]);

  const createDebtLoan = async (debtLoanData) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const newDebtLoan = await debtsLoansService.createDebtLoan({
        ...debtLoanData,
        user_id: user.id
      });
      setDebtsLoans(prev => [newDebtLoan, ...prev]);
      return newDebtLoan;
    } catch (err) {
      console.error('Error creating debt/loan:', err);
      throw err;
    }
  };

  const deleteDebtLoan = async (id) => {
    try {
      if (!user) throw new Error('User not authenticated');

      await debtsLoansService.deleteDebtLoan(id);
      setDebtsLoans(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error('Error deleting debt/loan:', err);
      throw err;
    }
  };

  return {
    debtsLoans,
    loading,
    error,
    totalCount,
    filters,
    setFilters,
    createDebtLoan,
    deleteDebtLoan,
    refresh: fetchDebtsLoans
  };
}; 
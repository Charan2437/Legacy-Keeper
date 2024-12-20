import { useState, useEffect, useCallback } from 'react';
import { transactionService } from '../services/transactions';
import { useAuth } from '../contexts/AuthContext';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const { user, loading: authLoading } = useAuth();

  const [filters, setFilters] = useState({
    page: 1,
    perPage: 10,
    paymentMode: null,
    type: null,
    searchQuery: ''
  });

  const fetchTransactions = useCallback(async () => {
    if (!user || authLoading) return;

    try {
      setLoading(true);
      setError(null);
      const { data, count } = await transactionService.getTransactions({
        ...filters,
        userId: user.id
      });
      setTransactions(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.message);
      setTransactions([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [filters, user, authLoading]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const createTransaction = async (transactionData) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const newTransaction = await transactionService.createTransaction({
        ...transactionData,
        user_id: user.id
      });
      setTransactions(prev => [newTransaction, ...prev]);
      return newTransaction;
    } catch (err) {
      console.error('Error creating transaction:', err);
      throw err;
    }
  };

  const updateTransaction = async (id, updates) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const updatedTransaction = await transactionService.updateTransaction(id, updates);
      setTransactions(prev => 
        prev.map(t => t.id === id ? updatedTransaction : t)
      );
      return updatedTransaction;
    } catch (err) {
      console.error('Error updating transaction:', err);
      throw err;
    }
  };

  const deleteTransaction = async (id) => {
    try {
      if (!user) throw new Error('User not authenticated');

      await transactionService.deleteTransaction(id);
      setTransactions(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      console.error('Error deleting transaction:', err);
      throw err;
    }
  };

  return {
    transactions,
    setTransactions,
    loading,
    error,
    totalCount,
    filters,
    setFilters,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    refresh: fetchTransactions
  };
}; 
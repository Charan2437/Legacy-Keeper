import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { remindersService } from '../services/reminders';

export const useReminders = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    page: 1,
    perPage: 10,
    searchQuery: '',
    type: null,
    status: 'Active'
  });

  const fetchReminders = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const { data, count } = await remindersService.getReminders({
        ...filters,
        userId: user.id
      });
      
      setReminders(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Error fetching reminders:', err);
      setError(err.message);
      setReminders([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, [user, filters]);

  const createReminder = async (reminderData) => {
    try {
      const newReminder = await remindersService.createReminder({
        ...reminderData,
        user_id: user.id
      });
      await fetchReminders();
      return newReminder;
    } catch (err) {
      console.error('Error creating reminder:', err);
      throw err;
    }
  };

  const updateReminder = async (id, updates) => {
    try {
      const updatedReminder = await remindersService.updateReminder(id, updates);
      await fetchReminders();
      return updatedReminder;
    } catch (err) {
      console.error('Error updating reminder:', err);
      throw err;
    }
  };

  const deleteReminder = async (id) => {
    try {
      await remindersService.deleteReminder(id);
      await fetchReminders();
    } catch (err) {
      console.error('Error deleting reminder:', err);
      throw err;
    }
  };

  return {
    reminders,
    loading,
    error,
    totalCount,
    filters,
    setFilters,
    refresh: fetchReminders,
    createReminder,
    updateReminder,
    deleteReminder
  };
}; 
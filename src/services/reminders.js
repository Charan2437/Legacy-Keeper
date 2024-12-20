import { supabase } from '../lib/supabase';

export const remindersService = {
  // Fetch reminders with pagination and filters
  async getReminders({ 
    page = 1, 
    perPage = 10, 
    searchQuery = '', 
    type = null,
    status = 'Active',
    userId 
  }) {
    try {
      let query = supabase
        .from('reminders')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      // Apply filters
      if (status) {
        query = query.eq('status', status);
      }
      
      if (type) {
        query = query.eq('type', type);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Add pagination
      const start = (page - 1) * perPage;
      query = query
        .order('next_reminder_date', { ascending: true })
        .range(start, start + perPage - 1);

      const { data, error, count } = await query;
      
      if (error) throw error;
      return { data, count };
    } catch (error) {
      console.error('Error fetching reminders:', error);
      throw error;
    }
  },

  // Get upcoming reminders for dashboard
  async getUpcomingReminders(userId, limit = 5) {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'Active')
        .gte('next_reminder_date', new Date().toISOString())
        .order('next_reminder_date', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching upcoming reminders:', error);
      throw error;
    }
  },

  // Create new reminder
  async createReminder(reminderData) {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .insert([{
          user_id: reminderData.user_id,
          title: reminderData.title,
          description: reminderData.description,
          type: reminderData.type,
          frequency: reminderData.frequency,
          start_date: reminderData.start_date,
          end_date: reminderData.end_date,
          notification_email: reminderData.notification_email,
          notification_sms: reminderData.notification_sms
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  },

  // Update reminder
  async updateReminder(reminderId, updates) {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .update(updates)
        .eq('id', reminderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }
  },

  // Delete reminder
  async deleteReminder(id) {
    try {
      if (!id) {
        throw new Error('Reminder ID is required');
      }
      
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  },

  // Update reminder status
  async updateReminderStatus(reminderId, status) {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .update({ status })
        .eq('id', reminderId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating reminder status:', error);
      throw error;
    }
  },

  // Log reminder notification
  async logNotification(reminderId, notificationType, status, errorMessage = null) {
    try {
      const { error } = await supabase
        .from('reminder_history')
        .insert([{
          reminder_id: reminderId,
          notification_date: new Date().toISOString(),
          notification_type: notificationType,
          status: status,
          error_message: errorMessage
        }]);

      if (error) throw error;
    } catch (error) {
      console.error('Error logging notification:', error);
      throw error;
    }
  }
}; 
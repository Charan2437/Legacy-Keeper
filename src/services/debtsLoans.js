import { supabase } from '../lib/supabase';

export const debtsLoansService = {
  async getDebtsLoans({ page = 1, perPage = 10, flowType = null, searchQuery = '', userId }) {
    try {
      let query = supabase
        .from('debts_loans')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (flowType) {
        query = query.eq('flow_type', flowType);
      }

      if (searchQuery) {
        query = query.or(`purpose.ilike.%${searchQuery}%,person_name.ilike.%${searchQuery}%`);
      }

      const start = (page - 1) * perPage;
      query = query.range(start, start + perPage - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return { data, count };
    } catch (error) {
      console.error('Error fetching debts and loans:', error);
      throw error;
    }
  },

  async createDebtLoan(data) {
    try {
      const { data: newDebtLoan, error } = await supabase
        .from('debts_loans')
        .insert([data])
        .select()
        .single();

      if (error) throw error;
      return newDebtLoan;
    } catch (error) {
      console.error('Error creating debt/loan:', error);
      throw error;
    }
  },

  async uploadDocument(file, userId) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('debt-loan-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('debt-loan-documents')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  async deleteDebtLoan(id) {
    try {
      const { error } = await supabase
        .from('debts_loans')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting debt/loan:', error);
      throw error;
    }
  }
}; 
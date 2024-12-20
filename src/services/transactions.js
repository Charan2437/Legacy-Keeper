import { supabase } from '../lib/supabase';

export const transactionService = {
  async getTransactions({ page = 1, perPage = 10, paymentMode = null, type = null, searchQuery = '', userId }) {
    try {
      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Apply filters if provided
      if (paymentMode) {
        query = query.eq('payment_mode', paymentMode);
      }
      
      if (type) {
        query = query.eq('type', type);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,person_party.ilike.%${searchQuery}%`);
      }

      // Add pagination
      const start = (page - 1) * perPage;
      query = query.range(start, start + perPage - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return { data, count };
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  async createTransaction(transactionData) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  },

  async updateTransaction(id, updates) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },

  async deleteTransaction(id) {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },

  async uploadDocument(file, userId) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('transaction-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get signed URL instead of public URL
      const { data: { signedUrl }, error: signedUrlError } = await supabase.storage
        .from('transaction-documents')
        .createSignedUrl(fileName, 3600); // URL expires in 1 hour

      if (signedUrlError) throw signedUrlError;

      return signedUrl;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  async getSignedUrl(path) {
    try {
      const { data: { signedUrl }, error } = await supabase.storage
        .from('transaction-documents')
        .createSignedUrl(path, 3600); // URL expires in 1 hour

      if (error) throw error;
      return signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      throw error;
    }
  }
}; 
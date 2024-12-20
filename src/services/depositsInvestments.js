import { supabase } from '../lib/supabase';

export const depositsInvestmentsService = {
  async getInvestments({ page = 1, perPage = 10, paymentMethod = null, searchQuery = '', userId }) {
    try {
      let query = supabase
        .from('investments')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Apply filters if provided
      if (paymentMethod) {
        query = query.eq('payment_mode', paymentMethod);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,type.ilike.%${searchQuery}%`);
      }

      // Add pagination
      const start = (page - 1) * perPage;
      query = query.range(start, start + perPage - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      // Calculate total amount
      const totalAmountQuery = await supabase
        .from('investments')
        .select('amount')
        .eq('user_id', userId)
        .eq('status', 'Active');

      const { data: amountData, error: amountError } = totalAmountQuery;

      if (amountError) throw amountError;

      const totalAmount = amountData.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

      return { data, count, totalAmount };
    } catch (error) {
      console.error('Error fetching investments:', error);
      throw error;
    }
  },

  async createInvestment(investmentData) {
    try {
      let document_url = null;

      // Upload document if exists
      if (investmentData.document) {
        document_url = await this.uploadDocument(investmentData.document, investmentData.user_id);
      }

      // Prepare the data by removing unnecessary fields and formatting
      const cleanedData = {
        user_id: investmentData.user_id,
        type: investmentData.type,
        name: investmentData.name,
        amount: parseFloat(investmentData.amount),
        purchase_price: investmentData.purchase_price ? parseFloat(investmentData.purchase_price) : null,
        current_price: investmentData.current_price ? parseFloat(investmentData.current_price) : null,
        quantity: investmentData.quantity ? parseFloat(investmentData.quantity) : null,
        purchase_date: investmentData.purchase_date,
        payment_mode: investmentData.payment_mode,
        broker_platform: investmentData.broker_platform || null,
        notes: investmentData.notes || null,
        document_url,
        status: 'Active'
      };

      console.log('Creating investment with data:', cleanedData); // Debug log

      // Create investment record
      const { data, error } = await supabase
        .from('investments')
        .insert([cleanedData])
        .select()
        .single();

      if (error) {
        console.error('Supabase error details:', error); // Debug log
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Detailed error:', error); // Debug log
      throw new Error(`Failed to create investment: ${error.message}`);
    }
  },

  async updateInvestment(id, updates) {
    try {
      const { data, error } = await supabase
        .from('investments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating investment:', error);
      throw error;
    }
  },

  async deleteInvestment(id) {
    try {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting investment:', error);
      throw error;
    }
  },

  async uploadDocument(file, userId) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('investment-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { signedUrl }, error: signedUrlError } = await supabase.storage
        .from('investment-documents')
        .createSignedUrl(fileName, 3600); // URL expires in 1 hour

      if (signedUrlError) throw signedUrlError;

      return fileName; // Store the path, not the signed URL
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  async getSignedUrl(path) {
    try {
      const { data: { signedUrl }, error } = await supabase.storage
        .from('investment-documents')
        .createSignedUrl(path, 3600); // URL expires in 1 hour

      if (error) throw error;
      return signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      throw error;
    }
  },

  // Deposits specific methods
  async getDeposits({ page = 1, perPage = 10, type = null, searchQuery = '', userId }) {
    try {
      let query = supabase
        .from('deposits')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('type', type);
      }

      if (searchQuery) {
        query = query.or(`bank_name.ilike.%${searchQuery}%,account_number.ilike.%${searchQuery}%`);
      }

      const start = (page - 1) * perPage;
      query = query.range(start, start + perPage - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      // Calculate total amount
      const totalAmountQuery = await supabase
        .from('deposits')
        .select('amount')
        .eq('user_id', userId)
        .eq('status', 'Active');

      const { data: amountData, error: amountError } = totalAmountQuery;

      if (amountError) throw amountError;

      const totalAmount = amountData.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

      return { data, count, totalAmount };
    } catch (error) {
      console.error('Error fetching deposits:', error);
      throw error;
    }
  },

  async createDeposit(depositData) {
    try {
      let document_url = null;

      if (depositData.document) {
        document_url = await this.uploadDocument(depositData.document, depositData.user_id);
      }

      const { data, error } = await supabase
        .from('deposits')
        .insert([{
          ...depositData,
          document_url,
          status: 'Active'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating deposit:', error);
      throw error;
    }
  },

  async updateDeposit(id, updates) {
    try {
      const { data, error } = await supabase
        .from('deposits')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating deposit:', error);
      throw error;
    }
  },

  async deleteDeposit(id) {
    try {
      const { error } = await supabase
        .from('deposits')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting deposit:', error);
      throw error;
    }
  }
}; 
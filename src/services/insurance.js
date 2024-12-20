import { supabase } from '../lib/supabase';

export const insuranceService = {
  async getInsurances({ page = 1, perPage = 10, type = null, searchQuery = '', userId }) {
    try {
      let query = supabase
        .from('insurance_policies')
        .select(`
          *,
          insurance_types(id, name)
        `, { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (type) {
        query = query.eq('type_id', type);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      // Add pagination
      const start = (page - 1) * perPage;
      query = query.range(start, start + perPage - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      // Calculate total amount
      const totalAmountQuery = await supabase
        .from('insurance_policies')
        .select('amount')
        .eq('user_id', userId)
        .eq('status', 'Active');

      const { data: amountData, error: amountError } = totalAmountQuery;

      if (amountError) throw amountError;

      const totalAmount = amountData.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

      return { data, count, totalAmount };
    } catch (error) {
      console.error('Error fetching insurances:', error);
      throw error;
    }
  },

  async getInsuranceTypes() {
    try {
      const { data, error } = await supabase
        .from('insurance_types')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching insurance types:', error);
      throw error;
    }
  },

  async createInsurance(insuranceData) {
    try {
      let document_url = null;
      let government_id_url = null;

      if (insuranceData.document) {
        document_url = await this.uploadDocument(insuranceData.document, insuranceData.user_id, 'documents');
      }

      if (insuranceData.government_id) {
        government_id_url = await this.uploadDocument(insuranceData.government_id, insuranceData.user_id, 'government-ids');
      }

      // Map form data to database columns
      const cleanedData = {
        user_id: insuranceData.user_id,
        type_id: insuranceData.type_id,
        name: insuranceData.name,
        amount: parseFloat(insuranceData.amount),
        start_date: insuranceData.start_date,
        coverage_period: parseInt(insuranceData.coverage_period),
        paid_to: insuranceData.paid_to,
        description: insuranceData.description,
        reminder_enabled: insuranceData.reminder_enabled,
        government_id: government_id_url,
        document_url,
        status: 'Active'
      };

      console.log('Creating insurance with data:', cleanedData);

      const { data, error } = await supabase
        .from('insurance_policies')
        .insert([cleanedData])
        .select(`
          *,
          insurance_types(name)
        `)
        .single();

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Detailed error:', error);
      throw new Error(`Failed to create insurance: ${error.message}`);
    }
  },

  async uploadDocument(file, userId, folder) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('insurance-documents')
        .upload(`${folder}/${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data: { signedUrl }, error: signedUrlError } = await supabase.storage
        .from('insurance-documents')
        .createSignedUrl(`${folder}/${fileName}`, 3600);

      if (signedUrlError) throw signedUrlError;

      return fileName;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  async getSignedUrl(path) {
    try {
      const { data: { signedUrl }, error } = await supabase.storage
        .from('insurance-documents')
        .createSignedUrl(path, 3600);

      if (error) throw error;
      return signedUrl;
    } catch (error) {
      console.error('Error getting signed URL:', error);
      throw error;
    }
  },

  async deleteInsurance(id) {
    try {
      // First, delete any associated documents from storage
      const { data: insurance } = await supabase
        .from('insurance_policies')
        .select('document_url, government_id')
        .eq('id', id)
        .single();

      if (insurance) {
        // Delete document if exists
        if (insurance.document_url) {
          await supabase.storage
            .from('insurance-documents')
            .remove([`documents/${insurance.document_url}`]);
        }
        
        // Delete government ID if exists
        if (insurance.government_id) {
          await supabase.storage
            .from('insurance-documents')
            .remove([`government-ids/${insurance.government_id}`]);
        }
      }

      // Delete the insurance record
      const { error } = await supabase
        .from('insurance_policies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting insurance:', error);
      throw new Error(`Failed to delete insurance: ${error.message}`);
    }
  }
}; 
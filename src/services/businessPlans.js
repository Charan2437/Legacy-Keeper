import { supabase } from '../lib/supabase';

export const businessPlansService = {
  async getBusinessPlans({ page = 1, perPage = 10, searchQuery = '', userId }) {
    try {
      let query = supabase
        .from('business_plans')
        .select(`
          *,
          business_types (
            id,
            name,
            description
          )
        `, { count: 'exact' })
        .eq('user_id', userId)
        .eq('status', 'Active')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`
          name.ilike.%${searchQuery}%,
          succession_notes.ilike.%${searchQuery}%
        `);
      }

      const start = (page - 1) * perPage;
      query = query.range(start, start + perPage - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      return { data, count };
    } catch (error) {
      console.error('Error fetching business plans:', error);
      throw error;
    }
  },

  async createBusinessPlan(planData) {
    try {
      let government_id_url = null;

      if (planData.government_id) {
        government_id_url = await this.uploadDocument(planData.government_id, planData.user_id);
      }

      const { data, error } = await supabase
        .from('business_plans')
        .insert([{
          user_id: planData.user_id,
          name: planData.name,
          type_id: planData.type_id,
          investment_amount: planData.investment_amount,
          ownership_percentage: planData.ownership_percentage,
          succession_notes: planData.succession_notes,
          government_id_url,
          status: 'Active'
        }])
        .select(`
          *,
          business_types (
            id,
            name,
            description
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating business plan:', error);
      throw error;
    }
  },

  async updateBusinessPlan(id, updates) {
    try {
      let updateData = {
        name: updates.name,
        type_id: updates.type_id,
        investment_amount: updates.investment_amount,
        ownership_percentage: updates.ownership_percentage,
        succession_notes: updates.succession_notes
      };

      if (updates.government_id) {
        const { data: oldPlan } = await supabase
          .from('business_plans')
          .select('government_id_url')
          .eq('id', id)
          .single();

        if (oldPlan?.government_id_url) {
          await supabase.storage
            .from('business-documents')
            .remove([oldPlan.government_id_url]);
        }

        updateData.government_id_url = await this.uploadDocument(
          updates.government_id,
          updates.user_id
        );
      }

      const { data, error } = await supabase
        .from('business_plans')
        .update(updateData)
        .eq('id', id)
        .eq('status', 'Active')
        .select(`
          *,
          business_types (
            id,
            name,
            description
          )
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating business plan:', error);
      throw error;
    }
  },

  async deleteBusinessPlan(id) {
    try {
      const { data, error } = await supabase
        .from('business_plans')
        .update({ status: 'Inactive' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error deleting business plan:', error);
      throw error;
    }
  },

  async uploadDocument(file, userId) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('business-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;
      return fileName;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  async getBusinessTypes() {
    try {
      const { data, error } = await supabase
        .from('business_types')
        .select('id, name, description')
        .order('name');

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching business types:', error);
      throw error;
    }
  },

  async getDocumentUrl(filePath) {
    try {
      const { data, error } = await supabase.storage
        .from('business-documents')
        .createSignedUrl(filePath, 3600); // URL valid for 1 hour

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting document URL:', error);
      throw error;
    }
  }
}; 
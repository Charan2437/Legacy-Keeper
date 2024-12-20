import { supabase } from '../lib/supabase';

// User related operations
export const userAPI = {
  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getProfile(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data;
  }
};

// Nominee related operations
export const nomineeAPI = {
  async create(nomineeData) {
    const { data, error } = await supabase
      .from('nominees')
      .insert([nomineeData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async list(userId) {
    const { data, error } = await supabase
      .from('nominees')
      .select(`
        *,
        nominee_access (
          category
        )
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  },

  async update(nomineeId, updates) {
    const { data, error } = await supabase
      .from('nominees')
      .update(updates)
      .eq('id', nomineeId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(nomineeId) {
    const { error } = await supabase
      .from('nominees')
      .delete()
      .eq('id', nomineeId);
    
    if (error) throw error;
  }
};

// File upload helper
export const storageAPI = {
  async uploadFile(bucket, filePath, file) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);
    
    if (error) throw error;
    return data;
  },

  getPublicUrl(bucket, filePath) {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }
}; 
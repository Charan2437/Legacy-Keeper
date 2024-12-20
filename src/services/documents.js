import { supabase } from '../lib/supabase';

export const documentsService = {
  async getDocuments({ page = 1, perPage = 10, searchQuery = '', userId }) {
    try {
      let query = supabase
        .from('documentstore')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`document_title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const start = (page - 1) * perPage;
      query = query.range(start, start + perPage - 1);

      const { data, error, count } = await query;
      if (error) {
        console.error('Supabase query error:', error);
        throw error;
      }
      return { data, count };
    } catch (error) {
      console.error('Error details:', error);
      throw error;
    }
  },

  async createDocument({ document_title, description, document, document_type, file_size, user_id }) {
    try {
      // Validate file size
      if (!file_size || file_size > 10485760) { // 10MB limit
        throw new Error('File size must be less than 10MB');
      }

      // First upload the file
      const bucket_path = await this.uploadFile(document, user_id);
      
      // Then create the document record
      const { data, error } = await supabase
        .from('documentstore')
        .insert([{
          document_title,
          description,
          user_id,
          document_type,
          bucket_path,
          file_size,
          status: 'active'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  },

  async uploadFile(file, userId) {
    try {
      const fileExt = file.name.split('.').pop().toLowerCase();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('document-store')
        .upload(fileName, file);

      if (uploadError) throw uploadError;
      return fileName;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  // Helper function to convert MIME type to document_type enum
  getDocumentType(mimeType) {
    const typeMap = {
      'application/pdf': 'pdf',
      'image/jpeg': 'jpeg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
      'application/vnd.ms-excel': 'xls',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx'
    };

    const type = typeMap[mimeType];
    if (!type) {
      throw new Error('Unsupported file type');
    }
    return type;
  },

  async updateDocument(documentId, updates) {
    try {
      const { data, error } = await supabase
        .from('documentstore')
        .update(updates)
        .eq('document_id', documentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  async deleteDocument(documentId) {
    try {
      // Soft delete by updating status
      const { data, error } = await supabase
        .from('documentstore')
        .update({ status: 'deleted' })
        .eq('document_id', documentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  getDocument: async (documentId) => {
    const { data, error } = await supabase
      .from('documentstore')
      .select('*')
      .eq('document_id', documentId)
      .single();

    if (error) throw error;
    return { data };
  }
}; 
import { supabase } from '../lib/supabase';

export const healthRecordsService = {
  // Family Members
  async getFamilyMembers({ page = 1, perPage = 10, searchQuery = '', userId }) {
    try {
      let query = supabase
        .from('family_members')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('status', 'Active')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`
          name.ilike.%${searchQuery}%,
          contact_number.ilike.%${searchQuery}%
        `);
      }

      const start = (page - 1) * perPage;
      query = query.range(start, start + perPage - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      return { data, count };
    } catch (error) {
      console.error('Error fetching family members:', error);
      throw error;
    }
  },

  async getFamilyMember(memberId) {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select(`
          *,
          health_conditions (*)
        `)
        .eq('id', memberId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching family member:', error);
      throw error;
    }
  },

  async createFamilyMember(memberData) {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .insert([{
          user_id: memberData.user_id,
          name: memberData.name,
          date_of_birth: memberData.date_of_birth,
          gender: memberData.gender,
          blood_group: memberData.blood_group,
          contact_number: memberData.contact_number,
          secondary_contact: memberData.secondary_contact,
          status: 'Active'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating family member:', error);
      throw error;
    }
  },

  async updateFamilyMember(memberId, updates) {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .update(updates)
        .eq('id', memberId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating family member:', error);
      throw error;
    }
  },

  async deleteFamilyMember(memberId) {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .update({ status: 'Inactive' })
        .eq('id', memberId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error deleting family member:', error);
      throw error;
    }
  },

  // Health Conditions
  async getHealthConditions(memberId) {
    try {
      const { data, error } = await supabase
        .from('health_conditions')
        .select('*')
        .eq('member_id', memberId)
        .order('date_of_visit', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching health conditions:', error);
      throw error;
    }
  },

  async createHealthCondition(conditionData) {
    try {
      let document_url = null;

      // Handle file upload first if exists
      if (conditionData.document) {
        try {
          document_url = await this.uploadDocument(
            conditionData.document,
            conditionData.user_id
          );
        } catch (uploadError) {
          console.error('Error uploading document:', uploadError);
          throw new Error('Failed to upload document');
        }
      }

      // Create health condition record
      const { data, error } = await supabase
        .from('health_conditions')
        .insert([{
          member_id: conditionData.member_id,
          condition_name: conditionData.condition_name,
          doctor_name: conditionData.doctor_name,
          date_of_visit: conditionData.date_of_visit,
          description: conditionData.description,
          document_url
        }])
        .select()
        .single();

      if (error) {
        // If insertion fails and we uploaded a file, clean it up
        if (document_url) {
          await supabase.storage
            .from('health-documents')
            .remove([document_url]);
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating health condition:', error);
      throw error;
    }
  },

  async updateHealthCondition(conditionId, updates) {
    try {
      let updateData = {
        condition_name: updates.condition_name,
        doctor_name: updates.doctor_name,
        date_of_visit: updates.date_of_visit,
        description: updates.description
      };

      if (updates.document) {
        const { data: oldCondition } = await supabase
          .from('health_conditions')
          .select('document_url')
          .eq('id', conditionId)
          .single();

        if (oldCondition?.document_url) {
          await supabase.storage
            .from('health-documents')
            .remove([oldCondition.document_url]);
        }

        updateData.document_url = await this.uploadDocument(
          updates.document,
          updates.user_id
        );
      }

      const { data, error } = await supabase
        .from('health_conditions')
        .update(updateData)
        .eq('id', conditionId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating health condition:', error);
      throw error;
    }
  },

  async deleteHealthCondition(conditionId) {
    try {
      const { data: condition } = await supabase
        .from('health_conditions')
        .select('document_url')
        .eq('id', conditionId)
        .single();

      if (condition?.document_url) {
        await supabase.storage
          .from('health-documents')
          .remove([condition.document_url]);
      }

      const { error } = await supabase
        .from('health_conditions')
        .delete()
        .eq('id', conditionId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting health condition:', error);
      throw error;
    }
  },

  // Document handling
  async uploadDocument(file, userId) {
    try {
      // Create folder structure: userId/timestamp_filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      // First check if folder exists
      const { data: folderExists } = await supabase.storage
        .from('health-documents')
        .list(userId);

      // Create folder if it doesn't exist
      if (!folderExists) {
        await supabase.storage
          .from('health-documents')
          .upload(`${userId}/.keep`, new Blob(['']));
      }

      // Upload the file
      const { error: uploadError, data } = await supabase.storage
        .from('health-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

      return fileName;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  async getDocumentUrl(filePath) {
    try {
      const { data, error } = await supabase.storage
        .from('health-documents')
        .createSignedUrl(filePath, 3600); // URL valid for 1 hour

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting document URL:', error);
      throw error;
    }
  },

  // Add this method to get member by name
  async getFamilyMemberByName(memberName) {
    try {
      const formattedName = memberName
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      const { data, error } = await supabase
        .from('family_members')
        .select(`
          *,
          health_conditions (*)
        `)
        .eq('name', formattedName)
        .eq('status', 'Active')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching family member:', error);
      throw error;
    }
  }
}; 
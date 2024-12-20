import { supabase } from '../lib/supabase';

export const familyVaultsService = {
  // Vault Operations
  async getVaults({ page = 1, perPage = 10, searchQuery = '', userId }) {
    try {
      let query = supabase
        .from('family_vaults')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .eq('status', 'Active')
        .order('created_at', { ascending: false });

      if (searchQuery) {
        query = query.or(`
          name.ilike.%${searchQuery}%,
          description.ilike.%${searchQuery}%
        `);
      }

      const start = (page - 1) * perPage;
      query = query.range(start, start + perPage - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      return { data, count };
    } catch (error) {
      console.error('Error fetching vaults:', error);
      throw error;
    }
  },

  async getVault(vaultId) {
    try {
      if (!vaultId) throw new Error('Vault ID is required');

      const { data, error } = await supabase
        .from('family_vaults')
        .select(`
          *,
          vault_members (*)
        `)
        .eq('id', vaultId)
        .eq('status', 'Active')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching vault:', error);
      throw error;
    }
  },

  async createVault(vaultData) {
    try {
      const { data, error } = await supabase
        .from('family_vaults')
        .insert([{
          user_id: vaultData.user_id,
          name: vaultData.name,
          description: vaultData.description,
          status: 'Active'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating vault:', error);
      throw error;
    }
  },

  async updateVault(vaultId, updates) {
    try {
      const { data, error } = await supabase
        .from('family_vaults')
        .update({
          name: updates.name,
          description: updates.description
        })
        .eq('id', vaultId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating vault:', error);
      throw error;
    }
  },

  async deleteVault(vaultId) {
    try {
      const { data, error } = await supabase
        .from('family_vaults')
        .update({ status: 'Inactive' })
        .eq('id', vaultId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error deleting vault:', error);
      throw error;
    }
  },

  // Vault Members Operations
  async getVaultMembers(vaultId) {
    try {
      const { data, error } = await supabase
        .from('vault_members')
        .select('*')
        .eq('vault_id', vaultId)
        .eq('status', 'Active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching vault members:', error);
      throw error;
    }
  },

  async createVaultMember(memberData) {
    try {
      let document_url = null;

      if (memberData.document) {
        document_url = await this.uploadDocument(
          memberData.document,
          memberData.user_id
        );
      }

      const { data, error } = await supabase
        .from('vault_members')
        .insert([{
          vault_id: memberData.vault_id,
          name: memberData.name,
          relationship: memberData.relationship,
          role: memberData.role,
          contact_number: memberData.contact_number,
          email: memberData.email,
          notes: memberData.notes,
          document_url,
          status: 'Active'
        }])
        .select()
        .single();

      if (error) {
        // Clean up uploaded document if member creation fails
        if (document_url) {
          await supabase.storage
            .from('vault-documents')
            .remove([document_url]);
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error creating vault member:', error);
      throw error;
    }
  },

  async updateVaultMember(memberId, updates) {
    try {
      let updateData = {
        name: updates.name,
        relationship: updates.relationship,
        role: updates.role,
        contact_number: updates.contact_number,
        email: updates.email,
        notes: updates.notes
      };

      if (updates.document) {
        const { data: oldMember } = await supabase
          .from('vault_members')
          .select('document_url')
          .eq('id', memberId)
          .single();

        if (oldMember?.document_url) {
          await supabase.storage
            .from('vault-documents')
            .remove([oldMember.document_url]);
        }

        updateData.document_url = await this.uploadDocument(
          updates.document,
          updates.user_id
        );
      }

      const { data, error } = await supabase
        .from('vault_members')
        .update(updateData)
        .eq('id', memberId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating vault member:', error);
      throw error;
    }
  },

  async deleteVaultMember(memberId) {
    try {
      const { data: member } = await supabase
        .from('vault_members')
        .select('document_url')
        .eq('id', memberId)
        .single();

      if (member?.document_url) {
        await supabase.storage
          .from('vault-documents')
          .remove([member.document_url]);
      }

      const { data, error } = await supabase
        .from('vault_members')
        .update({ status: 'Inactive' })
        .eq('id', memberId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error deleting vault member:', error);
      throw error;
    }
  },

  // Document handling
  async uploadDocument(file, userId) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('vault-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;
      return fileName;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  async getDocumentUrl(filePath) {
    try {
      const { data, error } = await supabase.storage
        .from('vault-documents')
        .createSignedUrl(filePath, 3600); // URL valid for 1 hour

      if (error) throw error;
      return data.signedUrl;
    } catch (error) {
      console.error('Error getting document URL:', error);
      throw error;
    }
  },

  async getVaultByName(vaultName, userId) {
    try {
      if (!vaultName) throw new Error('Vault name is required');
      if (!userId) throw new Error('User ID is required');

      console.log('Fetching vault:', { vaultName, userId });

      const { data, error } = await supabase
        .from('family_vaults')
        .select(`
          *,
          vault_members (*)
        `)
        .eq('name', vaultName)
        .eq('user_id', userId)
        .eq('status', 'Active')
        .single();

      console.log('Query result:', { data, error });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching vault by name:', error);
      throw error;
    }
  }
}; 
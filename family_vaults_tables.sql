-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE vault_member_role AS ENUM ('Owner', 'Beneficiary', 'Trustee');
CREATE TYPE vault_member_status AS ENUM ('Active', 'Inactive');
CREATE TYPE relationship_type AS ENUM (
    'Spouse', 'Child', 'Parent', 'Sibling', 
    'Grandparent', 'Grandchild', 'Friend', 'Other'
);

-- Family Vaults Table
CREATE TABLE family_vaults (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(200) NOT NULL CHECK (length(trim(name)) > 0),
    description TEXT,
    status vault_member_status DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vault Members Table
CREATE TABLE vault_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    vault_id UUID REFERENCES family_vaults(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(200) NOT NULL CHECK (length(trim(name)) > 0),
    relationship relationship_type NOT NULL,
    role vault_member_role NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    notes TEXT,
    document_url TEXT,
    status vault_member_status DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_family_vaults_updated_at
    BEFORE UPDATE ON family_vaults
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vault_members_updated_at
    BEFORE UPDATE ON vault_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create audit table
CREATE TABLE vault_audit (
    audit_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(20) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_vault_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO vault_audit (
            table_name,
            record_id,
            user_id,
            action,
            old_data,
            ip_address
        ) VALUES (
            TG_TABLE_NAME,
            OLD.id,
            auth.uid(),
            TG_OP,
            row_to_json(OLD),
            inet_client_addr()
        );
        RETURN OLD;
    ELSE
        INSERT INTO vault_audit (
            table_name,
            record_id,
            user_id,
            action,
            old_data,
            new_data,
            ip_address
        ) VALUES (
            TG_TABLE_NAME,
            COALESCE(NEW.id, OLD.id),
            auth.uid(),
            TG_OP,
            CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
            row_to_json(NEW),
            inet_client_addr()
        );
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers
CREATE TRIGGER family_vaults_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON family_vaults
    FOR EACH ROW EXECUTE FUNCTION audit_vault_changes();

CREATE TRIGGER vault_members_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON vault_members
    FOR EACH ROW EXECUTE FUNCTION audit_vault_changes();

-- Enable Row Level Security
ALTER TABLE family_vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_audit ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for family_vaults
CREATE POLICY "Users can view their own vaults"
    ON family_vaults FOR SELECT
    USING (user_id = auth.uid() AND status = 'Active');

CREATE POLICY "Users can create their own vaults"
    ON family_vaults FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own vaults"
    ON family_vaults FOR UPDATE
    USING (user_id = auth.uid());

-- Create RLS Policies for vault_members
CREATE POLICY "Users can view members of their vaults"
    ON vault_members FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM family_vaults
        WHERE family_vaults.id = vault_members.vault_id
        AND family_vaults.user_id = auth.uid()
    ));

CREATE POLICY "Users can create members in their vaults"
    ON vault_members FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM family_vaults
        WHERE family_vaults.id = vault_members.vault_id
        AND family_vaults.user_id = auth.uid()
    ));

CREATE POLICY "Users can update members in their vaults"
    ON vault_members FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM family_vaults
        WHERE family_vaults.id = vault_members.vault_id
        AND family_vaults.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete members in their vaults"
    ON vault_members FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM family_vaults
        WHERE family_vaults.id = vault_members.vault_id
        AND family_vaults.user_id = auth.uid()
    ));

-- Create RLS Policies for audit
CREATE POLICY "Users can view their own audit records"
    ON vault_audit FOR SELECT
    USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_family_vaults_user_id ON family_vaults(user_id);
CREATE INDEX idx_family_vaults_status ON family_vaults(status);
CREATE INDEX idx_vault_members_vault_id ON vault_members(vault_id);
CREATE INDEX idx_vault_members_status ON vault_members(status);
CREATE INDEX idx_vault_audit_record_id ON vault_audit(record_id);

-- Create storage bucket for vault documents
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'vault-documents'
    ) THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('vault-documents', 'vault-documents', false);

        CREATE POLICY "Users can manage their own vault documents"
        ON storage.objects FOR ALL
        USING (
            bucket_id = 'vault-documents' 
            AND auth.uid()::text = (storage.foldername(name))[1]
        )
        WITH CHECK (
            bucket_id = 'vault-documents' 
            AND auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;
END $$;

-- Grant necessary permissions
GRANT ALL ON family_vaults TO authenticated;
GRANT ALL ON vault_members TO authenticated;
GRANT ALL ON vault_audit TO authenticated;
GRANT ALL ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated; 
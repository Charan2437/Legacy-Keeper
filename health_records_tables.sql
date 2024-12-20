-- health_records_tables.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE gender_type AS ENUM ('Male', 'Female', 'Other');
CREATE TYPE blood_group_type AS ENUM ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-');
CREATE TYPE member_status AS ENUM ('Active', 'Inactive');

-- Family Members Table (for health records)
CREATE TABLE family_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(200) NOT NULL CHECK (length(trim(name)) > 0),
    date_of_birth DATE NOT NULL,
    gender gender_type NOT NULL,
    blood_group blood_group_type,
    contact_number VARCHAR(20) NOT NULL,
    secondary_contact VARCHAR(20),
    status member_status DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health Conditions Table
CREATE TABLE health_conditions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    member_id UUID REFERENCES family_members(id) ON DELETE CASCADE NOT NULL,
    condition_name VARCHAR(200) NOT NULL CHECK (length(trim(condition_name)) > 0),
    doctor_name VARCHAR(200) NOT NULL,
    date_of_visit DATE NOT NULL,
    description TEXT,
    document_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_family_members_updated_at
    BEFORE UPDATE ON family_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_conditions_updated_at
    BEFORE UPDATE ON health_conditions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create audit table for health records
CREATE TABLE health_records_audit (
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
CREATE OR REPLACE FUNCTION audit_health_records_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO health_records_audit (
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
        INSERT INTO health_records_audit (
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
CREATE TRIGGER family_members_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON family_members
    FOR EACH ROW EXECUTE FUNCTION audit_health_records_changes();

CREATE TRIGGER health_conditions_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON health_conditions
    FOR EACH ROW EXECUTE FUNCTION audit_health_records_changes();

-- Enable Row Level Security
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records_audit ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view their own family members"
    ON family_members FOR SELECT
    USING (auth.uid() = user_id AND status = 'Active');

CREATE POLICY "Users can create their own family members"
    ON family_members FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own family members"
    ON family_members FOR UPDATE
    USING (auth.uid() = user_id);

-- Health conditions policies
CREATE POLICY "Users can view health conditions of their family members"
    ON health_conditions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM family_members
        WHERE family_members.id = health_conditions.member_id
        AND family_members.user_id = auth.uid()
    ));

CREATE POLICY "Users can create health conditions for their family members"
    ON health_conditions FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM family_members
        WHERE family_members.id = health_conditions.member_id
        AND family_members.user_id = auth.uid()
    ));

CREATE POLICY "Users can update health conditions of their family members"
    ON health_conditions FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM family_members
        WHERE family_members.id = health_conditions.member_id
        AND family_members.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete health conditions of their family members"
    ON health_conditions FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM family_members
        WHERE family_members.id = health_conditions.member_id
        AND family_members.user_id = auth.uid()
    ));

-- Audit table policies
CREATE POLICY "Users can view their own audit records"
    ON health_records_audit FOR SELECT
    USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_family_members_status ON family_members(status);
CREATE INDEX idx_health_conditions_member_id ON health_conditions(member_id);
CREATE INDEX idx_health_records_audit_record_id ON health_records_audit(record_id);

-- Create storage bucket for health documents
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'health-documents'
    ) THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('health-documents', 'health-documents', false);

        CREATE POLICY "Users can manage their own health documents"
        ON storage.objects FOR ALL
        USING (
            bucket_id = 'health-documents' 
            AND auth.uid()::text = (storage.foldername(name))[1]
        )
        WITH CHECK (
            bucket_id = 'health-documents' 
            AND auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;
END $$;

-- Grant necessary permissions
GRANT ALL ON family_members TO authenticated;
GRANT ALL ON health_conditions TO authenticated;
GRANT ALL ON health_records_audit TO authenticated;
GRANT ALL ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
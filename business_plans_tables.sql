-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Business Types Table
CREATE TABLE business_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert common business types
INSERT INTO business_types (name) VALUES
    ('Partnership'),
    ('Sole Proprietorship'),
    ('LLC'),
    ('Corporation'),
    ('Other');

-- Business Plans Table
CREATE TABLE business_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(200) NOT NULL CHECK (length(trim(name)) > 0),
    type_id UUID REFERENCES business_types(id) NOT NULL,
    investment_amount DECIMAL(12,2) CHECK (investment_amount > 0),
    ownership_percentage DECIMAL(5,2) CHECK (ownership_percentage >= 0 AND ownership_percentage <= 100),
    succession_notes TEXT,
    government_id_url TEXT,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Transferred')),
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
CREATE TRIGGER update_business_types_updated_at
    BEFORE UPDATE ON business_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_plans_updated_at
    BEFORE UPDATE ON business_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create audit table
CREATE TABLE business_plans_audit (
    audit_id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    business_plan_id UUID REFERENCES business_plans(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(20) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_business_plan_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO business_plans_audit (
            business_plan_id, user_id, action, old_data, ip_address
        ) VALUES (
            OLD.id,
            auth.uid(),
            TG_OP,
            row_to_json(OLD),
            inet_client_addr()
        );
        RETURN OLD;
    ELSE
        INSERT INTO business_plans_audit (
            business_plan_id, user_id, action, old_data, new_data, ip_address
        ) VALUES (
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

-- Create separate triggers for different operations
CREATE TRIGGER business_plans_audit_delete_trigger
    BEFORE DELETE ON business_plans
    FOR EACH ROW 
    EXECUTE FUNCTION audit_business_plan_changes();

CREATE TRIGGER business_plans_audit_insert_update_trigger
    AFTER INSERT OR UPDATE ON business_plans
    FOR EACH ROW 
    EXECUTE FUNCTION audit_business_plan_changes();

-- Enable Row Level Security
ALTER TABLE business_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_plans_audit ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view business types"
    ON business_types FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Users can view their own business plans"
    ON business_plans FOR SELECT
    USING (auth.uid() = user_id AND status != 'Inactive');

CREATE POLICY "Users can create their own business plans"
    ON business_plans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own active business plans"
    ON business_plans FOR UPDATE
    USING (auth.uid() = user_id AND status = 'Active')
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business plans"
    ON business_plans FOR DELETE
    USING (auth.uid() = user_id AND status = 'Active');

-- Create policy for audit table
CREATE POLICY "Users can view their own audit records"
    ON business_plans_audit FOR SELECT
    USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_business_plans_user_id ON business_plans(user_id);
CREATE INDEX idx_business_plans_type_id ON business_plans(type_id);
CREATE INDEX idx_business_plans_status ON business_plans(status);
CREATE INDEX idx_business_plans_audit_business_plan_id ON business_plans_audit(business_plan_id);
CREATE INDEX idx_business_plans_audit_user_id ON business_plans_audit(user_id);

-- Create storage bucket for business documents
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'business-documents'
    ) THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('business-documents', 'business-documents', false);

        CREATE POLICY "Users can manage their own business documents"
        ON storage.objects FOR ALL
        USING (
            bucket_id = 'business-documents' 
            AND auth.uid()::text = (storage.foldername(name))[1]
        )
        WITH CHECK (
            bucket_id = 'business-documents' 
            AND auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;
END $$;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own business plans" ON business_plans;
DROP POLICY IF EXISTS "Users can create their own business plans" ON business_plans;
DROP POLICY IF EXISTS "Users can update their own business plans" ON business_plans;
DROP POLICY IF EXISTS "Users can delete their own business plans" ON business_plans;

-- Create updated RLS Policies
CREATE POLICY "Users can view their own business plans"
    ON business_plans FOR SELECT
    USING (auth.uid() = user_id AND status != 'Inactive');

CREATE POLICY "Users can create their own business plans"
    ON business_plans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own business plans"
    ON business_plans FOR UPDATE
    USING (auth.uid() = user_id);

-- Updated delete policy to allow status updates
CREATE POLICY "Users can delete their own business plans"
    ON business_plans FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions
GRANT ALL ON business_types TO authenticated;
GRANT ALL ON business_plans TO authenticated;
GRANT ALL ON business_plans_audit TO authenticated;
GRANT ALL ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
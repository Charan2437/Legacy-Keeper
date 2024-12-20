-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create document type enum
CREATE TYPE document_type AS ENUM ('pdf', 'jpeg', 'jpg', 'png', 'doc', 'docx', 'xls', 'xlsx');

-- Create document status enum
CREATE TYPE document_status AS ENUM ('active', 'archived', 'deleted');

-- Create DocumentStore table
CREATE TABLE IF NOT EXISTS documentstore (
    document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    document_title VARCHAR(255) NOT NULL CHECK (length(trim(document_title)) > 0),
    document_type document_type NOT NULL,
    description TEXT,
    bucket_path TEXT NOT NULL CHECK (bucket_path ~ '^[\w-]+/[\w\-\.]+$'),
    file_size BIGINT NOT NULL CHECK (file_size > 0 AND file_size <= 10485760), -- 10MB limit
    status document_status DEFAULT 'active' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_documentstore_user_id ON documentstore(user_id);
CREATE INDEX idx_documentstore_user_type ON documentstore(user_id, document_type);
CREATE INDEX idx_documentstore_status ON documentstore(status) WHERE status != 'deleted';

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_documentstore_updated_at
    BEFORE UPDATE ON documentstore
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE documentstore ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own active documents"
ON documentstore FOR SELECT
USING (auth.uid() = user_id AND status != 'deleted');

CREATE POLICY "Users can insert their own documents"
ON documentstore FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents"
ON documentstore FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
ON documentstore FOR DELETE
USING (auth.uid() = user_id);

-- Create storage bucket for documents if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'document-store'
    ) THEN
        -- Create the bucket
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('document-store', 'document-store', false);

        -- Create storage policy for document files
        CREATE POLICY "Users can manage their own documents"
        ON storage.objects FOR ALL
        USING (
            bucket_id = 'document-store' 
            AND auth.uid()::text = (storage.foldername(name))[1]
        )
        WITH CHECK (
            bucket_id = 'document-store' 
            AND auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;
END $$;

-- Create audit table for document changes
CREATE TABLE DocumentStore_audit (
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documentstore(document_id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action VARCHAR(20) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Update the audit trigger function to handle deletions properly
CREATE OR REPLACE FUNCTION audit_document_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- For DELETE operations, insert audit record before the deletion
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO DocumentStore_audit (
            document_id, 
            user_id, 
            action, 
            old_data, 
            new_data, 
            ip_address
        ) VALUES (
            OLD.document_id,
            auth.uid(),
            TG_OP,
            row_to_json(OLD),
            NULL,
            inet_client_addr()
        );
        RETURN OLD;
    END IF;

    -- For INSERT and UPDATE operations
    INSERT INTO DocumentStore_audit (
        document_id, 
        user_id, 
        action, 
        old_data, 
        new_data, 
        ip_address
    ) VALUES (
        COALESCE(NEW.document_id, OLD.document_id),
        auth.uid(),
        TG_OP,
        CASE WHEN TG_OP = 'UPDATE' THEN row_to_json(OLD) ELSE NULL END,
        row_to_json(NEW),
        inet_client_addr()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS document_audit_trigger ON documentstore;

CREATE TRIGGER document_audit_trigger
BEFORE DELETE OR AFTER INSERT OR UPDATE ON documentstore
FOR EACH ROW EXECUTE FUNCTION audit_document_changes();

-- Grant necessary permissions
GRANT ALL ON documentstore TO authenticated;
GRANT ALL ON DocumentStore_audit TO authenticated;
GRANT ALL ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Alter existing table
ALTER TABLE documentstore 
DROP CONSTRAINT documentstore_bucket_path_check,
ADD CONSTRAINT documentstore_bucket_path_check 
CHECK (bucket_path ~ '^[\w-]+/[\w\-\.]+$');


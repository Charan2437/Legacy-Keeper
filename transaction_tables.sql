-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing types if they exist
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;

-- Create transaction types enum
CREATE TYPE transaction_type AS ENUM ('Paid', 'Received');

-- Create payment method enum
CREATE TYPE payment_method AS ENUM (
    'Cash',
    'UPI',
    'Credit Card',
    'Debit Card',
    'Net Banking',
    'Phone Pay',
    'Google Pay',
    'PayTM'
);

-- Drop existing tables if they exist
DROP TABLE IF EXISTS public.transactions CASCADE;

-- Create the transactions table
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    person_party VARCHAR(255) NOT NULL,
    type transaction_type NOT NULL,
    payment_mode payment_method NOT NULL,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    description TEXT,
    document_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT
    USING (auth.uid() = user_id AND deleted_at IS NULL);

CREATE POLICY "Users can create own transactions" ON public.transactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create storage bucket for transaction documents
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets WHERE id = 'transaction-documents'
    ) THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES (
            'transaction-documents',
            'transaction-documents',
            false
        );

        CREATE POLICY "Users can manage own transaction documents"
        ON storage.objects FOR ALL
        TO authenticated
        USING (
            bucket_id = 'transaction-documents' 
            AND auth.uid()::text = (storage.foldername(name))[1]
        )
        WITH CHECK (
            bucket_id = 'transaction-documents' 
            AND auth.uid()::text = (storage.foldername(name))[1]
        );
    END IF;
END $$;

-- Grant necessary permissions
GRANT ALL ON public.transactions TO authenticated;
GRANT ALL ON SCHEMA storage TO authenticated;
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;

-- Add composite index for common query patterns
CREATE INDEX idx_user_transactions ON public.transactions(user_id, created_at DESC);
  
-- Create the users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone_number TEXT,
    country_code TEXT,
    government_id_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own profile during signup
CREATE POLICY "Enable insert access for all users" ON public.users
    FOR INSERT
    WITH CHECK (true);  -- Allow all inserts initially

-- Create policy to allow users to read their own profile
CREATE POLICY "Enable read access for users" ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- Create policy to allow users to update their own profile
CREATE POLICY "Enable update access for users" ON public.users
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Grant necessary permissions
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- Create storage bucket for government IDs if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('government-ids', 'government-ids', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Enable storage access for users" ON storage.objects
    FOR ALL
    USING (bucket_id = 'government-ids' AND auth.uid()::text = (storage.foldername(name))[1])
    WITH CHECK (bucket_id = 'government-ids' AND auth.uid()::text = (storage.foldername(name))[1]); 

-- Add to your existing auth_tables.sql
CREATE TABLE IF NOT EXISTS public.email_rate_limits (
    email TEXT PRIMARY KEY,
    attempt_count INTEGER DEFAULT 1,
    last_attempt TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    next_allowed TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) + INTERVAL '1 hour'
);

-- Policy for email rate limits
CREATE POLICY "Enable insert access for email rate limits" ON public.email_rate_limits
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Enable update access for email rate limits" ON public.email_rate_limits
    FOR UPDATE
    USING (true);

-- Enable RLS
ALTER TABLE public.email_rate_limits ENABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON public.email_rate_limits TO authenticated;
GRANT ALL ON public.email_rate_limits TO anon;
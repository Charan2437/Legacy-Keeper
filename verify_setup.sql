-- Check if enums exist
SELECT typname, enumlabel 
FROM pg_enum e 
JOIN pg_type t ON e.enumtypid = t.oid 
WHERE typname IN ('transaction_type', 'payment_method');

-- Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'transactions';

-- Check RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'transactions';

-- Check if table exists and has the correct structure
\d+ public.transactions; 
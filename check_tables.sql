-- Check if tables exist
SELECT EXISTS (
  SELECT FROM pg_tables 
  WHERE schemaname = 'public' 
  AND tablename = 'transactions'
);

-- Check RLS policies
SELECT * FROM pg_policies 
WHERE tablename = 'transactions';

-- Check enums
SELECT typname, enumlabel 
FROM pg_enum e 
JOIN pg_type t ON e.enumtypid = t.oid;

-- Check if any data exists
SELECT COUNT(*) FROM transactions; 
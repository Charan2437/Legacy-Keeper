-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for debts and loans
CREATE TYPE money_flow AS ENUM ('Given', 'Received');
CREATE TYPE payment_status AS ENUM ('Pending', 'Partially Paid', 'Paid');

-- Create the main debts_loans table
CREATE TABLE debts_loans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    flow_type money_flow NOT NULL,
    person_name TEXT NOT NULL,
    create_request BOOLEAN DEFAULT false,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    interest_amount DECIMAL(12,2),
    amount_due DECIMAL(12,2) NOT NULL,
    payment_mode payment_method, -- Using the existing payment_method enum from transactions
    start_date DATE NOT NULL,
    due_date DATE NOT NULL,
    security TEXT,
    purpose TEXT,
    document_url TEXT,
    status payment_status DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create table for tracking payments
CREATE TABLE debt_loan_payments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    debt_loan_id UUID REFERENCES debts_loans(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    payment_date DATE NOT NULL,
    payment_mode payment_method NOT NULL,
    notes TEXT,
    document_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create table for payment requests
CREATE TABLE debt_loan_requests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    debt_loan_id UUID REFERENCES debts_loans(id) ON DELETE CASCADE,
    requested_amount DECIMAL(12,2) NOT NULL CHECK (requested_amount > 0),
    request_date DATE NOT NULL,
    status TEXT DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add indexes for better query performance
CREATE INDEX idx_debts_loans_user ON debts_loans(user_id);
CREATE INDEX idx_debts_loans_status ON debts_loans(status);
CREATE INDEX idx_debt_loan_payments_debt_loan ON debt_loan_payments(debt_loan_id);
CREATE INDEX idx_debt_loan_requests_debt_loan ON debt_loan_requests(debt_loan_id);

-- Add updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updating timestamps
CREATE TRIGGER update_debts_loans_updated_at
    BEFORE UPDATE ON debts_loans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_debt_loan_payments_updated_at
    BEFORE UPDATE ON debt_loan_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_debt_loan_requests_updated_at
    BEFORE UPDATE ON debt_loan_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE debts_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_loan_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_loan_requests ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own debts and loans"
    ON debts_loans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debts and loans"
    ON debts_loans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts and loans"
    ON debts_loans FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts and loans"
    ON debts_loans FOR DELETE
    USING (auth.uid() = user_id);

-- Similar policies for payments
CREATE POLICY "Users can view payments for their debts and loans"
    ON debt_loan_payments FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM debts_loans
        WHERE id = debt_loan_payments.debt_loan_id
        AND user_id = auth.uid()
    ));

CREATE POLICY "Users can insert payments for their debts and loans"
    ON debt_loan_payments FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM debts_loans
        WHERE id = debt_loan_payments.debt_loan_id
        AND user_id = auth.uid()
    ));

-- Similar policies for requests
CREATE POLICY "Users can view requests for their debts and loans"
    ON debt_loan_requests FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM debts_loans
        WHERE id = debt_loan_requests.debt_loan_id
        AND user_id = auth.uid()
    ));

-- Grant necessary permissions
GRANT ALL ON debts_loans TO authenticated;
GRANT ALL ON debt_loan_payments TO authenticated;
GRANT ALL ON debt_loan_requests TO authenticated; 
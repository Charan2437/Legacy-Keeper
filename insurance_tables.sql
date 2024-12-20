-- Insurance Types Table
CREATE TABLE insurance_types (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert common insurance types
INSERT INTO insurance_types (name) VALUES
  ('Health'),
  ('Life'),
  ('Vehicle'),
  ('Property'),
  ('Term'),
  ('Content'),
  ('Travel'),
  ('Other');

-- Insurance Providers Table
CREATE TABLE insurance_providers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  contact_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Main Insurance Policies Table
CREATE TABLE insurance_policies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type_id UUID REFERENCES insurance_types(id) NOT NULL,
  provider_id UUID REFERENCES insurance_providers(id),
  policy_number VARCHAR(100) UNIQUE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  amount DECIMAL(12,2) NOT NULL,
  premium_amount DECIMAL(12,2),
  premium_frequency VARCHAR(20) CHECK (premium_frequency IN ('Monthly', 'Quarterly', 'Semi-Annual', 'Annual')),
  insurance_date DATE NOT NULL,
  end_date DATE,
  coverage_period INTEGER, -- in months
  paid_to VARCHAR(100),
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Expired', 'Cancelled', 'Claimed')),
  reminder_enabled BOOLEAN DEFAULT false,
  document_url TEXT,
  government_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurance Beneficiaries Table
CREATE TABLE insurance_beneficiaries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  policy_id UUID REFERENCES insurance_policies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  relationship VARCHAR(50),
  percentage DECIMAL(5,2) CHECK (percentage >= 0 AND percentage <= 100),
  contact_info TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurance Premium Payments Table
CREATE TABLE insurance_payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  policy_id UUID REFERENCES insurance_policies(id) ON DELETE CASCADE,
  amount DECIMAL(12,2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50),
  transaction_reference VARCHAR(100),
  status VARCHAR(20) DEFAULT 'Completed' CHECK (status IN ('Pending', 'Completed', 'Failed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insurance Claims Table
CREATE TABLE insurance_claims (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  policy_id UUID REFERENCES insurance_policies(id) ON DELETE CASCADE,
  claim_number VARCHAR(100) UNIQUE,
  claim_date DATE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Paid')),
  description TEXT,
  document_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_claims ENABLE ROW LEVEL SECURITY;

-- Policies for insurance_policies
CREATE POLICY "Users can view their own insurance policies"
  ON insurance_policies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own insurance policies"
  ON insurance_policies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own insurance policies"
  ON insurance_policies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own insurance policies"
  ON insurance_policies FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for insurance_beneficiaries
CREATE POLICY "Users can manage beneficiaries of their own policies"
  ON insurance_beneficiaries
  USING (EXISTS (
    SELECT 1 FROM insurance_policies
    WHERE insurance_policies.id = insurance_beneficiaries.policy_id
    AND insurance_policies.user_id = auth.uid()
  ));

-- Policies for insurance_payments
CREATE POLICY "Users can manage payments of their own policies"
  ON insurance_payments
  USING (EXISTS (
    SELECT 1 FROM insurance_policies
    WHERE insurance_policies.id = insurance_payments.policy_id
    AND insurance_policies.user_id = auth.uid()
  ));

-- Policies for insurance_claims
CREATE POLICY "Users can manage claims of their own policies"
  ON insurance_claims
  USING (EXISTS (
    SELECT 1 FROM insurance_policies
    WHERE insurance_policies.id = insurance_claims.policy_id
    AND insurance_policies.user_id = auth.uid()
  ));

-- Indexes for better performance
CREATE INDEX idx_insurance_policies_user_id ON insurance_policies(user_id);
CREATE INDEX idx_insurance_policies_type_id ON insurance_policies(type_id);
CREATE INDEX idx_insurance_policies_status ON insurance_policies(status);
CREATE INDEX idx_insurance_beneficiaries_policy_id ON insurance_beneficiaries(policy_id);
CREATE INDEX idx_insurance_payments_policy_id ON insurance_payments(policy_id);
CREATE INDEX idx_insurance_claims_policy_id ON insurance_claims(policy_id); 
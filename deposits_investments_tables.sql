-- Deposits Table
CREATE TABLE deposits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  type VARCHAR(50) NOT NULL CHECK (type IN ('Fixed Deposit', 'Recurring Deposit', 'Savings Deposit')),
  bank_name VARCHAR(100) NOT NULL,
  account_number VARCHAR(50),
  amount DECIMAL(12,2) NOT NULL,
  interest_rate DECIMAL(5,2),
  start_date DATE NOT NULL,
  maturity_date DATE,
  maturity_amount DECIMAL(12,2),
  payment_mode VARCHAR(50) NOT NULL,
  document_url TEXT,
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Matured', 'Closed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investments Table
CREATE TABLE investments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  type VARCHAR(50) NOT NULL CHECK (type IN ('Stocks', 'Mutual Funds', 'Bonds', 'Gold', 'Real Estate', 'Other')),
  name VARCHAR(100) NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  quantity DECIMAL(10,2),
  purchase_price DECIMAL(12,2),
  current_price DECIMAL(12,2),
  purchase_date DATE NOT NULL,
  payment_mode VARCHAR(50) NOT NULL,
  broker_platform VARCHAR(100),
  document_url TEXT,
  status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Sold', 'Expired')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investment Returns/Profits Table
CREATE TABLE investment_returns (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  investment_id UUID REFERENCES investments(id) ON DELETE CASCADE,
  return_type VARCHAR(50) NOT NULL CHECK (return_type IN ('Dividend', 'Interest', 'Capital Gain', 'Rent')),
  amount DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_returns ENABLE ROW LEVEL SECURITY;

-- Policies for deposits
CREATE POLICY "Users can view their own deposits"
  ON deposits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deposits"
  ON deposits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deposits"
  ON deposits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own deposits"
  ON deposits FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for investments
CREATE POLICY "Users can view their own investments"
  ON investments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own investments"
  ON investments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investments"
  ON investments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investments"
  ON investments FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for investment returns
CREATE POLICY "Users can view their own investment returns"
  ON investment_returns FOR SELECT
  USING (
    auth.uid() = (
      SELECT user_id 
      FROM investments 
      WHERE id = investment_returns.investment_id
    )
  );

CREATE POLICY "Users can manage their own investment returns"
  ON investment_returns FOR ALL
  USING (
    auth.uid() = (
      SELECT user_id 
      FROM investments 
      WHERE id = investment_returns.investment_id
    )
  );

-- Indexes for better performance
CREATE INDEX idx_deposits_user_id ON deposits(user_id);
CREATE INDEX idx_deposits_type ON deposits(type);
CREATE INDEX idx_deposits_status ON deposits(status);

CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_investments_type ON investments(type);
CREATE INDEX idx_investments_status ON investments(status);

CREATE INDEX idx_investment_returns_investment_id ON investment_returns(investment_id); 
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for reminders
CREATE TYPE reminder_type AS ENUM (
    'Insurance Premium',
    'Loan Payment',
    'Investment',
    'Document Renewal',
    'Health Checkup',
    'Birthday',
    'Anniversary',
    'Custom'
);

CREATE TYPE reminder_frequency AS ENUM (
    'Once',
    'Daily',
    'Weekly',
    'Monthly',
    'Quarterly',
    'Yearly'
);

CREATE TYPE reminder_status AS ENUM (
    'Active',
    'Completed',
    'Snoozed',
    'Cancelled'
);

-- Create reminders table
CREATE TABLE reminders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(200) NOT NULL CHECK (length(trim(title)) > 0),
    description TEXT,
    type reminder_type NOT NULL,
    frequency reminder_frequency NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    next_reminder_date DATE NOT NULL,
    notification_email BOOLEAN DEFAULT true,
    notification_sms BOOLEAN DEFAULT false,
    status reminder_status DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reminder history table for tracking notifications sent
CREATE TABLE reminder_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reminder_id UUID REFERENCES reminders(id) ON DELETE CASCADE NOT NULL,
    notification_date TIMESTAMPTZ NOT NULL,
    notification_type VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_reminders_updated_at
    BEFORE UPDATE ON reminders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_history ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies
CREATE POLICY "Users can view their own reminders"
    ON reminders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders"
    ON reminders FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders"
    ON reminders FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders"
    ON reminders FOR DELETE
    USING (auth.uid() = user_id);

-- Policies for reminder history
CREATE POLICY "Users can view their own reminder history"
    ON reminder_history FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM reminders
        WHERE reminders.id = reminder_history.reminder_id
        AND reminders.user_id = auth.uid()
    ));

-- Create indexes for better performance
CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_next_reminder_date ON reminders(next_reminder_date);
CREATE INDEX idx_reminders_status ON reminders(status);
CREATE INDEX idx_reminder_history_reminder_id ON reminder_history(reminder_id);

-- Grant necessary permissions
GRANT ALL ON reminders TO authenticated;
GRANT ALL ON reminder_history TO authenticated;

-- Function to update next reminder date based on frequency
CREATE OR REPLACE FUNCTION update_next_reminder_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.frequency = 'Once' THEN
        NEW.next_reminder_date := NEW.start_date;
    ELSIF NEW.frequency = 'Daily' THEN
        NEW.next_reminder_date := CASE 
            WHEN CURRENT_DATE > NEW.start_date THEN CURRENT_DATE + INTERVAL '1 day'
            ELSE NEW.start_date
        END;
    ELSIF NEW.frequency = 'Weekly' THEN
        NEW.next_reminder_date := CASE 
            WHEN CURRENT_DATE > NEW.start_date THEN CURRENT_DATE + INTERVAL '1 week'
            ELSE NEW.start_date
        END;
    ELSIF NEW.frequency = 'Monthly' THEN
        NEW.next_reminder_date := CASE 
            WHEN CURRENT_DATE > NEW.start_date THEN CURRENT_DATE + INTERVAL '1 month'
            ELSE NEW.start_date
        END;
    ELSIF NEW.frequency = 'Quarterly' THEN
        NEW.next_reminder_date := CASE 
            WHEN CURRENT_DATE > NEW.start_date THEN CURRENT_DATE + INTERVAL '3 months'
            ELSE NEW.start_date
        END;
    ELSIF NEW.frequency = 'Yearly' THEN
        NEW.next_reminder_date := CASE 
            WHEN CURRENT_DATE > NEW.start_date THEN CURRENT_DATE + INTERVAL '1 year'
            ELSE NEW.start_date
        END;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating next reminder date
CREATE TRIGGER update_next_reminder_date_trigger
    BEFORE INSERT OR UPDATE ON reminders
    FOR EACH ROW
    EXECUTE FUNCTION update_next_reminder_date(); 
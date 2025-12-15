-- ============================================================================
-- MIGRATION SCRIPT - FLEETSM AUDIT FIXES
-- ============================================================================
-- Description: Unifies Drivers/Users, adds detailed Maintenance logs,
--              unifies Financial transactions, and enhances Asset documentation.
-- ============================================================================

-- 1. DRIVERS: Link to Auth Users (Generalization)
-- ----------------------------------------------------------------------------
ALTER TABLE drivers 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- Optional: Index for faster lookups by user_id
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);


-- 2. VEHICLES: Add Insurance & Documents (Asset Management)
-- ----------------------------------------------------------------------------
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS insurance_expiry DATE,
ADD COLUMN IF NOT EXISTS documents JSONB DEFAULT '[]'::jsonb;


-- 3. MAINTENANCE: Detailed Maintenance Logs
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS maintenance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id TEXT REFERENCES vehicles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('Preventive', 'Corrective', 'Emergency')),
    description TEXT NOT NULL,
    cost NUMERIC NOT NULL DEFAULT 0,
    provider TEXT,
    scheduled_date DATE NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Scheduled', 'In Progress', 'Completed')),
    guarantee BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- RLS Policies for Maintenance
ALTER TABLE maintenance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON maintenance;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON maintenance;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON maintenance;

CREATE POLICY "Enable read access for authenticated users" ON maintenance
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable write access for authenticated users" ON maintenance
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON maintenance
    FOR UPDATE USING (auth.role() = 'authenticated');


-- 4. TRANSACTIONS: Unified Income/Expenses
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('Income', 'Expense')),
    category TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('Pending', 'Paid', 'Overdue')),
    
    -- Document Details
    document_type TEXT,
    document_number TEXT,
    document_url TEXT,
    
    -- Relations (Polymorphic-ish or specific)
    related_id TEXT, -- Can link to maintenance.id or routes.id
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for Transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON transactions;
DROP POLICY IF EXISTS "Enable write access for authenticated users" ON transactions;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON transactions;

CREATE POLICY "Enable read access for authenticated users" ON transactions
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable write access for authenticated users" ON transactions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON transactions
    FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

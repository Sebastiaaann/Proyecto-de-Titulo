-- 🚨 WARNING: This script will delete all existing data in the 'routes' table!
-- Use this to fix "400 Bad Request" errors caused by schema mismatches (e.g. driver ID vs Name, Price formats).

-- 1. Reset Table
DROP TABLE IF EXISTS routes CASCADE;

-- 2. Create Table with Looser Constraints (Text) to match App Logic
CREATE TABLE routes (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    origin text NOT NULL,
    destination text NOT NULL,
    distance text,               -- App sends strings like "15 km"
    estimated_price numeric,     -- App now sends raw numbers (e.g. 15000)
    vehicle_type text,           -- Storing as text to avoid Enum mismatches
    driver text,                 -- Storing as text (Name) as App sends names, not UUIDs currently
    vehicle text,                -- Storing as text (Plate/Name) 
    status text DEFAULT 'Pending',
    timestamp timestamptz DEFAULT now(),
    delivery_proof jsonb,        -- Store JSON data for signatures
    
    -- Additional fields for GPS/Tracking
    start_lat float,
    start_lng float,
    started_at timestamptz,
    
    -- Metadata
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

-- 4. Policies (Open for Demo/Development)
create policy "Enable all access for authenticated users"
on routes for all
to authenticated
using (true)
with check (true);

-- 5. Grant Permissions
GRANT ALL ON TABLE routes TO authenticated;
GRANT ALL ON TABLE routes TO service_role;

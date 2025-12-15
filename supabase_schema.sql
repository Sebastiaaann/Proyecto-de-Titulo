-- ==============================================================================
-- SCHEMA FOR FLEET TRAKING SYSTEM
-- ==============================================================================

-- 1. Modify 'routes' table to support Start Trip Logic
-- Add columns to capture the precise start location and time
ALTER TABLE routes 
ADD COLUMN IF NOT EXISTS start_lat float,
ADD COLUMN IF NOT EXISTS start_lng float,
ADD COLUMN IF NOT EXISTS started_at timestamptz;

-- 2. Create 'gps_tracking' table for historical data
-- This table stores the granular points of the trip for historical playback
CREATE TABLE IF NOT EXISTS gps_tracking (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  route_id text NOT NULL, -- Assuming route IDs are text based on current usage
  vehicle_id text NOT NULL, -- Assuming vehicle IDs are text
  latitude float NOT NULL,
  longitude float NOT NULL,
  speed float,
  heading float,
  engine_on boolean DEFAULT true,
  timestamp timestamptz DEFAULT now()
);

-- Index for faster querying of history by route
CREATE INDEX IF NOT EXISTS idx_gps_tracking_route_id ON gps_tracking(route_id);
CREATE INDEX IF NOT EXISTS idx_gps_tracking_timestamp ON gps_tracking(timestamp);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==============================================================================

-- Enable RLS on gps_tracking
ALTER TABLE gps_tracking ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users (drivers) to insert their own tracking points
-- We correlate the user via the `routes` table or simply allow Authenticated insert
-- For simplicity in this demo phase, we allow any authenticated user to log points.
-- ideally: WHERE EXISTS (SELECT 1 FROM routes WHERE id = route_id AND driver_id = auth.uid())

CREATE POLICY "Authenticated users can insert tracking points" 
ON gps_tracking FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Policy: Allow authenticated users to view tracking points (Admins/Dispatchers)
CREATE POLICY "Authenticated users can view tracking points" 
ON gps_tracking FOR SELECT 
TO authenticated 
USING (true);

-- ==============================================================================
-- REALTIME SUBSCRIPTION
-- ==============================================================================
-- To enable Realtime for gps_tracking, you must enable it in the Supabase Dashboard
-- Database -> Replication -> Source -> supabase_realtime -> Enable for 'gps_tracking'

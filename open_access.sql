-- 🔓 OPEN ACCESS POLICY (For Development/Testing)
-- This allows ANYONE (logged in or not) to read/write to the routes table.
-- Use this to fix "401 Unauthorized" errors while testing.

-- 1. Drop existing strict policy
DROP POLICY IF EXISTS "Enable all access for authenticated users" ON routes;

-- 2. Create permissive policy for public (anon) access
CREATE POLICY "Enable public access"
ON routes
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- 3. Ensure RLS is enabled (should be, but good to double check)
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

-- 4. Grant permissions to the anonymous role
GRANT ALL ON TABLE routes TO anon;
GRANT ALL ON TABLE routes TO authenticated;
GRANT ALL ON TABLE routes TO service_role;

-- ============================================================================
-- DISABLE RLS SCRIPT - TEMPORARY FOR TESTING
-- ============================================================================
-- WARNING: This will allow ANYONE with the API Key/URL to read/write these tables.
-- Use only for development testing to verify features work without permission blocks.
-- ============================================================================

-- Disable RLS on Transactions
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;

-- Disable RLS on Maintenance
ALTER TABLE maintenance DISABLE ROW LEVEL SECURITY;

-- Disable RLS on Vehicles (if applicable)
ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on Drivers (if applicable)
ALTER TABLE drivers DISABLE ROW LEVEL SECURITY;

-- Disable RLS on Profiles (if likely initialized)
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TO RE-ENABLE LATER:
-- Run: ALTER TABLE [table_name] ENABLE ROW LEVEL SECURITY;
-- ============================================================================

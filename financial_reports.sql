-- Create table for financial reports
CREATE TABLE IF NOT EXISTS financial_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  top_driver TEXT,
  most_profitable_route TEXT,
  cost_saving_opportunity TEXT,
  efficiency_trend TEXT,
  net_profit_margin TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  period_range TEXT -- e.g. "30 days"
);

-- Enable RLS
ALTER TABLE financial_reports ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public access (for development simplicity, as requested)
CREATE POLICY "Public Access" ON financial_reports
  FOR ALL USING (true) WITH CHECK (true);

-- Grant access to anon/service_role
GRANT ALL ON financial_reports TO anon;
GRANT ALL ON financial_reports TO service_role;

-- DOT/FMCSA MCP Server Database Schema
-- Covers: 49 CFR Parts 350-399 (FMCSA), 100-185 (Hazmat), HOS, CSA

DROP TABLE IF EXISTS api_usage CASCADE;
DROP TABLE IF EXISTS csa_categories CASCADE;
DROP TABLE IF EXISTS violation_codes CASCADE;
DROP TABLE IF EXISTS hazmat_classifications CASCADE;
DROP TABLE IF EXISTS hos_rules CASCADE;
DROP TABLE IF EXISTS dot_penalty_schedule CASCADE;
DROP TABLE IF EXISTS dot_standards CASCADE;

-- Main standards table for 49 CFR
CREATE TABLE dot_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  standard_number TEXT NOT NULL,  -- e.g., "392.9A", "571.108"
  title TEXT NOT NULL,
  part INTEGER NOT NULL,  -- e.g., 392, 395, 571
  subpart TEXT,
  section_number TEXT NOT NULL,  -- e.g., "392.9", "395"
  scope TEXT NOT NULL CHECK (scope IN (
    'fmcs',          -- General FMCSRs
    'hos',           -- Hours of service
    'hazmat',        -- Hazardous materials
    'csa',           -- CSA/safety fitness
    'driver',        -- Driver qualifications
    'vehicle',       -- Vehicle inspection/maintenance
    'accident',       -- Accident reporting
    'drug_alcohol',   -- Drug and alcohol testing
    'hazardous_materials'  -- Alternate name for hazmat
  )),
  raw_text TEXT NOT NULL,
  plain_summary TEXT,
  key_requirements JSONB DEFAULT '[]',
  violation_codes JSONB DEFAULT '[]',
  related_standards JSONB DEFAULT '[]',
  ecfr_url TEXT,
  last_amended DATE,
  keywords JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(standard_number)
);

CREATE INDEX idx_dot_standards_fts ON dot_standards USING gin(
  to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(plain_summary, '') || ' ' || COALESCE(raw_text, ''))
);
CREATE INDEX idx_dot_standards_number ON dot_standards(standard_number);
CREATE INDEX idx_dot_standards_part ON dot_standards(part);
CREATE INDEX idx_dot_standards_scope ON dot_standards(scope);
CREATE INDEX idx_dot_standards_keywords ON dot_standards USING gin(keywords);

-- Hours of Service rules
CREATE TABLE hos_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_code TEXT UNIQUE NOT NULL,  -- e.g., "HOS-11", "HOS-34"
  category TEXT NOT NULL,  -- 'property', 'passenger', 'hazmat'
  rule_type TEXT NOT NULL,  -- 'driving_time', 'duty_time', 'off_duty', 'sleeper'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  max_hours INTEGER NOT NULL,  -- in hours
  min_hours INTEGER,  -- for off-duty minimums
  window_hours INTEGER,  -- rolling window in hours
  citation TEXT NOT NULL,  -- e.g., "49 CFR 395.3(a)"
  examples JSONB DEFAULT '[]',
  exemptions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hos_category ON hos_rules(category);
CREATE INDEX idx_hos_citation ON hos_rules(citation);

-- Hazmat classifications and requirements
CREATE TABLE hazmat_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_number TEXT NOT NULL,  -- '1', '2.1', '3', '4.1', etc.
  class_name TEXT NOT NULL,  -- 'Flammable Gas', 'Flammable Liquid'
  division TEXT,  -- for Class 1 explosives
  packing_group TEXT CHECK (packing_group IN ('I', 'II', 'III')),
  description TEXT NOT NULL,
  key_requirements JSONB DEFAULT '[]',
  marking_requirements JSONB DEFAULT '[]',
  labeling_requirements JSONB DEFAULT '[]',
  placard_requirements JSONB DEFAULT '[]',
  shipping paper_requirements TEXT,
  training_requirements TEXT,
  citation TEXT,  -- 49 CFR citation
  related_classes TEXT[],  -- classes that interact
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hazmat_class ON hazmat_classifications(class_number);

-- FMCSA violation codes (from CSA program)
CREATE TABLE violation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  violation_code TEXT UNIQUE NOT NULL,  -- e.g., "395.3A"
  description TEXT NOT NULL,
  acute_indicator BOOLEAN DEFAULT false,  -- acute = severe violation
  critical_indicator BOOLEAN DEFAULT false,
  severity_weight INTEGER NOT NULL,  -- 1-10 severity
  basic_area TEXT NOT NULL,  -- HOS, Driver Fitness, etc.
  csa_category TEXT NOT NULL,
  carrier_type TEXT[],  -- trucking, passenger, hazmat, etc.
  citation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_violation_code ON violation_codes(violation_code);
CREATE INDEX idx_violation_basic_area ON violation_codes(basic_area);
CREATE INDEX idx_violation_severity ON violation_codes(severity_weight DESC);

-- FMCSA/DOT penalty schedule
CREATE TABLE dot_penalty_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  violation_category TEXT NOT NULL,
  min_penalty NUMERIC,
  max_penalty NUMERIC,
  unit_type TEXT,  -- 'per_violation', 'per_day', 'per_driver'
  statutory_limit BOOLEAN DEFAULT false,
  notes TEXT,
  effective_date DATE NOT NULL,
  citation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dot_penalty_category ON dot_penalty_schedule(violation_category);

-- CSA BASIC categories (Behavior Analysis and Safety Improvement)
CREATE TABLE csa_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  basic_code TEXT UNIQUE NOT NULL,  -- 'HOS', 'DRF', 'VEO', 'SSR', 'BDD', 'MAC'
  basic_name TEXT NOT NULL,
  description TEXT NOT NULL,
  severity_ratings JSONB DEFAULT '[]',
  intervention_thresholds JSONB DEFAULT '[]',
  carrier_type TEXT[],  -- applicable carrier types
  citation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- API usage tracking
CREATE TABLE api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key TEXT,
  tool_name TEXT NOT NULL,
  query TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  response_time_ms INTEGER
);

-- Search function for DOT standards
CREATE OR REPLACE FUNCTION search_dot_standards(
  search_query TEXT,
  scope_filter TEXT DEFAULT NULL,
  result_limit INT DEFAULT 5
)
RETURNS TABLE(
  standard_number TEXT,
  title TEXT,
  part INTEGER,
  scope TEXT,
  plain_summary TEXT,
  key_requirements JSONB,
  ecfr_url TEXT,
  rank REAL
)
LANGUAGE SQL
AS $$
  SELECT
    s.standard_number,
    s.title,
    s.part,
    s.scope,
    s.plain_summary,
    s.key_requirements,
    s.ecfr_url,
    ts_rank(
      to_tsvector('english', COALESCE(s.title, '') || ' ' || COALESCE(s.plain_summary, '') || ' ' || COALESCE(s.raw_text, '')),
      plainto_tsquery('english', search_query)
    ) AS rank
  FROM dot_standards s
  WHERE to_tsvector('english', COALESCE(s.title, '') || ' ' || COALESCE(s.plain_summary, '') || ' ' || COALESCE(s.raw_text, '')) @@ plainto_tsquery('english', search_query)
    AND (scope_filter IS NULL OR s.scope = scope_filter)
  ORDER BY rank DESC
  LIMIT result_limit;
$$;

-- Row Level Security
ALTER TABLE dot_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE hos_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE hazmat_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE violation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dot_penalty_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE csa_categories ENABLE ROW LEVEL SECURITY;
ALTER uABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Public read policies (for MCP server anonymous access)
CREATE POLICY anon_read_dot_standards ON dot_standards FOR SELECT USING (true);
CREATE POLICY anon_read_hos ON hos_rules FOR SELECT USING (true);
CREATE POLICY anon_read_hazmat ON hazmat_classifications FOR SELECT USING (true);
CREATE POLICY anon_read_violations ON violation_codes FOR SELECT USING (true);
CREATE POLICY anon_read_dot_penalty ON dot_penalty_schedule FOR SELECT USING (true);
CREATE POLICY anon_read_csa ON csa_categories FOR SELECT USING (true);
CREATE POLICY anon_insert_usage ON api_usage FOR INSERT WITH CHECK (true);

-- Allow insert for seeding
CREATE POLICY anon_insert_dot_standards ON dot_standards FOR INSERT WITH CHECK (true);
CREATE POLICY anon_insert_hos ON hos_rules FOR INSERT WITH CHECK (true);
CREATE POLICY anon_insert_hazmat ON hazmat_classifications FOR INSERT WITH CHECK (true);
CREATE POLICY anon_insert_violations ON violation_codes FOR INSERT WITH CHECK (true);
CREATE POLICY anon_insert_dot_penalty ON dot_penalty_schedule FOR INSERT WITH CHECK (true);
CREATE POLICY anon_insert_csa ON csa_categories FOR INSERT WITH CHECK (true);

SELECT 'DOT/FMCSA MCP database setup complete' AS status;

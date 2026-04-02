-- DOT/FMCSA MCP Server Database Schema
CREATE TABLE dot_standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  standard_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  part INTEGER NOT NULL,
  subpart TEXT,
  section_number TEXT NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('fmcs', 'hos', 'hazmat', 'csa', 'driver', 'vehicle', 'accident', 'drug_alcohol', 'hazardous_materials')),
  raw_text TEXT NOT NULL,
  plain_summary TEXT,
  key_requirements JSONB DEFAULT '[]',
  violation_codes JSONB DEFAULT '[]',
  related_standards JSONB DEFAULT '[]',
  ecfr_url TEXT,
  last_amended DATE,
  keywords JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dot_standards_fts ON dot_standards USING gin(
  to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(plain_summary, '') || ' ' || COALESCE(raw_text, ''))
);
CREATE INDEX idx_dot_standards_number ON dot_standards(standard_number);
CREATE INDEX idx_dot_standards_part ON dot_standards(part);
CREATE INDEX idx_dot_standards_scope ON dot_standards(scope);
CREATE INDEX idx_dot_standards_keywords ON dot_standards USING gin(keywords);

CREATE TABLE hos_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_code TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  max_hours INTEGER,
  min_hours INTEGER,
  window_hours INTEGER,
  citation TEXT NOT NULL,
  examples JSONB DEFAULT '[]',
  exemptions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hos_category ON hos_rules(category);
CREATE INDEX idx_hos_citation ON hos_rules(citation);

CREATE TABLE hazmat_classifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_number TEXT NOT NULL,
  class_name TEXT NOT NULL,
  division TEXT,
  packing_group TEXT,
  description TEXT NOT NULL,
  key_requirements JSONB DEFAULT '[]',
  marking_requirements JSONB DEFAULT '[]',
  labeling_requirements JSONB DEFAULT '[]',
  placard_requirements JSONB DEFAULT '[]',
  shipping_paper_requirements TEXT,
  training_requirements TEXT,
  citation TEXT,
  related_classes TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hazmat_class ON hazmat_classifications(class_number);

CREATE TABLE violation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  violation_code TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  acute_indicator BOOLEAN DEFAULT false,
  critical_indicator BOOLEAN DEFAULT false,
  severity_weight INTEGER NOT NULL CHECK (severity_weight BETWEEN 1 AND 10),
  basic_area TEXT NOT NULL,
  csa_category TEXT NOT NULL,
  citation TEXT,
  carrier_type TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_violation_code ON violation_codes(violation_code);
CREATE INDEX idx_violation_basic_area ON violation_codes(basic_area);
CREATE INDEX idx_violation_severity ON violation_codes(severity_weight DESC);

CREATE TABLE dot_penalty_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  violation_category TEXT UNIQUE NOT NULL,
  min_penalty NUMERIC,
  max_penalty NUMERIC,
  unit_type TEXT,
  statutory_limit BOOLEAN DEFAULT false,
  notes TEXT,
  effective_date DATE NOT NULL,
  citation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dot_penalty_category ON dot_penalty_schedule(violation_category);

CREATE TABLE csa_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  basic_code TEXT UNIQUE NOT NULL,
  basic_name TEXT NOT NULL,
  description TEXT NOT NULL,
  severity_ratings JSONB DEFAULT '[]',
  intervention_thresholds JSONB DEFAULT '[]',
  carrier_type TEXT[],
  citation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key TEXT,
  tool_name TEXT NOT NULL,
  query TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  response_time_ms INTEGER
);

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
    s.standard_number, s.title, s.part, s.scope, s.plain_summary,
    s.key_requirements, s.ecfr_url,
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

ALTER TABLE dot_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE hos_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE hazmat_classifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE violation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dot_penalty_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE csa_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY anon_read_dot_standards ON dot_standards FOR SELECT USING (true);
CREATE POLICY anon_read_hos ON hos_rules FOR SELECT USING (true);
CREATE POLICY anon_read_hazmat ON hazmat_classifications FOR SELECT USING (true);
CREATE POLICY anon_read_violations ON violation_codes FOR SELECT USING (true);
CREATE POLICY anon_read_dot_penalty ON dot_penalty_schedule FOR SELECT USING (true);
CREATE POLICY anon_read_csa ON csa_categories FOR SELECT USING (true);
CREATE POLICY anon_insert_usage ON api_usage FOR INSERT WITH CHECK (true);
CREATE POLICY anon_insert_dot_standards ON dot_standards FOR INSERT WITH CHECK (true);
CREATE POLICY anon_insert_hos ON hos_rules FOR INSERT WITH CHECK (true);
CREATE POLICY anon_insert_hazmat ON hazmat_classifications FOR INSERT WITH CHECK (true);
CREATE POLICY anon_insert_violations ON violation_codes FOR INSERT WITH CHECK (true);
CREATE POLICY anon_insert_dot_penalty ON dot_penalty_schedule FOR INSERT WITH CHECK (true);
CREATE POLICY anon_insert_csa ON csa_categories FOR INSERT WITH CHECK (true);

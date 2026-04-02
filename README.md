# DOT/FMCSA Compliance MCP Server

An MCP server that makes DOT/FMCSA trucking regulations queryable by AI agents. Covers **49 CFR Parts 350-399** (FMCSA), **Hazardous Materials (49 CFR 100-185)**, **Hours of Service**, and **CSA BASIC categories**.

**Owner:** DANZUS Holdings LLC

## Tools

| Tool | Description |
|------|-------------|
| `lookup_dot_standard` | Search 49 CFR standards by topic, keyword, or section number |
| `get_hos_rules` | Hours of Service rules for property, passenger, and hazmat carriers |
| `get_violation_info` | FMCSA violation codes, severity weights, BASIC categories |
| `get_dot_penalties` | Current DOT penalty amounts by violation category |
| `get_hazmat_info` | Hazmat classifications, labeling, placarding, training requirements |
| `check_csa_basic` | CSA BASIC categories, intervention thresholds, severity ratings |

## Setup

### 1. Create Supabase Project

Create a new Supabase project at https://supabase.com/dashboard

### 2. Create Tables

**Option A — Paste SQL (recommended):**
```bash
cd ~/clawd/dot-mcp
npx tsx scripts/setup-db.ts --print
```
Copy the output, paste into Supabase SQL Editor, and run.

**Option B — Run directly (requires service role key):**
Set `SUPABASE_SERVICE_ROLE_KEY` in `.env`, then:
```bash
npx tsx scripts/setup-db.ts
```

### 3. Environment

```bash
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_ANON_KEY
# Add SUPABASE_SERVICE_ROLE_KEY if using setup-db.ts directly
```

### 4. Seed Data

```bash
npm install
npx tsx scripts/seed-penalties.ts   # FMCSA penalty schedule
npx tsx scripts/seed-hos.ts          # Hours of Service rules
npx tsx scripts/seed-csa.ts          # CSA BASIC categories + violation codes
npx tsx scripts/seed-hazmat.ts       # Hazmat classifications
```

### 5. Run Server

```bash
npm run build
npm start
```

## Data Sources

- **Penalty Schedule:** FMCSA Penalty Guidelines (January 2026 adjustment)
- **HOS Rules:** 49 CFR 395 (FMCSA Hours of Service)
- **CSA BASICs:** FMCSA Safety Measurement System (SMS)
- **Violation Codes:** FMCSA CSA Violation Table
- **Hazmat Classes:** 49 CFR Parts 100-185 (Hazardous Materials Regulations)

## Database Schema

Requires the following tables in Supabase:
- `dot_standards` — 49 CFR section text, summaries, keywords
- `hos_rules` — HOS rule definitions with citations
- `violation_codes` — FMCSA violation codes, severity weights
- `dot_penalty_schedule` — Penalty amounts by violation category
- `hazmat_classifications` — All 9 hazmat classes with requirements
- `csa_categories` — 7 CSA BASIC categories with thresholds
- `api_usage` — Tool usage tracking

## Disclaimer

This tool is for informational purposes only and does not constitute legal advice. Always verify requirements with official FMCSA/DOT sources at fmcsa.dot.gov.

## License

MIT — DANZUS Holdings LLC 2026

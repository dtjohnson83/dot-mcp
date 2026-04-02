/**
 * DOT/FMCSA MCP Server Database Setup
 *
 * Run this ONCE to create all tables in Supabase.
 *
 * Option 1: Paste SQL directly (recommended for first-time setup)
 *   - Copy the output of: npx tsx scripts/setup-db.ts --print
 *   - Paste into Supabase SQL Editor at: https://supabase.com/dashboard
 *
 * Option 2: Run directly (requires SUPABASE_SERVICE_ROLE_KEY in .env)
 *   - npx tsx scripts/setup-db.ts
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const sql = readFileSync(join(__dirname, "setup-db.sql"), "utf-8");

// If --print flag, just output the SQL
if (process.argv.includes("--print")) {
  console.log(sql);
  process.exit(0);
}

console.log("DOT/FMCSA Database Setup\n");
console.log("To create tables in Supabase, run:");
console.log("  npx tsx scripts/setup-db.ts --print");
console.log("\nThen paste the output into your Supabase SQL Editor:");
console.log("  https://supabase.com/dashboard → SQL Editor → New Query → Paste → Run\n");
console.log("Alternatively, set SUPABASE_SERVICE_ROLE_KEY in .env and run:");
console.log("  npx tsx scripts/setup-db.ts\n");

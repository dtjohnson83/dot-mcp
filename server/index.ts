/**
 * DOT/FMCSA Compliance MCP Server
 *
 * Exposes 6 tools for querying DOT/FMCSA safety regulations:
 * - lookup_dot_standard: Search 49 CFR standards by topic, keyword, or section number
 * - get_hos_rules: Hours of Service requirements for trucking operations
 * - get_violation_info: FMCSA violation codes, severity weights, and descriptions
 * - get_dot_penalties: Current DOT penalty schedule
 * - get_hazmat_info: Hazmat classification requirements
 * - check_csa_basic: CSA BASIC category information and intervention thresholds
 *
 * Covers: 49 CFR Parts 350-399 (FMCSA), 100-185 (Hazmat), HOS, CSA
 *
 * Owner: DANZUS Holdings LLC
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Note: Smithery configSchema requires SUPABASE_URL and SUPABASE_ANON_KEY.
// The server will fail at runtime if these are missing when tools are called.
const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseKey || "placeholder-key"
);

const DISCLAIMER = "\n\n---\n*This information is for reference only and does not constitute legal advice. Always verify requirements with official FMCSA/DOT sources at fmcsa.dot.gov. Regulations may have been amended since this data was last updated.*";

// ---- Usage tracking helper ----

async function trackUsage(toolName: string, query: string, responseTimeMs: number) {
  try {
    await supabase.from("api_usage").insert({
      tool_name: toolName,
      query: query.slice(0, 500),
      response_time_ms: responseTimeMs
    });
  } catch {
    // Non-critical
  }
}

// ---- Server setup ----

const server = new McpServer({
  name: "dot-compliance",
  version: "1.0.0",
});

// ============================================
// Tool 1: lookup_dot_standard
// ============================================

server.tool(
  "lookup_dot_standard",
  "Search DOT/FMCSA safety standards by topic, keyword, or section number (e.g., 'hours of service', '395.3', 'driver qualification', 'electronic logging device', 'pre-trip inspection'). Returns plain-English summaries with official citations. Covers 49 CFR Parts 350-399 and 100-185.",
  {
    query: z.string().describe("Search term: topic, keyword, or 49 CFR section number"),
    scope: z.enum([
      "fmcs", "hos", "hazmat", "csa", "driver", "vehicle",
      "accident", "drug_alcohol", "all"
    ]).optional().default("all").describe("Filter by regulation scope")
  },
  async ({ query, scope }) => {
    const start = Date.now();

    // Check if query looks like a section number (e.g., "395.3", "392.9A")
    const isSectionNumber = /^\d{3}\.?\d*/.test(query.trim());

    let results: any[] = [];

    if (isSectionNumber) {
      const cleanNum = query.trim().replace(/^(\d{3})\.(\d)/, "$1.$2");
      const { data, error } = await supabase
        .from("dot_standards")
        .select("standard_number, title, part, scope, plain_summary, key_requirements, violation_codes, ecfr_url")
        .like("standard_number", `${cleanNum}%`)
        .limit(5);

      if (!error && data && data.length > 0) results = data;
    }

    if (results.length === 0) {
      const { data, error } = await supabase.rpc("search_dot_standards", {
        search_query: query,
        scope_filter: scope !== "all" ? scope : null,
        result_limit: 5
      });

      if (!error && data) results = data;
    }

    await trackUsage("lookup_dot_standard", query, Date.now() - start);

    if (results.length === 0) {
      return {
        content: [{
          type: "text",
          text: `No DOT standards found matching "${query}". Try broader terms (e.g., 'inspection', 'logbook', 'brakes') or check the section format (e.g., 395.3, 392.9).${DISCLAIMER}`
        }]
      };
    }

    const formatted = results.map((s: any) => {
      const scopeLabel = s.scope?.replace(/_/g, " ").toUpperCase() || "DOT";
      const reqs = (s.key_requirements || []).map((r: string) => `  - ${r}`).join("\n");
      const violations = (s.violation_codes || []).map((v: string) => `  - ${v}`).join("\n");

      let response = `## ${s.standard_number} - ${s.title}\n`;
      response += `**Scope:** ${scopeLabel} | **Part:** ${s.part}\n\n`;
      response += `**Summary:** ${s.plain_summary || "Summary not yet generated."}\n\n`;
      response += `**Key Requirements:**\n${reqs || "  - Not yet parsed."}`;

      if (violations) {
        response += `\n\n**Common Violations:**\n${violations}`;
      }

      response += `\n\n**Official Source:** ${s.ecfr_url || `https://www.ecfr.gov/current/title-49/subtitle-B/chapter-III/part-${s.part}`}`;

      return response;
    }).join("\n\n---\n\n");

    return {
      content: [{
        type: "text",
        text: formatted + DISCLAIMER
      }]
    };
  }
);

// ============================================
// Tool 2: get_hos_rules
// ============================================

server.tool(
  "get_hos_rules",
  "Get Hours of Service (HOS) requirements for trucking operations. Covers property-carrying (trucking) and passenger-carrying vehicles, including driving time limits, duty time limits, off-duty requirements, and sleeper berth provisions. Example: 'What are the HOS rules for a property carrier driving in the US?'",
  {
    carrier_type: z.enum(["property", "passenger", "hazmat", "all"])
      .optional().default("all")
      .describe("Type of carrier operation"),
    rule_type: z.enum([
      "driving_time", "duty_time", "off_duty", "sleeper", "all"
    ]).optional().default("all")
      .describe("Specific type of HOS rule to look up")
  },
  async ({ carrier_type, rule_type }) => {
    const start = Date.now();

    let query = supabase.from("hos_rules").select("*");

    if (carrier_type !== "all") {
      query = query.eq("category", carrier_type);
    }
    if (rule_type !== "all") {
      query = query.eq("rule_type", rule_type);
    }

    const { data, error } = await query.order("rule_type");

    await trackUsage("get_hos_rules", `${carrier_type}/${rule_type}`, Date.now() - start);

    if (error || !data || data.length === 0) {
      return {
        content: [{
          type: "text",
          text: `HOS rules not available for the specified filters. Property carriers: 11-hour driving limit, 14-hour window. 30-minute break required after 8 hours. 60/70 hour limits. 34-hour restart available. Reference 49 CFR 395.3 for property carriers.${DISCLAIMER}`
        }]
      };
    }

    // Group by category
    const byCategory: Record<string, any[]> = {};
    for (const rule of data) {
      if (!byCategory[rule.category]) byCategory[rule.category] = [];
      byCategory[rule.category].push(rule);
    }

    let response = "## Hours of Service (HOS) Requirements\n\n";

    for (const [category, rules] of Object.entries(byCategory)) {
      const catLabel = category.charAt(0).toUpperCase() + category.slice(1);
      response += `### ${catLabel} Carriers\n\n`;

      for (const rule of rules) {
        let ruleText = `**${rule.title}** (${rule.rule_code})\n`;
        ruleText += `${rule.description}\n`;

        if (rule.max_hours) {
          ruleText += `**Maximum:** ${rule.max_hours} hour${rule.max_hours !== 1 ? "s" : ""}`;
          if (rule.window_hours) ruleText += ` within ${rule.window_hours} hours`;
          ruleText += "\n";
        }
        if (rule.min_hours) {
          ruleText += `**Minimum:** ${rule.min_hours} hours\n`;
        }
        ruleText += `**Citation:** ${rule.citation}\n\n`;
        response += ruleText;
      }
    }

    response += "---\n\n**Key Citations:** 49 CFR 395 (FMCSA) for property carriers, 49 CFR 395.1 for exceptions.\n";

    return {
      content: [{
        type: "text",
        text: response + DISCLAIMER
      }]
    };
  }
);

// ============================================
// Tool 3: get_violation_info
// ============================================

server.tool(
  "get_violation_info",
  "Look up FMCSA violation codes by code number or keyword. Returns violation descriptions, severity weights (1-10), BASIC area, and whether the violation is acute or critical. Example: 'What is violation 395.3A?' or 'Show me HOS violations'.",
  {
    code: z.string().optional().describe("Violation code (e.g., '395.3A', '395.8')"),
    basic_area: z.string().optional().describe("CSA BASIC area (e.g., 'HOS', 'DRF', 'BDD', 'VEH', 'MAC')"),
    severity_min: z.number().optional().describe("Minimum severity weight (1-10)")
  },
  async ({ code, basic_area, severity_min }) => {
    const start = Date.now();

    let query = supabase.from("violation_codes").select("*");

    if (code) {
      query = query.eq("violation_code", code);
    }
    if (basic_area) {
      query = query.ilike("basic_area", `%${basic_area}%`);
    }
    if (severity_min) {
      query = query.gte("severity_weight", severity_min);
    }

    const { data, error } = await query
      .order("severity_weight", { ascending: false })
      .limit(20);

    await trackUsage("get_violation_info", code || basic_area || "list", Date.now() - start);

    if (error || !data || data.length === 0) {
      return {
        content: [{
          type: "text",
          text: `No violation codes found. Try searching by BASIC area (HOS, DRF, BDD, VEH, MAC, SSR, VEO) or check the format (e.g., 395.3A, 392.2).${DISCLAIMER}`
        }]
      };
    }

    let response = "## FMCSA Violation Codes\n\n";

    for (const v of data) {
      const acute = v.acute_indicator ? " [ACUTE]" : "";
      const critical = v.critical_indicator ? " [CRITICAL]" : "";
      const severity = "⚫".repeat(v.severity_weight) + "⚪".repeat(10 - v.severity_weight);

      response += `### ${v.violation_code} - ${v.basic_area}${acute}${critical}\n`;
      response += `**Description:** ${v.description}\n`;
      response += `**Severity:** ${severity} (${v.severity_weight}/10)\n`;
      response += `**CSA Category:** ${v.csa_category}\n`;
      if (v.citation) response += `**Citation:** ${v.citation}\n`;
      response += "\n";
    }

    return {
      content: [{
        type: "text",
        text: response + DISCLAIMER
      }]
    };
  }
);

// ============================================
// Tool 4: get_dot_penalties
// ============================================

server.tool(
  "get_dot_penalties",
  "Get current DOT/FMCSA penalty amounts by violation category. Covers out-of-service orders, HOS violations, ELD violations, hazmat violations, and more. Penalties are adjusted periodically.",
  {
    category: z.string().optional()
      .describe("Violation category (e.g., 'hos', 'eld', 'hazmat', 'out_of_service') or 'all'")
  },
  async ({ category }) => {
    const start = Date.now();

    let query = supabase
      .from("dot_penalty_schedule")
      .select("*")
      .order("max_penalty", { ascending: false });

    if (category && category !== "all") {
      query = query.ilike("violation_category", `%${category}%`);
    }

    const { data, error } = await query;

    await trackUsage("get_dot_penalties", category || "all", Date.now() - start);

    if (error || !data || data.length === 0) {
      return {
        content: [{
          type: "text",
          text: `Penalty schedule not available. Visit https://www.fmcsa.dot.gov/safety/peoplescience/penalty-proceeds-guidelines for current amounts.${DISCLAIMER}`
        }]
      };
    }

    let response = "## DOT/FMCSA Penalty Schedule\n\n";

    for (const p of data) {
      const min = p.min_penalty ? `$${Number(p.min_penalty).toLocaleString()}` : "$0";
      const max = `$${Number(p.max_penalty).toLocaleString()}`;
      const unit = p.unit_type ? ` (${p.unit_type.replace(/_/g, " ")})` : " per violation";
      const statutory = p.statutory_limit ? " [Statutory Maximum]" : "";

      response += `### ${p.violation_category}${statutory}\n`;
      response += `**Range:** ${min} - ${max}${unit}\n`;
      if (p.citation) response += `**Citation:** ${p.citation}\n`;
      if (p.notes) response += `**Notes:** ${p.notes}\n`;
      response += `**Effective:** ${p.effective_date}\n\n`;
    }

    response += "**Penalty Adjustments:**\n";
    response += "  - Penalties may be adjusted for gravity of the violation\n";
    response += "  - Repeat violations typically result in higher penalties\n";
    response += "  - FMCSA may assess penalties at the statutory maximum for willful violations\n\n";
    response += "**Source:** https://www.fmcsa.dot.gov/safety/peoplescience/penalty-proceeds-guidelines";

    return {
      content: [{
        type: "text",
        text: response + DISCLAIMER
      }]
    };
  }
);

// ============================================
// Tool 5: get_hazmat_info
// ============================================

server.tool(
  "get_hazmat_info",
  "Look up hazardous materials (hazmat) classifications, shipping requirements, and regulations. Covers all 9 DOT hazmat classes, packing groups, marking/labeling/placarding requirements, and training obligations. Example: 'What are the requirements for shipping Class 3 flammable liquids?'",
  {
    class_number: z.string().optional()
      .describe("Hazmat class (1-9), or division for explosives (e.g., '1.1', '2.1', '3', '8')"),
    packing_group: z.enum(["I", "II", "III"]).optional()
      .describe("Packing group for certain hazmat classes")
  },
  async ({ class_number, packing_group }) => {
    const start = Date.now();

    let query = supabase.from("hazmat_classifications").select("*");

    if (class_number) {
      query = query.eq("class_number", class_number);
    }
    if (packing_group) {
      query = query.eq("packing_group", packing_group);
    }

    const { data, error } = await query.limit(10);

    await trackUsage("get_hazmat_info", class_number || "all", Date.now() - start);

    if (error || !data || data.length === 0) {
      return {
        content: [{
          type: "text",
          text: `No hazmat data found for class "${class_number}". The 9 DOT hazmat classes are: Class 1 (Explosives), Class 2 (Gases), Class 3 (Flammable Liquids), Class 4 (Flammable Solids), Class 5 (Oxidizers), Class 6 (Toxic), Class 7 (Radioactive), Class 8 (Corrosive), Class 9 (Miscellaneous). Reference 49 CFR 100-185.${DISCLAIMER}`
        }]
      };
    }

    let response = "## DOT Hazardous Materials Information\n\n";

    for (const h of data) {
      response += `### Class ${h.class_number}: ${h.class_name}\n`;
      if (h.division) response += `**Division:** ${h.division}\n`;
      if (h.packing_group) response += `**Packing Group:** ${h.packing_group}\n`;
      response += `**Description:** ${h.description}\n\n`;

      if (h.key_requirements && h.key_requirements.length > 0) {
        response += "**Key Requirements:**\n";
        for (const req of h.key_requirements) {
          response += `  - ${req}\n`;
        }
        response += "\n";
      }

      if (h.marking_requirements && h.marking_requirements.length > 0) {
        response += "**Marking Requirements:**\n";
        response += h.marking_requirements.map((m: string) => `  - ${m}`).join("\n") + "\n\n";
      }

      if (h.placard_requirements && h.placard_requirements.length > 0) {
        response += "**Placard Requirements:**\n";
        response += h.placard_requirements.map((p: string) => `  - ${p}`).join("\n") + "\n\n";
      }

      if (h.training_requirements) {
        response += `**Training Requirements:** ${h.training_requirements}\n`;
      }

      if (h.citation) response += `\n**Citation:** ${h.citation}\n`;
      response += "\n";
    }

    return {
      content: [{
        type: "text",
        text: response + DISCLAIMER
      }]
    };
  }
);

// ============================================
// Tool 6: check_csa_basic
// ============================================

server.tool(
  "check_csa_basic",
  "Get information about CSA (Compliance, Safety, Accountability) BASIC categories. Shows the 7 BASICs, their intervention thresholds, severity weights, and what behaviors they measure. Example: 'What are the HOS BASIC thresholds for a trucking company?'",
  {
    basic_code: z.string().optional()
      .describe("BASIC code: HOS, DRF, BDD, VEH, MAC, SSR, or VEO")
  },
  async ({ basic_code }) => {
    const start = Date.now();

    let query = supabase.from("csa_categories").select("*");

    if (basic_code) {
      query = query.eq("basic_code", basic_code.toUpperCase());
    }

    const { data, error } = await query;

    await trackUsage("check_csa_basic", basic_code || "all", Date.now() - start);

    if (error || !data || data.length === 0) {
      return {
        content: [{
          type: "text",
          text: `CSA BASIC "${basic_code}" not found. The 7 CSA BASICs are:\n  - HOS: Hours of Service\n  - DRF: Driver Fitness\n  - BDD: Traffic Controls / Unsafe Driving\n  - VEH: Vehicle Maintenance\n  - MAC: Controlled Substances / Alcohol\n  - SSR: Hazardous Materials (Safety Enforcement)\n  - VEO: Vehicle Financial Responsibility\n\nIntervention thresholds vary by BASIC and carrier size.${DISCLAIMER}`
        }]
      };
    }

    let response = "## CSA BASIC Categories\n\n";

    for (const b of data) {
      response += `### ${b.basic_code}: ${b.basic_name}\n`;
      response += `${b.description}\n\n`;

      if (b.severity_ratings && b.severity_ratings.length > 0) {
        response += "**Severity Ratings:**\n";
        response += b.severity_ratings.map((s: string) => `  - ${s}`).join("\n") + "\n\n";
      }

      if (b.intervention_thresholds && b.intervention_thresholds.length > 0) {
        response += "**Intervention Thresholds:**\n";
        response += b.intervention_thresholds.map((t: string) => `  - ${t}`).join("\n") + "\n\n";
      }

      if (b.carrier_type && b.carrier_type.length > 0) {
        response += `**Applies to:** ${b.carrier_type.join(", ")}\n`;
      }

      if (b.citation) response += `\n**Citation:** ${b.citation}\n`;
      response += "\n";
    }

    return {
      content: [{
        type: "text",
        text: response + DISCLAIMER
      }]
    };
  }
);

// ---- Start server ----

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Server failed to start:", err);
  process.exit(1);
});

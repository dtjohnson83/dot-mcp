// Purpose: Expose MCP endpoint at /api/mcp on Vercel

import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_ANON_KEY || "placeholder"
);

const DISCLAIMER =
  "\n\n---\n*Reference only. Verify at fmcsa.dot.gov.*";

// ============================================================
// MCP Protocol Handler (mirrors http-server.cjs logic)
// ============================================================
function handleMCPRequest(method: string, params: Record<string, unknown>) {
  switch (method) {
    case "initialize":
      return {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: { name: "dot-compliance-mcp", version: "1.0.0" },
      };
    case "tools/list":
      return { tools: TOOLS };
    case "tools/call":
      return handleToolCall(params.name as string, params.arguments as Record<string, unknown>);
    case "ping":
      return null;
    default:
      throw new Error("Unknown method: " + method);
  }
}

const TOOLS = [
  {
    name: "lookup_dot_standard",
    description:
      "Search DOT/FMCSA standards by topic, keyword, or section number (49 CFR).",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        scope: {
          type: "string",
          enum: ["fmcs", "hos", "hazmat", "csa", "driver", "vehicle", "accident", "drug_alcohol", "all"],
          default: "all",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_hos_rules",
    description: "Get Hours of Service rules for trucking operations.",
    inputSchema: {
      type: "object",
      properties: {
        carrier_type: { type: "string", enum: ["property", "passenger", "hazmat", "all"], default: "all" },
        rule_type: { type: "string", enum: ["driving_time", "duty_time", "off_duty", "sleeper", "all"], default: "all" },
      },
    },
  },
  {
    name: "get_violation_info",
    description: "Look up FMCSA violation codes and severity weights.",
    inputSchema: {
      type: "object",
      properties: {
        code: { type: "string" },
        basic_area: { type: "string" },
        severity_min: { type: "number" },
      },
    },
  },
  {
    name: "get_dot_penalties",
    description: "Get current DOT penalty amounts by violation category.",
    inputSchema: {
      type: "object",
      properties: { category: { type: "string" } },
    },
  },
  {
    name: "get_hazmat_info",
    description: "Get hazmat classifications and shipping requirements.",
    inputSchema: {
      type: "object",
      properties: { class_number: { type: "string" }, packing_group: { type: "string" } },
    },
  },
  {
    name: "check_csa_basic",
    description: "Get CSA BASIC category information and intervention thresholds.",
    inputSchema: {
      type: "object",
      properties: { basic_code: { type: "string" } },
    },
  },
];

// ============================================================
// Tool Implementations
// ============================================================
async function handleToolCall(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "lookup_dot_standard": return toolLookupStandard(args);
    case "get_hos_rules": return toolHOS(args);
    case "get_violation_info": return toolViolation(args);
    case "get_dot_penalties": return toolPenalty(args);
    case "get_hazmat_info": return toolHazmat(args);
    case "check_csa_basic": return toolCSA(args);
    default: throw new Error("Unknown tool: " + name);
  }
}

async function toolLookupStandard(args: Record<string, unknown>) {
  const { query, scope } = args as { query: string; scope?: string };
  const isSectionNumber = /^\d{3}\.?\d*/.test((query || "").trim());
  let results: unknown[] = [];

  if (isSectionNumber) {
    const cleanNum = (query || "").trim().replace(/^(\d{3})\.(\d)/, "$1.$2");
    const { data } = await supabase
      .from("dot_standards")
      .select("standard_number, title, part, scope, plain_summary, key_requirements, violation_codes, ecfr_url")
      .like("standard_number", cleanNum + "%")
      .limit(5);
    if (data) results = data;
  }

  if (results.length === 0) {
    const { data } = await supabase.rpc("search_dot_standards", {
      search_query: query,
      scope_filter: scope !== "all" ? scope : null,
      result_limit: 5,
    });
    if (data) results = data;
  }

  if (results.length === 0) {
    return {
      content: [
        {
          type: "text",
          text:
            'No DOT standards found for "' +
            query +
            '". Try broader terms or section format (e.g., 395.3, 392.9).' +
            DISCLAIMER,
        },
      ],
    };
  }

  const lines = (results as Array<Record<string, unknown>>)
    .map(function (s) {
      const reqs = ((s.key_requirements as string[]) || [])
        .map(function (r: string) { return "  - " + r; })
        .join("\n");
      return (
        "## " +
        s.standard_number +
        " - " +
        s.title +
        "\n**Part:** " +
        s.part +
        "\n**Scope:** " +
        (s.scope || "all") +
        "\n\n**Summary:** " +
        (s.plain_summary || "Not yet generated.") +
        "\n\n**Key Requirements:**\n" +
        (reqs || "  - Not yet parsed.") +
        "\n\n**Official Source:** " +
        (s.ecfr_url || "https://www.ecfr.gov/current/title-49")
      );
    })
    .join("\n\n---\n\n");

  return { content: [{ type: "text", text: lines + DISCLAIMER }] };
}

async function toolHOS(args: Record<string, unknown>) {
  const { carrier_type, rule_type } = args as { carrier_type?: string; rule_type?: string };
  let query = supabase.from("hos_rules").select("*");
  if (carrier_type !== "all") query = query.eq("category", carrier_type);
  if (rule_type !== "all") query = query.eq("rule_type", rule_type);
  const { data } = await query.order("rule_type");

  if (!data || data.length === 0) {
    return {
      content: [
        {
          type: "text",
          text:
            "No HOS rules found. Visit https://www.fmcsa.dot.gov/regulations/hours-service/summary-hours-service-regulations" +
            DISCLAIMER,
        },
      ],
    };
  }

  let response = "## Hours of Service Rules\n\n";
  for (const r of data) {
    const typeName = (r.rule_type || "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, function (c: string) { return c.toUpperCase(); });
    response += "### " + typeName + "\n";
    response += "**Category:** " + r.category + "\n";
    response += "**Limit:** " + (r.limit || "N/A") + "\n";
    response += "**Required Off-Duty:** " + (r.required_off_duty || "N/A") + "\n";
    if (r.notes) response += "**Notes:** " + r.notes + "\n";
    response += "\n";
  }
  response += "**Source:** https://www.fmcsa.dot.gov/regulations/hours-service";

  return { content: [{ type: "text", text: response + DISCLAIMER }] };
}

async function toolViolation(args: Record<string, unknown>) {
  const { code, basic_area, severity_min } = args as { code?: string; basic_area?: string; severity_min?: number };
  let query = supabase
    .from("violation_codes")
    .select("*")
    .order("severity_weight", { ascending: false })
    .limit(20);
  if (code) query = query.eq("violation_code", code);
  if (basic_area) query = query.ilike("basic_area", "%" + basic_area + "%");
  if (severity_min) query = query.gte("severity_weight", severity_min);
  const { data } = await query;

  if (!data || data.length === 0) {
    return {
      content: [
        {
          type: "text",
          text: "No violations found" + (code ? ' for code "' + code + '"' : "") + "." + DISCLAIMER,
        },
      ],
    };
  }

  let response = "## FMCSA Violation Codes\n\n";
  for (const v of data) {
    response += "### " + v.violation_code + "\n";
    response += "**Severity:** " + v.severity_weight + "/10  **BASIC:** " + v.basic_area + "\n";
    response += "**Type:** " + (v.acute_critical ? "Acute/Critical" : "Non-acute") + "\n";
    response += (v.description || "No description") + "\n\n";
  }
  response += "**Source:** https://csa.fmcsa.dot.gov";

  return { content: [{ type: "text", text: response + DISCLAIMER }] };
}

async function toolPenalty(args: Record<string, unknown>) {
  const { category } = args as { category?: string };
  let query = supabase
    .from("dot_penalty_schedule")
    .select("*")
    .order("max_penalty", { ascending: false });
  if (category && category !== "all")
    query = query.ilike("violation_category", "%" + category + "%");
  const { data } = await query;

  if (!data || data.length === 0) {
    return {
      content: [
        {
          type: "text",
          text:
            "Penalty data not available. Visit https://www.fmcsa.dot.gov/safety/peoplescience/penalty-proceeds-guidelines" +
            DISCLAIMER,
        },
      ],
    };
  }

  let response = "## DOT/FMCSA Penalty Schedule\n\n";
  for (const p of data) {
    response += "### " + p.violation_category + "\n";
    response +=
      "**Minimum:** " +
      (p.min_penalty ? "$" + Number(p.min_penalty).toLocaleString() : "$0") +
      "\n";
    response +=
      "**Maximum:** " + (p.max_penalty ? "$" + Number(p.max_penalty).toLocaleString() : "N/A") + "\n";
    if (p.notes) response += "**Notes:** " + p.notes + "\n";
    response += "\n";
  }
  response += "**Source:** https://www.fmcsa.dot.gov/safety/peoplescience/penalty-proceeds-guidelines";

  return { content: [{ type: "text", text: response + DISCLAIMER }] };
}

async function toolHazmat(args: Record<string, unknown>) {
  const { class_number, packing_group } = args as { class_number?: string; packing_group?: string };
  let query = supabase.from("hazmat_classifications").select("*").limit(10);
  if (class_number) query = query.eq("class_number", class_number);
  if (packing_group) query = query.eq("packing_group", packing_group);
  const { data } = await query;

  if (!data || data.length === 0) {
    return {
      content: [
        {
          type: "text",
          text:
            'No hazmat data for class "' +
            (class_number || "any") +
            '". The 9 classes: 1-Explosives, 2-Gases, 3-Flammable Liquids, 4-Flammable Solids, 5-Oxidizers, 6-Toxic, 7-Radioactive, 8-Corrosive, 9-Miscellaneous. Ref: 49 CFR 100-185.' +
            DISCLAIMER,
        },
      ],
    };
  }

  let response = "## Hazmat Classifications\n\n";
  for (const h of data) {
    response += "### Class " + h.class_number + (h.subclass ? " (" + h.subclass + ")" : "") + "\n";
    response += "**Proper Shipping Name:** " + (h.proper_shipping_name || "N/A") + "\n";
    response += "**Packing Group:** " + (h.packing_group || "N/A") + "\n";
    response += "**Label:** " + (h.required_label || "N/A") + "\n";
    if (h.notes) response += "**Notes:** " + h.notes + "\n";
    response += "\n";
  }
  response += "**Source:** https://www.phmsa.dot.gov/hazmat/phmsa-hazardous-materials-regulations";

  return { content: [{ type: "text", text: response + DISCLAIMER }] };
}

async function toolCSA(args: Record<string, unknown>) {
  const { basic_code } = args as { basic_code?: string };
  let query = supabase.from("csa_categories").select("*");
  if (basic_code) query = query.eq("basic_code", (basic_code || "").toUpperCase());
  const { data } = await query;

  if (!data || data.length === 0) {
    return {
      content: [
        {
          type: "text",
          text:
            'CSA BASIC "' + (basic_code || "?") + '" not found. The 7 BASICs: HOS, DRF, BDD, VEH, MAC, SSR, VEO.' +
            DISCLAIMER,
        },
      ],
    };
  }

  let response = "## CSA BASIC Categories\n\n";
  for (const c of data) {
    response += "### " + c.basic_code + ": " + c.basic_name + "\n";
    response += "**Description:** " + (c.description || "N/A") + "\n";
    response += "**Threshold:** " + (c.intervention_threshold || "N/A") + "\n";
    response += "**Severity Weights:** " + (c.severity_weights || "N/A") + "\n\n";
  }
  response += "**Source:** https://csa.fmcsa.dot.gov";

  return { content: [{ type: "text", text: response + DISCLAIMER }] };
}

// ============================================================
// Next.js Route Handlers
// ============================================================
export async function GET(request: NextRequest) {
  // CORS preflight / info endpoint
  const origin = request.headers.get("origin") || "*";
  return NextResponse.json(
    {
      name: "dot-compliance-mcp",
      version: "1.0.0",
      capabilities: { tools: { listChanged: false } },
    },
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, mcptools, mcpheaders, mcpprotocolversion",
        "Access-Control-Expose-Headers": "mcpheaders, mcptools, mcpprotocolversion",
      },
    }
  );
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin") || "*";

  let body: { id?: unknown; method?: string; params?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null },
      {
        status: 200,
        headers: { "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" },
      }
    );
  }

  const id = body.id;
  const method = body.method;
  const params = body.params || {};

  try {
    const result = await handleMCPRequest(method, params);
    return NextResponse.json(
      { jsonrpc: "2.0", id, result },
      {
        status: 200,
        headers: { "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { jsonrpc: "2.0", id, error: { code: -32603, message } },
      {
        status: 200,
        headers: { "Access-Control-Allow-Origin": origin, "Content-Type": "application/json" },
      }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin") || "*";
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, mcptools, mcpheaders, mcpprotocolversion",
      "Access-Control-Expose-Headers": "mcpheaders, mcptools, mcpprotocolversion",
    },
  });
}

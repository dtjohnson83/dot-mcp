/**
 * DOT/FMCSA Compliance MCP - Minimal HTTP Server
 * No external MCP SDK dependency.
 */
"use strict";

const http = require("http");
const url = require("url");
const { createClient } = require("@supabase/supabase-js");

const PORT = parseInt(process.env.PORT || "8080", 10);
const HOST = process.env.HOST || "0.0.0.0";

const supabase = createClient(
  process.env.SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_ANON_KEY || "placeholder"
);

const DISCLAIMER = "\n\n---\n*Reference only. Verify at fmcsa.dot.gov.*";

// ============================================================
// MCP Protocol Handler
// ============================================================
function handleMCPRequest(method, params) {
  switch (method) {
    case "initialize":
      return { protocolVersion: "2024-11-05", capabilities: { tools: {} }, serverInfo: { name: "dot-compliance-mcp", version: "1.0.0" } };
    case "tools/list":
      return { tools: TOOLS };
    case "tools/call":
      return handleToolCall(params.name, params.arguments);
    case "ping":
      return null;
    default:
      throw new Error("Unknown method: " + method);
  }
}

const TOOLS = [
  { name: "lookup_dot_standard", description: "Search DOT/FMCSA standards by topic, keyword, or section number (49 CFR).", inputSchema: { type: "object", properties: { query: { type: "string" }, scope: { type: "string", enum: ["fmcs", "hos", "hazmat", "csa", "driver", "vehicle", "accident", "drug_alcohol", "all"], default: "all" } }, required: ["query"] } },
  { name: "get_hos_rules", description: "Get Hours of Service rules for trucking operations.", inputSchema: { type: "object", properties: { carrier_type: { type: "string", enum: ["property", "passenger", "hazmat", "all"], default: "all" }, rule_type: { type: "string", enum: ["driving_time", "duty_time", "off_duty", "sleeper", "all"], default: "all" } } } },
  { name: "get_violation_info", description: "Look up FMCSA violation codes and severity weights.", inputSchema: { type: "object", properties: { code: { type: "string" }, basic_area: { type: "string" }, severity_min: { type: "number" } } } },
  { name: "get_dot_penalties", description: "Get current DOT penalty amounts by violation category.", inputSchema: { type: "object", properties: { category: { type: "string" } } } },
  { name: "get_hazmat_info", description: "Get hazmat classifications and shipping requirements.", inputSchema: { type: "object", properties: { class_number: { type: "string" }, packing_group: { type: "string" } } } },
  { name: "check_csa_basic", description: "Get CSA BASIC category information and intervention thresholds.", inputSchema: { type: "object", properties: { basic_code: { type: "string" } } } }
];

// ============================================================
// Tool Implementations
// ============================================================
async function handleToolCall(name, args) {
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

async function toolLookupStandard(args) {
  const { query, scope } = args;
  const isSectionNumber = /^\d{3}\.?\d*/.test(query.trim());
  let results = [];

  if (isSectionNumber) {
    const cleanNum = query.trim().replace(/^(\d{3})\.(\d)/, "$1.$2");
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
      result_limit: 5
    });
    if (data) results = data;
  }

  if (results.length === 0) {
    return { content: [{ type: "text", text: "No DOT standards found for \"" + query + "\". Try broader terms or section format (e.g., 395.3, 392.9)." + DISCLAIMER }] };
  }

  const lines = results.map(function(s) {
    const reqs = ((s.key_requirements) || []).map(function(r) { return "  - " + r; }).join("\n");
    return "## " + s.standard_number + " - " + s.title + "\n**Part:** " + s.part + "\n**Scope:** " + (s.scope || "all") + "\n\n**Summary:** " + (s.plain_summary || "Not yet generated.") + "\n\n**Key Requirements:**\n" + (reqs || "  - Not yet parsed.") + "\n\n**Official Source:** " + (s.ecfr_url || "https://www.ecfr.gov/current/title-49");
  }).join("\n\n---\n\n");

  return { content: [{ type: "text", text: lines + DISCLAIMER }] };
}

async function toolHOS(args) {
  const { carrier_type, rule_type } = args;
  let query = supabase.from("hos_rules").select("*");
  if (carrier_type !== "all") query = query.eq("category", carrier_type);
  if (rule_type !== "all") query = query.eq("rule_type", rule_type);
  const { data } = await query.order("rule_type");

  if (!data || data.length === 0) {
    return { content: [{ type: "text", text: "No HOS rules found. Visit https://www.fmcsa.dot.gov/regulations/hours-service/summary-hours-service-regulations" + DISCLAIMER }] };
  }

  let response = "## Hours of Service Rules\n\n";
  for (const r of data) {
    const typeName = (r.rule_type || "").replace(/_/g, " ").replace(/\b\w/g, function(c) { return c.toUpperCase(); });
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

async function toolViolation(args) {
  const { code, basic_area, severity_min } = args;
  let query = supabase.from("violation_codes").select("*").order("severity_weight", { ascending: false }).limit(20);
  if (code) query = query.eq("violation_code", code);
  if (basic_area) query = query.ilike("basic_area", "%" + basic_area + "%");
  if (severity_min) query = query.gte("severity_weight", severity_min);
  const { data } = await query;

  if (!data || data.length === 0) {
    return { content: [{ type: "text", text: "No violations found" + (code ? " for code \"" + code + "\"" : "") + "." + DISCLAIMER }] };
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

async function toolPenalty(args) {
  const { category } = args;
  let query = supabase.from("dot_penalty_schedule").select("*").order("max_penalty", { ascending: false });
  if (category && category !== "all") query = query.ilike("violation_category", "%" + category + "%");
  const { data } = await query;

  if (!data || data.length === 0) {
    return { content: [{ type: "text", text: "Penalty data not available. Visit https://www.fmcsa.dot.gov/safety/peoplescience/penalty-proceeds-guidelines" + DISCLAIMER }] };
  }

  let response = "## DOT/FMCSA Penalty Schedule\n\n";
  for (const p of data) {
    response += "### " + p.violation_category + "\n";
    response += "**Minimum:** " + (p.min_penalty ? "$" + Number(p.min_penalty).toLocaleString() : "$0") + "\n";
    response += "**Maximum:** " + (p.max_penalty ? "$" + Number(p.max_penalty).toLocaleString() : "N/A") + "\n";
    if (p.notes) response += "**Notes:** " + p.notes + "\n";
    response += "\n";
  }
  response += "**Source:** https://www.fmcsa.dot.gov/safety/peoplescience/penalty-proceeds-guidelines";

  return { content: [{ type: "text", text: response + DISCLAIMER }] };
}

async function toolHazmat(args) {
  const { class_number, packing_group } = args;
  let query = supabase.from("hazmat_classifications").select("*").limit(10);
  if (class_number) query = query.eq("class_number", class_number);
  if (packing_group) query = query.eq("packing_group", packing_group);
  const { data } = await query;

  if (!data || data.length === 0) {
    return { content: [{ type: "text", text: "No hazmat data for class \"" + (class_number || "any") + "\". The 9 classes: 1-Explosives, 2-Gases, 3-Flammable Liquids, 4-Flammable Solids, 5-Oxidizers, 6-Toxic, 7-Radioactive, 8-Corrosive, 9-Miscellaneous. Ref: 49 CFR 100-185." + DISCLAIMER }] };
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

async function toolCSA(args) {
  const { basic_code } = args;
  let query = supabase.from("csa_categories").select("*");
  if (basic_code) query = query.eq("basic_code", basic_code.toUpperCase());
  const { data } = await query;

  if (!data || data.length === 0) {
    return { content: [{ type: "text", text: "CSA BASIC \"" + (basic_code || "?") + "\" not found. The 7 BASICs: HOS, DRF, BDD, VEH, MAC, SSR, VEO." + DISCLAIMER }] };
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
// HTTP Server
// ============================================================
const server = http.createServer(async function(req, res) {
  const parsedUrl = url.parse(req.url, true);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, mcptools, mcpheaders, mcpprotocolversion",
      "Access-Control-Expose-Headers": "mcpheaders, mcptools, mcpprotocolversion",
    });
    res.end();
    return;
  }

  if (parsedUrl.pathname === "/health" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok" }));
    return;
  }

  if (parsedUrl.pathname === "/mcp" && req.method === "GET") {
    res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
    res.end(JSON.stringify({ name: "dot-compliance-mcp", version: "1.0.0", capabilities: { tools: { listChanged: false } } }));
    return;
  }

  if (parsedUrl.pathname === "/mcp" && req.method === "POST") {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString();

    let json;
    try { json = JSON.parse(body); } catch {
      res.writeHead(400, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null }));
      return;
    }

    const id = json.id;
    const method = json.method;
    const params = json.params || {};

    try {
      const result = await handleMCPRequest(method, params);
      res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      res.end(JSON.stringify({ jsonrpc: "2.0", id, result }));
    } catch (err) {
      res.writeHead(200, { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" });
      res.end(JSON.stringify({ jsonrpc: "2.0", id, error: { code: -32603, message: err.message } }));
    }
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

server.listen(PORT, HOST, function() {
  console.error("DOT/FMCSA MCP server running on port " + PORT);
});

server.on("error", function(err) {
  console.error("Server error:", err);
  process.exit(1);
});

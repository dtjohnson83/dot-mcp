export const metadata = { title: 'Docs - DOT/FMCSA Compliance API', description: 'Documentation.' }

export default function Docs() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '900px', margin: '0 auto', padding: '2rem', lineHeight: 1.6 }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Documentation</h1>
      <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '3rem' }}>DOT/FMCSA Compliance MCP server for AI agents and trucking software.</p>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Getting Started</h2>
      <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <pre style={{ background: '#1e1e1e', color: '#d4d4d4', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>smithery mcp add dtjohnson83/dot</pre>
      </div>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Tools</h2>

      {[
        { name: 'lookup_dot_standard', desc: 'Search 49 CFR standards by topic or section number.', params: 'query (string), scope (optional)' },
        { name: 'get_hos_rules', desc: 'Hours of Service requirements.', params: 'carrier_type (property|passenger|hazmat|all), rule_type (optional)' },
        { name: 'get_violation_info', desc: 'FMCSA violation codes with severity.', params: 'code (optional), basic_area (optional), severity_min (optional)' },
        { name: 'get_dot_penalties', desc: 'Current DOT penalty amounts.', params: 'category (optional)' },
        { name: 'get_hazmat_info', desc: 'Hazmat classifications and requirements.', params: 'class_number (optional), packing_group (optional)' },
        { name: 'check_csa_basic', desc: 'CSA BASIC categories and thresholds.', params: 'basic_code (optional)' },
      ].map(tool => (
        <div key={tool.name} style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{tool.name}</h3>
          <p style={{ color: '#666', marginBottom: '0.25rem', fontSize: '0.9rem' }}>{tool.desc}</p>
          <p style={{ color: '#999', fontSize: '0.85rem' }}>Params: {tool.params}</p>
        </div>
      ))}

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', marginTop: '3rem' }}>Data Sources</h2>
      <ul style={{ color: '#666' }}>
        <li>49 CFR Parts 350-399 (FMCSA Motor Carrier Safety Regulations)</li>
        <li>49 CFR Parts 100-185 (Hazardous Materials Regulations)</li>
        <li>FMCSA Safety Measurement System (SMS) for CSA BASICs</li>
        <li>FMCSA Penalty Guidelines (January 2026)</li>
      </ul>
      <p style={{ marginTop: '2rem', color: '#999', fontSize: '0.9rem' }}>* Not legal advice. Verify with fmcsa.dot.gov.</p>
    </main>
  )
}

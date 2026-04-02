export const metadata = { title: 'API Reference - DOT/FMCSA Compliance API', description: 'API reference.' }

const tools = [
  { name: 'lookup_dot_standard', params: [{ name: 'query', type: 'string', desc: 'Search term or 49 CFR section number' }, { name: 'scope', type: 'string', desc: 'fmcs|hos|hazmat|csa|driver|vehicle|accident|drug_alcohol|all' }] },
  { name: 'get_hos_rules', params: [{ name: 'carrier_type', type: 'string', desc: 'property|passenger|hazmat|all' }, { name: 'rule_type', type: 'string', desc: 'driving_time|duty_time|off_duty|sleeper|all' }] },
  { name: 'get_violation_info', params: [{ name: 'code', type: 'string', desc: 'e.g. 395.3A' }, { name: 'basic_area', type: 'string', desc: 'HOS|DRF|BDD|VEH|MAC|SSR|VEO' }, { name: 'severity_min', type: 'number', desc: '1-10' }] },
  { name: 'get_dot_penalties', params: [{ name: 'category', type: 'string', desc: 'hos|eld|hazmat|out_of_service|all' }] },
  { name: 'get_hazmat_info', params: [{ name: 'class_number', type: 'string', desc: '1-9 or divisions like 2.1, 4.3' }, { name: 'packing_group', type: 'string', desc: 'I|II|III' }] },
  { name: 'check_csa_basic', params: [{ name: 'basic_code', type: 'string', desc: 'HOS|DRF|BDD|VEH|MAC|SSR|VEO' }] },
]

export default function APIReference() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '900px', margin: '0 auto', padding: '2rem', lineHeight: 1.6 }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>API Reference</h1>
      <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '3rem' }}>Install via Smithery, query from any MCP-compatible AI agent.</p>

      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Tools</h2>
      {tools.map(tool => (
        <div key={tool.name} style={{ border: '1px solid #eee', borderRadius: '12px', padding: '1.5rem', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{tool.name}</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead><tr style={{ borderBottom: '1px solid #eee' }}><th style={{ textAlign: 'left', padding: '0.25rem 0' }}>Parameter</th><th style={{ textAlign: 'left', padding: '0.25rem 0' }}>Type</th><th style={{ textAlign: 'left', padding: '0.25rem 0' }}>Description</th></tr></thead>
            <tbody style={{ color: '#666' }}>{tool.params.map(p => <tr key={p.name}><td style={{ padding: '0.2rem 0' }}><code>{p.name}</code></td><td style={{ padding: '0.2rem 0' }}>{p.type}</td><td>{p.desc}</td></tr>)}</tbody>
          </table>
        </div>
      ))}
    </main>
  )
}

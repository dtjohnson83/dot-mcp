export const metadata = {
  title: 'DOT/FMCSA Compliance MCP',
  description: 'Query DOT/FMCSA trucking regulations with plain-English summaries. Built for AI agents and fleet management software.'
}

export default function Home() {
  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 2rem', lineHeight: 1.6 }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem', lineHeight: 1.1 }}>
        DOT/FMCSA regulations,<br />
        <span style={{ color: '#666' }}>plain-English answers.</span>
      </h1>
      
      <p style={{ fontSize: '1.25rem', color: '#444', marginBottom: '2rem', maxWidth: '600px' }}>
        Integrate DOT/FMCSA compliance lookups into your fleet management app, trucking software, or CSA monitoring tool.
      </p>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '4rem' }}>
        <a href="/docs" style={{ background: '#222', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '500' }}>Get Started</a>
        <a href="/pricing" style={{ background: '#fff', color: '#222', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', border: '1px solid #ccc', fontWeight: '500' }}>View Pricing</a>
      </div>

      <div style={{ background: '#f5f5f5', padding: '2rem', borderRadius: '12px', marginBottom: '4rem' }}>
        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontFamily: 'monospace' }}>Example request:</p>
        <pre style={{ margin: 0, fontSize: '0.9rem', background: '#1e1e1e', color: '#d4d4d4', padding: '1rem', borderRadius: '8px', overflow: 'auto' }}>
{`smithery mcp call get_hos_rules \\
  --arg carrier_type=property`}
        </pre>
        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', marginTop: '1rem', fontFamily: 'monospace' }}>Response:</p>
        <pre style={{ margin: 0, fontSize: '0.85rem', background: '#fff', padding: '1rem', borderRadius: '8px', overflow: 'auto', maxHeight: '200px' }}>
{`{
  "result": [
    {
      "rule_code": "HOS-PROP-11",
      "title": "11-Hour Driving Limit",
      "description": "A driver may drive a maximum
        of 11 hours after 10 consecutive hours
        off duty.",
      "citation": "49 CFR 395.3(a)(3)(i)"
    }
  ]
}`}
        </pre>
      </div>

      <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>What you get</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
        <div><h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>49 CFR Coverage</h3><p style={{ color: '#666', margin: 0 }}>Parts 350-399 (FMCSA), 100-185 (Hazmat).</p></div>
        <div><h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Hours of Service</h3><p style={{ color: '#666', margin: 0 }}>Property, passenger, hazmat rules.</p></div>
        <div><h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>CSA BASIC Scores</h3><p style={{ color: '#666', margin: 0 }}>All 7 BASIC categories.</p></div>
        <div><h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Hazmat Classes</h3><p style={{ color: '#666', margin: 0 }}>All 9 DOT hazmat classes.</p></div>
        <div><h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Violation Codes</h3><p style={{ color: '#666', margin: 0 }}>30+ codes with severity weights.</p></div>
        <div><h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Current Penalties</h3><p style={{ color: '#666', margin: 0 }}>Up-to-date DOT penalty amounts.</p></div>
      </div>

      <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Built for</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
        <div style={{ background: '#fafafa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}><h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Fleet Management</h3><p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>Keep drivers compliant with HOS lookups.</p></div>
        <div style={{ background: '#fafafa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}><h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>ELD Vendors</h3><p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>Add regulatory context to electronic logging.</p></div>
        <div style={{ background: '#fafafa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}><h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>CSA Monitoring</h3><p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>Track and improve CSA BASIC scores.</p></div>
        <div style={{ background: '#fafafa', padding: '1.5rem', borderRadius: '8px', border: '1px solid #eee' }}><h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Hazmat Carriers</h3><p style={{ color: '#666', fontSize: '0.9rem', margin: 0 }}>Classify shipments, verify training.</p></div>
      </div>

      <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '12px', marginBottom: '4rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Data included</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
          <div><strong>23</strong> penalty categories</div>
          <div><strong>11</strong> HOS rules</div>
          <div><strong>7</strong> CSA BASICs</div>
          <div><strong>30+</strong> violation codes</div>
          <div><strong>9</strong> hazmat classes</div>
        </div>
      </div>

      <div style={{ textAlign: 'center', padding: '3rem', background: '#222', borderRadius: '12px', color: '#fff' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#fff' }}>Start integrating</h2>
        <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>Free tier: 100 calls/month. No credit card required.</p>
        <a href="/docs" style={{ background: '#fff', color: '#222', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '500', display: 'inline-block' }}>Read the Docs</a>
      </div>
    </main>
  )
}

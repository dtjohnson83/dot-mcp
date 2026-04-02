export const metadata = { title: 'Pricing - DOT/FMCSA Compliance API', description: 'Simple pricing.' }

export default function Pricing() {
  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '900px', margin: '0 auto', padding: '2rem', lineHeight: 1.6 }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Pricing</h1>
      <p style={{ fontSize: '1.1rem', color: '#666', marginBottom: '3rem' }}>Straightforward. No surprise fees.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eee' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Free</h2>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>$0</p>
          <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem' }}><li>100 calls/month</li><li>All tools</li><li>Community support</li></ul>
        </div>
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '2px solid #222', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Growth</h2>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>$79<span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#666' }}>/month</span></p>
          <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem' }}><li>10,000 API calls/month</li><li>All tools</li><li>Email support</li></ul>
        </div>
        <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '12px', border: '1px solid #eee' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Business</h2>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>$299<span style={{ fontSize: '1rem', fontWeight: 'normal', color: '#666' }}>/month</span></p>
          <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem' }}><li>100,000 API calls/month</li><li>All tools</li><li>Priority support</li></ul>
        </div>
      </div>
      <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Pay-per-call</h3>
        <p><strong>$0.01 per API call</strong> — no subscription. Volume discounts for 1M+ calls/month.</p>
      </div>
      <div style={{ marginTop: '3rem', textAlign: 'center' }}>
        <a href="/docs" style={{ background: '#222', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', textDecoration: 'none', fontWeight: '500' }}>Read the Docs</a>
      </div>
    </main>
  )
}

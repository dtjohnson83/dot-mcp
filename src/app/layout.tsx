export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <header style={{ background: '#222', color: '#fff', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <a href="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem' }}>DOT/FMCSA Compliance API</a>
          <nav style={{ display: 'flex', gap: '1.5rem' }}>
            <a href="/docs" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem' }}>Docs</a>
            <a href="/api-reference" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem' }}>API Reference</a>
            <a href="/pricing" style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem' }}>Pricing</a>
          </nav>
        </header>
        {children}
        <footer style={{ background: '#f5f5f5', padding: '2rem', textAlign: 'center', fontSize: '0.85rem', color: '#666' }}>
          <p style={{ margin: '0 0 0.5rem 0' }}>DOT/FMCSA Compliance API — Built with plain-English summaries from official 49 CFR data.</p>
          <p style={{ margin: 0 }}>Data current as of April 2026. Not legal advice.</p>
        </footer>
      </body>
    </html>
  )
}

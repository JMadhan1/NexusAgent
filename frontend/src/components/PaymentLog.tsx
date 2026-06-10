export function PaymentLog({ payments }: { payments: any[] }) {
  return (
    <div style={{ background: 'rgba(10,12,20,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 16, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 14 }}>💰</span>
        <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.85rem' }}>x402 Payment Log</span>
        <span style={{ marginLeft: 'auto', color: '#f59e0b', fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>{payments.length} tx</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
        {payments.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: '8px 12px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12 }}>⚡</span>
              <span style={{ color: '#94a3b8', fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace' }}>{p.endpoint || p.agent || 'venice.ai'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: '#22c55e', fontSize: '0.72rem', fontWeight: 600, fontFamily: 'JetBrains Mono, monospace' }}>{p.amountUsdc?.toFixed(4)} USDC</span>
              <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 20, background: p.status === 'confirmed' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${p.status === 'confirmed' ? 'rgba(34,197,94,0.3)' : 'rgba(245,158,11,0.3)'}`, color: p.status === 'confirmed' ? '#22c55e' : '#f59e0b', fontWeight: 600 }}>
                {p.status || 'sent'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

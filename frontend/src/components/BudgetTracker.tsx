export function BudgetTracker({ totalBudget, spent, payments }: {
  totalBudget: number
  spent: number
  payments: any[]
}) {
  const percent = Math.min((spent / totalBudget) * 100, 100)
  const remaining = Math.max(totalBudget - spent, 0)
  const barColor = percent > 80 ? '#ef4444' : percent > 50 ? '#f59e0b' : '#22c55e'

  return (
    <div style={{ background: 'rgba(10,12,20,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 16, padding: 20, position: 'relative', overflow: 'hidden' }}>
      {/* Glow behind bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, width: `${percent}%`, height: '40%', background: `radial-gradient(ellipse at bottom, ${barColor}18, transparent)`, transition: 'width 0.5s ease', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>💎</span>
          <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.85rem' }}>USDC Budget</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'JetBrains Mono, monospace' }}>{payments.length} Venice calls</span>
          <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 4, background: `${barColor}18`, border: `1px solid ${barColor}44`, color: barColor, fontWeight: 700 }}>{percent.toFixed(1)}% used</span>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
        {[
          { label: 'SPENT', value: `${spent.toFixed(4)}`, unit: 'USDC', color: '#f59e0b' },
          { label: 'REMAINING', value: `${remaining.toFixed(4)}`, unit: 'USDC', color: '#22c55e' },
          { label: 'BUDGET', value: `${totalBudget}`, unit: 'USDC', color: '#6366f1' },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>
            <div style={{ fontSize: '0.58rem', color: '#475569', letterSpacing: '0.08em', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: s.color, fontFamily: 'JetBrains Mono, monospace' }}>{s.value}</div>
            <div style={{ fontSize: '0.6rem', color: '#334155' }}>{s.unit}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 99, height: 6, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.04)' }}>
        <div style={{ height: '100%', width: `${percent}%`, background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`, borderRadius: 99, boxShadow: `0 0 10px ${barColor}88`, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  )
}

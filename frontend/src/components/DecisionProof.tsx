type DecisionData = {
  decision_id?: string
  timestamp?: string
  analysis_summary?: {
    top_choice?: string
    strategy?: string
    decision_confidence?: number
    total_opportunities_analyzed?: number
  }
  decision_details?: {
    expected_apy?: number
    risk_adjusted_apy?: number
    action?: string
    target_protocol?: string
    expected_return_on_usdc?: { annual_return_usdc?: number; monthly_return_usdc?: number }
  }
  risk_profile?: {
    composite_risk_score?: number
    risk_severity?: string
    key_risks?: Array<{ type?: string; severity?: string }>
  }
  recommendation?: string
  on_chain_proof?: {
    decision_hash?: string
    estimated_cost_usdc?: number
    delegation_required?: boolean
  }
  alternatives_considered?: Array<{ protocol?: string; apy?: number; risk_adjusted_apy?: number }>
}

export function DecisionProof({ data }: { data: DecisionData }) {
  const summary = data.analysis_summary
  const details = data.decision_details
  const risk = data.risk_profile
  const proof = data.on_chain_proof
  const confPct = Math.round((summary?.decision_confidence ?? 0) * 100)
  const riskColor = risk?.risk_severity === 'Low' ? '#22c55e' : risk?.risk_severity === 'Medium' ? '#f59e0b' : '#ef4444'

  return (
    <div style={{ background: 'rgba(10,12,20,0.85)', backdropFilter: 'blur(24px)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 20, padding: 24, marginTop: 16, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 180, height: 180, background: 'radial-gradient(circle at top right, rgba(99,102,241,0.07), transparent 70%)', pointerEvents: 'none' }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <span style={{ fontSize: 18 }}>🧠</span>
        <span style={{ color: '#f8fafc', fontWeight: 800, fontSize: '0.95rem' }}>Decision Proof</span>
        {proof?.decision_hash && (
          <span style={{ marginLeft: 'auto', fontSize: '0.6rem', padding: '3px 10px', borderRadius: 6, background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e', fontWeight: 700 }}>✓ ON-CHAIN</span>
        )}
      </div>

      {/* Recommendation banner */}
      <div style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.08))', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 14, padding: '14px 18px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <div style={{ fontSize: '0.6rem', color: '#6366f1', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>RECOMMENDATION</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>{data.recommendation || '—'}</div>
          {summary?.strategy && <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 4 }}>{summary.strategy}</div>}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: '0.6rem', color: '#475569', marginBottom: 2 }}>TOP PICK</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1 }}>{summary?.top_choice || '—'}</div>
        </div>
      </div>

      {/* Metrics grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { label: 'APY', value: `${details?.expected_apy?.toFixed(2) ?? '—'}%`, color: '#22c55e' },
          { label: 'RISK-ADJ', value: `${details?.risk_adjusted_apy?.toFixed(2) ?? '—'}%`, color: '#6366f1' },
          { label: 'CONFIDENCE', value: `${confPct}%`, color: '#a855f7' },
          { label: 'RISK', value: risk?.composite_risk_score !== undefined ? (risk.composite_risk_score * 100).toFixed(0) + '%' : '—', color: riskColor },
        ].map(s => (
          <div key={s.label} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 10, padding: '10px 6px', textAlign: 'center' }}>
            <div style={{ fontSize: '0.55rem', color: '#334155', letterSpacing: '0.08em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, color: s.color, fontFamily: 'JetBrains Mono, monospace' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Confidence bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '0.62rem', color: '#475569', letterSpacing: '0.06em' }}>CONFIDENCE SCORE</span>
          <span style={{ fontSize: '0.7rem', color: '#a855f7', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace' }}>{confPct}%</span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 99, height: 5, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${confPct}%`, background: 'linear-gradient(90deg,#6366f1,#a855f7)', borderRadius: 99, boxShadow: '0 0 10px rgba(168,85,247,0.5)', transition: 'width 0.8s ease' }} />
        </div>
      </div>

      {/* Alternatives */}
      {data.alternatives_considered && data.alternatives_considered.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '0.62rem', color: '#334155', letterSpacing: '0.08em', marginBottom: 8 }}>ALTERNATIVES CONSIDERED</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {data.alternatives_considered.map((a, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 8, padding: '6px 12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ color: '#64748b', fontSize: '0.72rem' }}>{a.protocol}</span>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{ fontSize: '0.7rem', color: '#475569', fontFamily: 'JetBrains Mono, monospace' }}>APY {a.apy?.toFixed(2)}%</span>
                  <span style={{ fontSize: '0.7rem', color: '#334155', fontFamily: 'JetBrains Mono, monospace' }}>adj {a.risk_adjusted_apy?.toFixed(2)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* On-chain proof */}
      {proof?.decision_hash && (
        <div style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 12, padding: '12px 16px' }}>
          <div style={{ fontSize: '0.6rem', color: '#16a34a', letterSpacing: '0.08em', marginBottom: 6, fontWeight: 700 }}>ON-CHAIN PROOF HASH</div>
          <div style={{ fontSize: '0.68rem', color: '#22c55e', fontFamily: 'JetBrains Mono, monospace', wordBreak: 'break-all', lineHeight: 1.6 }}>{proof.decision_hash}</div>
          {proof.estimated_cost_usdc !== undefined && (
            <div style={{ marginTop: 8, fontSize: '0.65rem', color: '#475569' }}>
              Execution cost: <span style={{ color: '#f59e0b', fontWeight: 600 }}>{proof.estimated_cost_usdc} USDC</span> via x402 + 1Shot relayer
            </div>
          )}
        </div>
      )}
    </div>
  )
}

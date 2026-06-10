import { useState } from 'react'
import { useDelegation } from '../hooks/useDelegation'
import type { SmartAccountResult } from '../lib/smartAccount'
import type { DelegationResult } from '../lib/delegation'

const BUDGET_PRESETS = [1, 5, 10, 25]

export function DelegationSetup({ accountResult, onDelegated }: {
  accountResult: SmartAccountResult
  onDelegated: (delegation: DelegationResult) => void
}) {
  const [budget, setBudget] = useState(5)
  const { sign, loading, error } = useDelegation(accountResult)

  const handleSign = async () => {
    const result = await sign(budget)
    if (result) onDelegated(result)
  }

  return (
    <div style={{ background: 'rgba(8,10,18,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '28px', backdropFilter: 'blur(20px)', position: 'relative', overflow: 'hidden', animation: 'fadeSlideUp 0.4s ease forwards' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100px', height: '100px', background: 'radial-gradient(circle at top left, rgba(99,102,241,0.1), transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2))', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🔐</div>
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9' }}>ERC-7710 Delegation</div>
          <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>Sign once. Agent pays itself autonomously.</div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '0.6rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.25)', color: '#c084fc', fontWeight: 600 }}>STEP 2</div>
      </div>

      {/* Budget selector */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>USDC Budget Cap</div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
          {BUDGET_PRESETS.map(p => (
            <button key={p} onClick={() => setBudget(p)} style={{ padding: '6px 14px', borderRadius: '8px', border: `1px solid ${budget === p ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.06)'}`, background: budget === p ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.02)', color: budget === p ? '#f59e0b' : '#64748b', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'JetBrains Mono, monospace' }}>
              ${p}
            </button>
          ))}
          <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} min={1} max={1000} style={{ width: '70px', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: '#e2e8f0', fontSize: '0.78rem', outline: 'none', fontFamily: 'JetBrains Mono, monospace', textAlign: 'center' }} />
        </div>

        {/* Budget bar */}
        <div style={{ height: '4px', background: 'rgba(255,255,255,0.04)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(budget / 100 * 100, 100)}%`, background: 'linear-gradient(90deg, #6366f1, #f59e0b)', borderRadius: '2px', transition: 'width 0.3s ease' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.6rem', color: '#334155' }}>
          <span>$0</span><span style={{ color: '#f59e0b', fontWeight: 600 }}>${budget} USDC max</span><span>$1000</span>
        </div>
      </div>

      {/* Feature list */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '20px' }}>
        {[
          { icon: '⛓', text: 'Contract enforced', sub: 'ERC-7710 caveat enforcer' },
          { icon: '⛽', text: 'No ETH needed', sub: 'Gas paid in USDC' },
          { icon: '🤖', text: 'Sub-agent cascade', sub: '3 parallel AI agents' },
          { icon: '🔒', text: 'Revoke anytime', sub: 'Full custody retained' },
        ].map(f => (
          <div key={f.text} style={{ display: 'flex', gap: '10px', padding: '10px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '14px', flexShrink: 0 }}>{f.icon}</span>
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#cbd5e1' }}>{f.text}</div>
              <div style={{ fontSize: '0.65rem', color: '#334155', marginTop: '1px' }}>{f.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={handleSign} disabled={loading} className="btn-neon" style={{ width: '100%', padding: '15px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
        {loading ? (
          <>
            <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite' }}>◌</span>
            <span>Signing in MetaMask…</span>
          </>
        ) : (
          <>
            <span>🔐</span>
            <span>Sign ERC-7710 Delegation</span>
            <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', opacity: 0.7 }}>${budget} USDC</span>
          </>
        )}
      </button>

      {error && (
        <div style={{ marginTop: '14px', padding: '12px 16px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', fontSize: '0.78rem', color: '#f87171', display: 'flex', gap: '8px' }}>
          <span>⚠</span> {error}
        </div>
      )}
    </div>
  )
}

import type { DelegationResult } from '../lib/delegation'

type NodeStatus = 'pending' | 'active' | 'done'
type CascadeEvent = { type: string; message: string }
type Props = {
  delegationResult: DelegationResult | null
  cascadeEvents: CascadeEvent[]
  subAgentStatuses: Record<string, NodeStatus>
}

function shortAddr(addr: string) { return `${addr.slice(0, 6)}…${addr.slice(-4)}` }

const ROLES = [
  { key: 'researcher', label: 'Researcher', budget: '40%', color: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
  { key: 'analyst',    label: 'Analyst',    budget: '35%', color: '#a855f7', bg: 'rgba(168,85,247,0.08)' },
  { key: 'synthesizer',label: 'Synthesizer',budget: '25%', color: '#22c55e', bg: 'rgba(34,197,94,0.08)'  },
]

function StatusDot({ status }: { status: NodeStatus }) {
  const color = status === 'done' ? '#22c55e' : status === 'active' ? '#f59e0b' : '#475569'
  const anim = status === 'active' ? 'neon-pulse 1s ease-in-out infinite' : undefined
  return <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}`, animation: anim, flexShrink: 0 }} />
}

export function DelegationCascade({ delegationResult, cascadeEvents, subAgentStatuses }: Props) {
  if (!delegationResult) return null
  const { signedDelegation, delegatorAddress, delegationManager, budgetUsdc } = delegationResult

  return (
    <div style={{ background: 'rgba(10,12,20,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 16, padding: '16px', marginTop: 16 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 14 }}>🔗</span>
        <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em' }}>Delegation Cascade</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.65rem', padding: '2px 8px', borderRadius: 4, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', fontWeight: 600 }}>ERC-7710</span>
      </div>

      {/* User node */}
      <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>👤</span>
        <div>
          <div style={{ color: '#f59e0b', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em' }}>YOU · Smart Account</div>
          <div style={{ color: '#94a3b8', fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace' }}>{shortAddr(delegatorAddress)}</div>
          <div style={{ color: '#475569', fontSize: '0.65rem', marginTop: 2 }}>{budgetUsdc} USDC budget · EIP-7702</div>
        </div>
        <div style={{ marginLeft: 'auto', width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
      </div>

      {/* Arrow */}
      <div style={{ textAlign: 'center', color: '#f59e0b', fontSize: '1.1rem', margin: '6px 0', opacity: 0.7 }}>↓</div>

      {/* Orchestrator node */}
      <div style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 12, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>⚡</span>
        <div>
          <div style={{ color: '#a5b4fc', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em' }}>ORCHESTRATOR</div>
          <div style={{ color: '#94a3b8', fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace' }}>{shortAddr(signedDelegation.delegate)}</div>
          <div style={{ color: '#475569', fontSize: '0.65rem', marginTop: 2 }}>via {shortAddr(delegationManager)}</div>
        </div>
      </div>

      {/* Arrows to sub-agents */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 48, color: '#334155', fontSize: '1rem', margin: '6px 0' }}>
        <span>↓</span><span>↓</span><span>↓</span>
      </div>

      {/* Sub-agents */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {ROLES.map(r => {
          const status = subAgentStatuses[r.key] ?? 'pending'
          return (
            <div key={r.key} style={{ background: r.bg, border: `1px solid ${r.color}33`, borderRadius: 10, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                <StatusDot status={status} />
              </div>
              <div style={{ color: '#f8fafc', fontSize: '0.7rem', fontWeight: 700 }}>{r.label}</div>
              <div style={{ color: r.color, fontSize: '0.65rem', marginTop: 2, fontWeight: 600 }}>{r.budget} budget</div>
              <div style={{ color: '#475569', fontSize: '0.6rem', marginTop: 1 }}>via 1Shot</div>
            </div>
          )
        })}
      </div>

      {/* Live events */}
      {cascadeEvents.length > 0 && (
        <div style={{ marginTop: 12, maxHeight: 100, overflowY: 'auto', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 8 }}>
          {cascadeEvents.map((ev, i) => (
            <div key={i} style={{ fontSize: '0.65rem', color: '#64748b', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.6 }}>
              › {ev.message}
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 12, textAlign: 'center', fontSize: '0.6rem', color: '#334155', letterSpacing: '0.05em' }}>
        User → Orchestrator → Sub-agents · Enforcer: ERC20TransferAmount
      </div>
    </div>
  )
}

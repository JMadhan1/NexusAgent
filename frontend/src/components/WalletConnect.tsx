import { useSmartAccount } from '../hooks/useSmartAccount'
import type { SmartAccountResult } from '../lib/smartAccount'

export function WalletConnect({ onConnected }: { onConnected: (result: SmartAccountResult) => void }) {
  const { connect, loading, error, address } = useSmartAccount()

  const handleConnect = async () => {
    const result = await connect()
    if (result) onConnected(result)
  }

  return (
    <div style={{ background: 'rgba(8,10,18,0.9)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '28px', backdropFilter: 'blur(20px)', position: 'relative', overflow: 'hidden' }}>
      {/* Corner accent */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '80px', height: '80px', background: 'radial-gradient(circle at top right, rgba(245,158,11,0.12), transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(239,68,68,0.2))', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🦊</div>
        <div>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9', letterSpacing: '-0.01em' }}>Connect Smart Account</div>
          <div style={{ fontSize: '0.72rem', color: '#475569', marginTop: '2px' }}>MetaMask ERC-7702 Stateless Smart Account</div>
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '0.6rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', fontWeight: 600, letterSpacing: '0.05em' }}>STEP 1</div>
      </div>

      {address ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '14px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#22c55e' }}>Smart Account Active</div>
            <div style={{ fontSize: '0.7rem', fontFamily: 'JetBrains Mono, monospace', color: '#475569', marginTop: '2px' }}>{address.slice(0,10)}…{address.slice(-6)}</div>
          </div>
          <div style={{ marginLeft: 'auto', fontSize: '0.65rem', color: '#16a34a', background: 'rgba(34,197,94,0.1)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(34,197,94,0.2)' }}>ERC-7702 ✓</div>
        </div>
      ) : (
        <button onClick={handleConnect} disabled={loading} className="btn-neon" style={{ width: '100%', padding: '15px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          {loading ? (
            <>
              <span style={{ display: 'inline-block', animation: 'spin 0.8s linear infinite', fontSize: '16px' }}>◌</span>
              <span>Initializing Smart Account…</span>
            </>
          ) : (
            <>
              <span>🦊</span>
              <span>Connect MetaMask</span>
              <span style={{ fontSize: '0.7rem', opacity: 0.7, fontWeight: 500 }}>→</span>
            </>
          )}
        </button>
      )}

      {error && (
        <div style={{ marginTop: '14px', padding: '12px 16px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', fontSize: '0.78rem', color: '#f87171', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <span style={{ flexShrink: 0 }}>⚠</span> {error}
        </div>
      )}
    </div>
  )
}

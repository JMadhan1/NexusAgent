import { useState, useEffect } from 'react'
import { WalletConnect } from './components/WalletConnect'
import { DelegationSetup } from './components/DelegationSetup'
import { AgentConsole } from './components/AgentConsole'
import type { SmartAccountResult } from './lib/smartAccount'
import type { DelegationResult } from './lib/delegation'

type Step = 'connect' | 'delegate' | 'run'

const STEPS = [
  { key: 'connect' as Step, label: 'Connect', icon: '◈', desc: 'MetaMask Smart Account' },
  { key: 'delegate' as Step, label: 'Delegate', icon: '◉', desc: 'ERC-7710 Permission' },
  { key: 'run' as Step, label: 'Execute', icon: '◆', desc: 'AI Agent Pipeline' },
]

const STATS = [
  { label: 'Protocol', value: 'ERC-7710' },
  { label: 'Payment', value: 'x402' },
  { label: 'AI Model', value: 'Venice LLM' },
  { label: 'Relay', value: '1Shot API' },
]

export default function App() {
  const [step, setStep] = useState<Step>('connect')
  const [accountResult, setAccountResult] = useState<SmartAccountResult | null>(null)
  const [delegationResult, setDelegationResult] = useState<DelegationResult | null>(null)
  const [budget, setBudget] = useState(5)
  const [tick, setTick] = useState(0)

  const stepIndex = STEPS.findIndex(s => s.key === step)

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 80)
    return () => clearInterval(t)
  }, [])

  return (
    <div style={{ minHeight: '100vh', background: '#020408', color: '#e2e8f0', position: 'relative', overflow: 'hidden' }}>

      {/* Deep space background */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.15) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 100%, rgba(245,158,11,0.08) 0%, transparent 60%)' }} />

      {/* Animated grid */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        backgroundImage: `linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      {/* Diagonal accent line */}
      <div style={{ position: 'fixed', top: 0, right: '15%', width: '1px', height: '100vh', background: 'linear-gradient(180deg, transparent, rgba(245,158,11,0.15), transparent)', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: 0, left: '25%', width: '1px', height: '100vh', background: 'linear-gradient(180deg, transparent, rgba(99,102,241,0.1), transparent)', zIndex: 0 }} />

      {/* Top bar */}
      <div style={{ position: 'relative', zIndex: 10, borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '12px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(2,4,8,0.8)', backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 10px #f59e0b', animation: 'neon-pulse 2s ease-in-out infinite' }} />
          <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'linear-gradient(90deg, #f8fafc, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NexusAgent</span>
          <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', fontWeight: 600 }}>v1.0 LIVE</span>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
          {STATS.map(s => (
            <div key={s.label} style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.6rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', fontFamily: 'JetBrains Mono, monospace' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '780px', margin: '0 auto', padding: '60px 24px 80px' }}>

        {/* Hero section */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          {/* Animated logo mark */}
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '28px' }}>
            <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto' }}>
              {/* Outer ring */}
              <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(245,158,11,0.2)', animation: 'spin-slow 8s linear infinite' }} />
              <div style={{ position: 'absolute', inset: '8px', borderRadius: '50%', border: '1px solid rgba(99,102,241,0.3)', animation: 'spin-slow 5s linear infinite reverse' }} />
              {/* Core */}
              <div style={{ position: 'absolute', inset: '18px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', boxShadow: '0 0 40px rgba(245,158,11,0.5), 0 0 80px rgba(245,158,11,0.2)' }}>⚡</div>
              {/* Dots */}
              {[0,1,2,3,4,5].map(i => (
                <div key={i} style={{ position: 'absolute', width: '4px', height: '4px', borderRadius: '50%', background: i % 2 === 0 ? '#f59e0b' : '#6366f1', top: `${50 - 44 * Math.cos(i * Math.PI / 3)}%`, left: `${50 + 44 * Math.sin(i * Math.PI / 3)}%`, transform: 'translate(-50%,-50%)', opacity: 0.6 }} />
              ))}
            </div>
          </div>

          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '16px', letterSpacing: '-0.02em' }}>
            <span style={{ display: 'block', background: 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Autonomous</span>
            <span style={{ display: 'block', background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Agent</span>
            <span style={{ display: 'block', background: 'linear-gradient(135deg, #f8fafc 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Economy</span>
          </h1>

          <p style={{ color: '#64748b', fontSize: '1.05rem', maxWidth: '500px', margin: '0 auto 28px', lineHeight: 1.7 }}>
            The first AI that <span style={{ color: '#f59e0b', fontWeight: 600 }}>pays for its own intelligence</span> using delegated MetaMask Smart Accounts + ERC-7710 onchain permissions.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {[
              { label: '⚡ ERC-7710 Delegation', color: '#f59e0b' },
              { label: '🔗 x402 Micropayments', color: '#6366f1' },
              { label: '🤖 LangGraph Pipeline', color: '#a855f7' },
              { label: '🛡️ MetaMask Smart Accounts', color: '#22c55e' },
              { label: '🌊 Venice AI', color: '#06b6d4' },
            ].map(p => (
              <span key={p.label} style={{ fontSize: '0.72rem', fontWeight: 600, padding: '5px 12px', borderRadius: '20px', background: `rgba(${p.color === '#f59e0b' ? '245,158,11' : p.color === '#6366f1' ? '99,102,241' : p.color === '#a855f7' ? '168,85,247' : p.color === '#22c55e' ? '34,197,94' : '6,182,212'},0.1)`, border: `1px solid ${p.color}33`, color: p.color }}>
                {p.label}
              </span>
            ))}
          </div>
        </div>

        {/* Step pipeline */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', marginBottom: '48px', gap: 0 }}>
          {STEPS.map((s, i) => {
            const done = stepIndex > i
            const active = stepIndex === i
            return (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '100px' }}>
                  <div style={{ position: 'relative', width: '52px', height: '52px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? 'linear-gradient(135deg,#22c55e,#16a34a)' : active ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : 'rgba(255,255,255,0.04)', border: `2px solid ${done ? 'rgba(34,197,94,0.5)' : active ? 'rgba(245,158,11,0.6)' : 'rgba(255,255,255,0.08)'}`, boxShadow: active ? '0 0 30px rgba(245,158,11,0.4), inset 0 0 20px rgba(245,158,11,0.1)' : done ? '0 0 20px rgba(34,197,94,0.3)' : 'none', transition: 'all 0.4s ease', fontSize: '20px', color: done || active ? '#fff' : '#475569' }}>
                    {done ? '✓' : s.icon}
                    {active && <div style={{ position: 'absolute', inset: '-6px', borderRadius: '50%', border: '1px solid rgba(245,158,11,0.3)', animation: 'pulse-ring 1.5s ease-out infinite' }} />}
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: active ? '#f59e0b' : done ? '#22c55e' : '#475569' }}>{s.label}</div>
                    <div style={{ fontSize: '0.62rem', color: '#334155', marginTop: '2px' }}>{s.desc}</div>
                  </div>
                </div>
                {i < 2 && (
                  <div style={{ width: '80px', height: '1px', margin: '0 0 28px', background: done ? 'linear-gradient(90deg,#22c55e,#16a34a)' : 'rgba(255,255,255,0.06)', position: 'relative', overflow: 'hidden' }}>
                    {active && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.6), transparent)', animation: 'scan-line 1.5s ease-in-out infinite' }} />}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Main content cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <WalletConnect onConnected={result => { setAccountResult(result); setStep('delegate') }} />
          {step !== 'connect' && accountResult && (
            <DelegationSetup accountResult={accountResult} onDelegated={d => { setDelegationResult(d); setBudget(d.budgetUsdc); setStep('run') }} />
          )}
          {step === 'run' && delegationResult && (
            <AgentConsole delegationResult={delegationResult} budget={budget} />
          )}
        </div>

        {/* How it works */}
        {step === 'connect' && (
          <div style={{ marginTop: '48px', padding: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px' }}>
            <h3 style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#475569', marginBottom: '28px' }}>How It Works</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {[
                { step: '01', title: 'Delegate Once', desc: 'Sign an ERC-7710 delegation giving the agent a capped USDC budget. No ETH needed.', color: '#f59e0b' },
                { step: '02', title: 'Agent Reasons', desc: 'LangGraph pipeline — Planner → Orchestrator → 3 Sub-agents working in parallel.', color: '#6366f1' },
                { step: '03', title: 'Pays Itself', desc: 'Each Venice AI call triggers an x402 micropayment via 1Shot relayer. Fully autonomous.', color: '#22c55e' },
              ].map(item => (
                <div key={item.step} style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', border: `1px solid ${item.color}22` }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em', color: item.color, marginBottom: '8px', fontFamily: 'JetBrains Mono, monospace' }}>{item.step}</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '6px' }}>{item.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.6 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <div style={{ fontSize: '0.65rem', color: '#1e293b', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>MetaMask Smart Accounts Kit × 1Shot API × Venice AI Hackathon</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
            {['ERC-7710', 'ERC-7702', 'x402', 'LangGraph', 'Base Mainnet'].map(t => (
              <span key={t} style={{ fontSize: '0.6rem', color: '#1e293b', fontFamily: 'JetBrains Mono, monospace' }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

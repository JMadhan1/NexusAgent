import { useState } from 'react'
import { WalletConnect } from './components/WalletConnect'
import { DelegationSetup } from './components/DelegationSetup'
import { AgentConsole } from './components/AgentConsole'
import type { SmartAccountResult } from './lib/smartAccount'
import type { DelegationResult } from './lib/delegation'

type Step = 'connect' | 'delegate' | 'run'
const STEPS = [
  { key: 'connect' as Step, label: 'Connect', sub: 'MetaMask EIP-7702' },
  { key: 'delegate' as Step, label: 'Delegate', sub: 'ERC-7710 On-chain' },
  { key: 'run' as Step, label: 'Execute', sub: 'AI Agent Pipeline' },
]

const TICKER = ['ERC-7710 Delegation Active', 'Venice AI Powered', 'x402 Micropayments', 'Base Mainnet Live', '1Shot Relayer Ready', 'Zero ETH Gas', 'On-chain Enforced Budget']

export default function App() {
  const [step, setStep] = useState<Step>('connect')
  const [accountResult, setAccountResult] = useState<SmartAccountResult | null>(null)
  const [delegationResult, setDelegationResult] = useState<DelegationResult | null>(null)
  const [budget, setBudget] = useState(5)
  const stepIndex = STEPS.findIndex(s => s.key === step)

  return (
    <div style={{ minHeight: '100vh', background: '#03050a', color: '#e2e8f0', fontFamily: "'Inter', -apple-system, sans-serif", position: 'relative', overflowX: 'hidden' }}>

      {/* ── BACKGROUND LAYERS ── */}
      {/* Deep gradient */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse 120% 70% at 50% -20%, rgba(99,102,241,0.18) 0%, transparent 55%), radial-gradient(ellipse 80% 60% at 90% 110%, rgba(245,158,11,0.1) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 10% 80%, rgba(168,85,247,0.08) 0%, transparent 55%)' }} />
      {/* Fine grid */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: `linear-gradient(rgba(99,102,241,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.035) 1px, transparent 1px)`, backgroundSize: '48px 48px', pointerEvents: 'none' }} />
      {/* Animated orbs */}
      <div style={{ position: 'fixed', top: '10%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0, animation: 'float-orb 12s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '15%', right: '8%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0, animation: 'float-orb 16s ease-in-out infinite reverse', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', top: '50%', left: '50%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(168,85,247,0.04) 0%, transparent 70%)', filter: 'blur(80px)', zIndex: 0, transform: 'translate(-50%,-50%)', animation: 'float-orb 20s ease-in-out infinite', pointerEvents: 'none' }} />
      {/* Vertical light beams */}
      <div style={{ position: 'fixed', top: 0, left: '20%', width: 1, height: '100vh', background: 'linear-gradient(180deg, transparent 0%, rgba(99,102,241,0.12) 40%, transparent 100%)', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: 0, right: '18%', width: 1, height: '100vh', background: 'linear-gradient(180deg, transparent 0%, rgba(245,158,11,0.1) 50%, transparent 100%)', zIndex: 0 }} />

      {/* ── NAVBAR ── */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(3,5,10,0.85)', backdropFilter: 'blur(24px)', padding: '0 32px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg,#f59e0b,#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, boxShadow: '0 0 20px rgba(245,158,11,0.4)' }}>⚡</div>
          <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.01em', background: 'linear-gradient(90deg,#f8fafc,#94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>NexusAgent</span>
          <span style={{ fontSize: '0.6rem', padding: '2px 7px', borderRadius: 4, background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e', fontWeight: 700, letterSpacing: '0.06em' }}>v1.0 LIVE</span>
        </div>
        {/* Nav stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {[{ l:'PROTOCOL', v:'ERC-7710'}, {l:'PAYMENT', v:'x402'}, {l:'AI MODEL', v:'Venice LLM'}, {l:'RELAY', v:'1Shot API'}].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.55rem', color: '#334155', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.l}</div>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', fontFamily: 'monospace' }}>{s.v}</div>
            </div>
          ))}
          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e', animation: 'neon-pulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: '0.68rem', color: '#22c55e', fontWeight: 600 }}>Base Mainnet</span>
          </div>
        </div>
      </nav>

      {/* ── TICKER TAPE ── */}
      <div style={{ background: 'rgba(99,102,241,0.06)', borderBottom: '1px solid rgba(99,102,241,0.1)', padding: '6px 0', overflow: 'hidden', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', gap: 48, animation: 'ticker 25s linear infinite', whiteSpace: 'nowrap', width: 'max-content' }}>
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} style={{ fontSize: '0.65rem', color: '#475569', fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ color: '#6366f1', fontSize: 8 }}>◆</span> {t}
            </span>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto', padding: '0 24px 80px' }}>

        {/* ── HERO ── */}
        <div style={{ textAlign: 'center', padding: '80px 0 64px', position: 'relative' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 99, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: 32 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 8px #6366f1', animation: 'neon-pulse 1.5s ease-in-out infinite' }} />
            <span style={{ fontSize: '0.7rem', color: '#818cf8', fontWeight: 600, letterSpacing: '0.06em' }}>METAMASK AI AGENT HACKATHON 2025</span>
          </div>

          {/* Logo orb */}
          <div style={{ position: 'relative', width: 110, height: 110, margin: '0 auto 36px' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(245,158,11,0.15)', animation: 'spin-slow 10s linear infinite' }} />
            <div style={{ position: 'absolute', inset: 8, borderRadius: '50%', border: '1px dashed rgba(99,102,241,0.2)', animation: 'spin-slow 6s linear infinite reverse' }} />
            <div style={{ position: 'absolute', inset: 18, borderRadius: '50%', border: '1px solid rgba(168,85,247,0.15)', animation: 'spin-slow 14s linear infinite' }} />
            <div style={{ position: 'absolute', inset: '50%', transform: 'translate(-50%,-50%)', width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#f59e0b,#ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, boxShadow: '0 0 50px rgba(245,158,11,0.6), 0 0 100px rgba(245,158,11,0.2)' }}>⚡</div>
            {[0,1,2,3,4,5].map(i => (
              <div key={i} style={{ position: 'absolute', width: 5, height: 5, borderRadius: '50%', background: i%2===0?'#f59e0b':'#6366f1', top:`${50-47*Math.cos(i*Math.PI/3)}%`, left:`${50+47*Math.sin(i*Math.PI/3)}%`, transform:'translate(-50%,-50%)', boxShadow: `0 0 6px ${i%2===0?'#f59e0b':'#6366f1'}` }} />
            ))}
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(3rem,7vw,5.5rem)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: 20 }}>
            <span style={{ display: 'block', background: 'linear-gradient(135deg,#f8fafc 30%,#94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Autonomous</span>
            <span style={{ display: 'block', background: 'linear-gradient(135deg,#f59e0b 0%,#ef4444 40%,#a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', filter: 'drop-shadow(0 0 30px rgba(245,158,11,0.3))' }}>AI Agent</span>
            <span style={{ display: 'block', background: 'linear-gradient(135deg,#f8fafc 30%,#64748b 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Economy</span>
          </h1>

          <p style={{ color: '#475569', fontSize: '1.1rem', maxWidth: 520, margin: '0 auto 12px', lineHeight: 1.75 }}>
            The first AI that <span style={{ color: '#f59e0b', fontWeight: 700 }}>pays for its own intelligence</span> using delegated MetaMask Smart Accounts + ERC-7710 on-chain permissions.
          </p>
          <p style={{ color: '#334155', fontSize: '0.85rem', marginBottom: 36 }}>Sign once. Agent runs forever. Budget enforced by smart contract.</p>

          {/* Tech pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 48 }}>
            {[
              { t: '⚡ ERC-7710', c: '#f59e0b', rgb: '245,158,11' },
              { t: '🔐 EIP-7702', c: '#6366f1', rgb: '99,102,241' },
              { t: '� x402 Pay', c: '#a855f7', rgb: '168,85,247' },
              { t: '🤖 LangGraph', c: '#06b6d4', rgb: '6,182,212' },
              { t: '🦊 MetaMask', c: '#f97316', rgb: '249,115,22' },
              { t: '🌊 Venice AI', c: '#22c55e', rgb: '34,197,94' },
            ].map(p => (
              <span key={p.t} style={{ fontSize: '0.72rem', fontWeight: 600, padding: '6px 14px', borderRadius: 99, background: `rgba(${p.rgb},0.08)`, border: `1px solid rgba(${p.rgb},0.2)`, color: p.c, letterSpacing: '0.02em', backdropFilter: 'blur(10px)' }}>{p.t}</span>
            ))}
          </div>

          {/* Live stats row */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 2, marginBottom: 0 }}>
            {[
              { n: '4-Level', d: 'Delegation Depth' },
              { n: '$0.003', d: 'Per Venice Call' },
              { n: '3 Agents', d: 'Parallel Execution' },
              { n: '0 ETH', d: 'Gas Required' },
            ].map((s, i) => (
              <div key={s.d} style={{ flex: 1, padding: '14px 8px', background: i===0?'rgba(245,158,11,0.05)':i===1?'rgba(99,102,241,0.05)':i===2?'rgba(168,85,247,0.05)':'rgba(34,197,94,0.05)', border: `1px solid ${i===0?'rgba(245,158,11,0.1)':i===1?'rgba(99,102,241,0.1)':i===2?'rgba(168,85,247,0.1)':'rgba(34,197,94,0.1)'}`, borderRadius: i===0?'14px 0 0 14px':i===3?'0 14px 14px 0':'0', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, fontFamily: 'monospace', color: i===0?'#f59e0b':i===1?'#818cf8':i===2?'#c084fc':'#4ade80', lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: '0.6rem', color: '#334155', marginTop: 4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.d}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── STEP INDICATOR ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 40 }}>
          {STEPS.map((s, i) => {
            const done = stepIndex > i, active = stepIndex === i
            const col = done ? '#22c55e' : active ? '#f59e0b' : '#1e293b'
            return (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: done ? 'linear-gradient(135deg,#22c55e,#16a34a)' : active ? 'linear-gradient(135deg,#f59e0b,#ef4444)' : 'rgba(255,255,255,0.03)', border: `1.5px solid ${col}`, boxShadow: active ? `0 0 24px rgba(245,158,11,0.5)` : done ? `0 0 16px rgba(34,197,94,0.4)` : 'none', position: 'relative', transition: 'all 0.4s' }}>
                    <span style={{ fontSize: 18, color: done || active ? '#fff' : '#475569' }}>{done ? '✓' : i === 0 ? '🦊' : i === 1 ? '🔐' : '⚡'}</span>
                    {active && <div style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '1px solid rgba(245,158,11,0.25)', animation: 'pulse-ring 1.5s ease-out infinite' }} />}
                  </div>
                  <div style={{ textAlign: 'center', minWidth: 80 }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: active ? '#f59e0b' : done ? '#22c55e' : '#475569' }}>{s.label}</div>
                    <div style={{ fontSize: '0.58rem', color: '#1e293b', marginTop: 2 }}>{s.sub}</div>
                  </div>
                </div>
                {i < 2 && (
                  <div style={{ width: 100, height: 1, background: done ? 'linear-gradient(90deg,#22c55e,#16a34a)' : 'rgba(255,255,255,0.05)', margin: '0 4px 24px', position: 'relative', overflow: 'hidden' }}>
                    {active && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent,rgba(245,158,11,0.8),transparent)', animation: 'scan-line 1.5s ease-in-out infinite' }} />}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── APP CARDS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <WalletConnect onConnected={r => { setAccountResult(r); setStep('delegate') }} />
          {step !== 'connect' && accountResult && (
            <DelegationSetup accountResult={accountResult} onDelegated={d => { setDelegationResult(d); setBudget(d.budgetUsdc); setStep('run') }} />
          )}
          {step === 'run' && delegationResult && (
            <AgentConsole delegationResult={delegationResult} budget={budget} />
          )}
        </div>

        {/* ── HOW IT WORKS ── */}
        {step === 'connect' && (
          <div style={{ marginTop: 56 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#334155' }}>— How It Works —</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
              {[
                { n:'01', icon:'🔐', title:'Delegate Once', desc:'Sign an ERC-7710 delegation with a USDC budget cap. Smart contract enforced. No ETH needed.', c:'#f59e0b', rgb:'245,158,11' },
                { n:'02', icon:'🧠', title:'Agent Reasons', desc:'LangGraph orchestrates Planner → Researcher → Analyst → Synthesizer in parallel autonomously.', c:'#6366f1', rgb:'99,102,241' },
                { n:'03', icon:'💰', title:'Pays Itself', desc:'Each Venice AI call costs $0.003 USDC, paid automatically via x402 + 1Shot relayer. Zero approvals.', c:'#22c55e', rgb:'34,197,94' },
              ].map(item => (
                <div key={item.n} style={{ padding: '24px 20px', background: `rgba(${item.rgb},0.04)`, borderRadius: 16, border: `1px solid rgba(${item.rgb},0.12)`, position: 'relative', overflow: 'hidden', transition: 'transform 0.2s' }}>
                  <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at top right, rgba(${item.rgb},0.08), transparent 70%)`, pointerEvents: 'none' }} />
                  <div style={{ fontSize: '0.6rem', fontWeight: 800, color: item.c, letterSpacing: '0.12em', fontFamily: 'monospace', marginBottom: 10 }}>{item.n}</div>
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{item.icon}</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 8 }}>{item.title}</div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.65 }}>{item.desc}</div>
                </div>
              ))}
            </div>

            {/* Tech stack row */}
            <div style={{ marginTop: 40, padding: '20px 28px', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <span style={{ fontSize: '0.65rem', color: '#1e293b', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Powered by</span>
              {['MetaMask SDK', 'ERC-7710', 'EIP-7702', 'Venice AI', 'x402', '1Shot API', 'LangGraph', 'Base Mainnet'].map(t => (
                <span key={t} style={{ fontSize: '0.68rem', fontWeight: 600, color: '#334155', fontFamily: 'monospace', padding: '4px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.04)' }}>{t}</span>
              ))}
            </div>
          </div>
        )}

        {/* ── FOOTER ── */}
        <div style={{ textAlign: 'center', marginTop: 56, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }} />
            <span style={{ fontSize: '0.65rem', color: '#1e293b', letterSpacing: '0.12em', textTransform: 'uppercase' }}>MetaMask Smart Accounts × 1Shot API × Venice AI Hackathon</span>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 6px #6366f1' }} />
          </div>
          <div style={{ fontSize: '0.6rem', color: '#0f172a', fontFamily: 'monospace' }}>
            Built on Base Mainnet · ERC-7710 · EIP-7702 · x402 · LangGraph
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float-orb { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-30px) scale(1.05)} }
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes spin-slow { to{transform:rotate(360deg)} }
        @keyframes neon-pulse { 0%,100%{opacity:1;box-shadow:0 0 8px currentColor} 50%{opacity:0.6;box-shadow:0 0 16px currentColor} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(1.8);opacity:0} }
        @keyframes scan-line { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }
      `}</style>
    </div>
  )
}

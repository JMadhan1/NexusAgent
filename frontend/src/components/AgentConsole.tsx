import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Loader2 } from 'lucide-react'
import { PaymentLog } from './PaymentLog'
import { BudgetTracker } from './BudgetTracker'
import { ReportViewer } from './ReportViewer'
import { DelegationCascade } from './DelegationCascade'
import { DecisionProof } from './DecisionProof'
import type { DelegationResult } from '../lib/delegation'
import { serializeDelegation } from '../lib/delegation'

interface AgentEvent {
  type: 'thinking' | 'payment' | 'venice_call' | 'relay' | 'output' | 'cascade' | 'error' | 'done'
  message: string
  data?: any
  timestamp?: number
}

type NodeStatus = 'pending' | 'active' | 'done'

export function AgentConsole({ delegationResult, budget }: { delegationResult: DelegationResult; budget: number }) {
  const [goal, setGoal] = useState('')
  const [running, setRunning] = useState(false)
  const [events, setEvents] = useState<AgentEvent[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [totalSpent, setTotalSpent] = useState(0)
  const [report, setReport] = useState<string | null>(null)
  const [decisionData, setDecisionData] = useState<any | null>(null)
  const [cascadeEvents, setCascadeEvents] = useState<AgentEvent[]>([])
  const [subAgentStatuses, setSubAgentStatuses] = useState<Record<string, NodeStatus>>({})
  const feedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }, [events])

  const runAgent = async () => {
    if (!goal.trim() || running) return
    setRunning(true)
    setEvents([])
    setPayments([])
    setReport(null)
    setDecisionData(null)
    setCascadeEvents([])
    setSubAgentStatuses({})

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/agent/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal,
          rootDelegation: serializeDelegation(delegationResult.signedDelegation),
          delegator: delegationResult.delegatorAddress,
          delegationManager: delegationResult.delegationManager,
          enforcerAddress: delegationResult.enforcerAddress,
          usdcAddress: delegationResult.usdcAddress,
          chainId: delegationResult.chainId,
          budgetUsdc: budget,
        }),
      })

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(l => l.trim().startsWith('data: '))

        for (const line of lines) {
          try {
            const jsonStr = line.replace('data: ', '')
            const data = JSON.parse(jsonStr)
            const event: AgentEvent = { ...data, timestamp: Date.now() }
            setEvents(prev => [...prev, event])

            if (event.type === 'payment') {
              setPayments(prev => [...prev, event.data])
              setTotalSpent(prev => prev + (event.data?.amountUsdc || 0))
              const agent = event.data?.agent
              if (agent) setSubAgentStatuses(prev => ({ ...prev, [agent]: 'done' }))
            }

            if (event.type === 'cascade') {
              setCascadeEvents(prev => [...prev, event])
            }

            if (event.type === 'venice_call') {
              const match = event.message.match(/\[(\w+)\]/)
              if (match) setSubAgentStatuses(prev => ({ ...prev, [match[1]]: 'active' }))
            }

            if (event.type === 'done' && event.data?.report) {
              setReport(event.data.report)
            }
            if (event.type === 'output' && event.data?.on_chain_proof) {
              setDecisionData(event.data)
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    } catch (e: any) {
      setEvents(prev => [...prev, {
        type: 'error',
        message: e.message,
        timestamp: Date.now()
      }])
    } finally {
      setRunning(false)
    }
  }

  const EVENT_STYLES: Record<string, { color: string; icon: string }> = {
    thinking:    { color: '#6366f1', icon: '🧠' },
    payment:     { color: '#f59e0b', icon: '💰' },
    venice_call: { color: '#a855f7', icon: '🤖' },
    relay:       { color: '#22c55e', icon: '⚡' },
    output:      { color: '#f8fafc', icon: '📄' },
    cascade:     { color: '#06b6d4', icon: '🔗' },
    error:       { color: '#ef4444', icon: '❌' },
    done:        { color: '#22c55e', icon: '✅' },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Goal input */}
      <div style={{ background: 'rgba(10,12,20,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <Bot size={18} color="#f59e0b" />
          <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.9rem' }}>Agent Goal</span>
          {running && (
            <span style={{ marginLeft: 'auto', fontSize: '0.65rem', padding: '2px 10px', borderRadius: 20, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', fontWeight: 600 }}>
              ● RUNNING
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            value={goal}
            onChange={e => setGoal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && runAgent()}
            placeholder="e.g. Research AI code review tools and write a competitive analysis..."
            style={{ flex: 1, background: 'rgba(255,255,255,0.04)', color: '#e2e8f0', padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(99,102,241,0.2)', outline: 'none', fontSize: '0.875rem', fontFamily: 'inherit' }}
          />
          <button
            onClick={runAgent}
            disabled={running || !goal.trim()}
            style={{ background: running || !goal.trim() ? 'rgba(99,102,241,0.3)' : 'linear-gradient(135deg,#f59e0b,#ef4444)', border: 'none', borderRadius: 12, padding: '12px 18px', cursor: running || !goal.trim() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
          >
            {running ? <Loader2 size={16} color="#fff" style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={16} color="#fff" />}
          </button>
        </div>
      </div>

      {/* Delegation cascade */}
      <DelegationCascade
        delegationResult={delegationResult}
        cascadeEvents={cascadeEvents}
        subAgentStatuses={subAgentStatuses}
      />

      {/* Budget tracker */}
      {(running || totalSpent > 0) && (
        <BudgetTracker totalBudget={budget} spent={totalSpent} payments={payments} />
      )}

      {/* Live event feed */}
      {events.length > 0 && (
        <div style={{ background: 'rgba(10,12,20,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: 16, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: running ? '#f59e0b' : '#22c55e', boxShadow: `0 0 8px ${running ? '#f59e0b' : '#22c55e'}`, animation: running ? 'neon-pulse 1s ease-in-out infinite' : undefined }} />
            <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.85rem' }}>Agent Activity</span>
            <span style={{ marginLeft: 'auto', color: '#475569', fontSize: '0.65rem', fontFamily: 'JetBrains Mono, monospace' }}>{events.length} events</span>
          </div>
          <div ref={feedRef} style={{ height: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {events.map((event, i) => {
              const style = EVENT_STYLES[event.type] || { color: '#64748b', icon: '·' }
              return (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', padding: '3px 0', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                  <span style={{ fontSize: '0.75rem', flexShrink: 0, lineHeight: 1.6 }}>{style.icon}</span>
                  <span style={{ color: style.color, fontSize: '0.72rem', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.6, wordBreak: 'break-word' }}>{event.message}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Payment log */}
      {payments.length > 0 && <PaymentLog payments={payments} />}

      {/* Decision proof */}
      {decisionData && <DecisionProof data={decisionData} />}

      {/* Final report */}
      {report && <ReportViewer report={report} />}
    </div>
  )
}

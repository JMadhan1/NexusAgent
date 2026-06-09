import { useState, useRef, useEffect } from 'react'
import { Bot, Send, Loader2 } from 'lucide-react'
import { PaymentLog } from './PaymentLog'
import { BudgetTracker } from './BudgetTracker'
import { ReportViewer } from './ReportViewer'
import { DelegationCascade } from './DelegationCascade'
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

  const getEventColor = (type: AgentEvent['type']) => {
    const colors = {
      thinking: 'text-blue-400',
      payment: 'text-amber-400',
      venice_call: 'text-purple-400',
      relay: 'text-green-400',
      output: 'text-white',
      cascade: 'text-cyan-400',
      error: 'text-red-400',
      done: 'text-green-400',
    }
    return colors[type] || 'text-gray-400'
  }

  const getEventIcon = (type: AgentEvent['type']) => {
    const icons = {
      thinking: '🧠',
      payment: '�',
      venice_call: '🤖',
      relay: '⚡',
      output: '📄',
      cascade: '🔗',
      error: '❌',
      done: '✅',
    }
    return icons[type] || '•'
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-gray-900 rounded-2xl border border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="text-amber-400 w-5 h-5" />
          <h2 className="text-white font-bold">Agent Goal</h2>
        </div>
        <div className="flex gap-3">
          <input
            value={goal}
            onChange={e => setGoal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && runAgent()}
            placeholder="e.g. Research AI code review tools and write a competitive analysis..."
            className="flex-1 bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-amber-500 outline-none text-sm"
          />
          <button
            onClick={runAgent}
            disabled={running || !goal.trim()}
            className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold px-5 py-3 rounded-xl transition-all"
          >
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <DelegationCascade
        delegationResult={delegationResult}
        cascadeEvents={cascadeEvents}
        subAgentStatuses={subAgentStatuses}
      />

      {running || totalSpent > 0 ? (
        <BudgetTracker totalBudget={budget} spent={totalSpent} payments={payments} />
      ) : null}

      {events.length > 0 && (
        <div className="p-4 bg-gray-900 rounded-2xl border border-gray-700">
          <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${running ? 'bg-amber-400 animate-pulse' : 'bg-green-400'}`} />
            Agent Activity
          </h3>
          <div ref={feedRef} className="h-64 overflow-y-auto space-y-1 font-mono text-xs">
            {events.map((event, i) => (
              <div key={i} className={`flex gap-2 ${getEventColor(event.type)}`}>
                <span>{getEventIcon(event.type)}</span>
                <span>{event.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {payments.length > 0 && <PaymentLog payments={payments} />}

      {report && <ReportViewer report={report} />}
    </div>
  )
}

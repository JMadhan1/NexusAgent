import { ArrowDown, CheckCircle, Clock, Shield, Zap } from 'lucide-react'
import type { DelegationResult } from '../lib/delegation'

type NodeStatus = 'pending' | 'active' | 'done'

type CascadeEvent = {
  type: string
  message: string
}

type Props = {
  delegationResult: DelegationResult | null
  cascadeEvents: CascadeEvent[]
  subAgentStatuses: Record<string, NodeStatus>
}

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`
}

function StatusIcon({ status }: { status: NodeStatus }) {
  if (status === 'done') return <CheckCircle className="w-4 h-4 text-green-400" />
  if (status === 'active') return <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
  return <Clock className="w-4 h-4 text-gray-500" />
}

const ROLES = ['researcher', 'analyst', 'synthesizer'] as const
const ROLE_COLORS: Record<string, string> = {
  researcher: 'border-blue-500 bg-blue-950',
  analyst: 'border-purple-500 bg-purple-950',
  synthesizer: 'border-green-500 bg-green-950',
}
const ROLE_BUDGET: Record<string, string> = {
  researcher: '40%',
  analyst: '35%',
  synthesizer: '25%',
}

export function DelegationCascade({ delegationResult, cascadeEvents, subAgentStatuses }: Props) {
  if (!delegationResult) return null

  const { signedDelegation, delegatorAddress, delegationManager, budgetUsdc } = delegationResult

  return (
    <div className="p-4 bg-gray-900 rounded-2xl border border-gray-700 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <Shield className="text-amber-400 w-4 h-4" />
        <span className="text-white font-bold text-sm">Delegation Cascade</span>
        <span className="text-xs text-gray-500 ml-auto">ERC-7710 on-chain</span>
      </div>

      {/* Root node: User */}
      <div className="flex items-center gap-3 p-3 bg-amber-950 border border-amber-600 rounded-xl">
        <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
        <div className="min-w-0">
          <p className="text-amber-300 text-xs font-bold">YOU (Smart Account)</p>
          <p className="text-gray-400 font-mono text-xs truncate">{shortAddr(delegatorAddress)}</p>
          <p className="text-gray-500 text-xs">Budget: {budgetUsdc} USDC · EIP-7702 Stateless7702</p>
        </div>
      </div>

      <div className="flex justify-center">
        <ArrowDown className="text-amber-500 w-4 h-4" />
      </div>

      {/* Orchestrator node */}
      <div className="flex items-center gap-3 p-3 bg-gray-800 border border-gray-600 rounded-xl">
        <Zap className="w-4 h-4 text-amber-400 shrink-0" />
        <div className="min-w-0">
          <p className="text-white text-xs font-bold">Orchestrator</p>
          <p className="text-gray-400 font-mono text-xs truncate">
            {shortAddr(signedDelegation.delegate)}
          </p>
          <p className="text-gray-500 text-xs">
            DelegationManager: {shortAddr(delegationManager)}
          </p>
        </div>
      </div>

      <div className="flex justify-center gap-4">
        {ROLES.map(role => (
          <ArrowDown key={role} className="text-gray-600 w-4 h-4" />
        ))}
      </div>

      {/* Sub-agent nodes */}
      <div className="grid grid-cols-3 gap-2">
        {ROLES.map(role => {
          const status = subAgentStatuses[role] ?? 'pending'
          return (
            <div
              key={role}
              className={`p-2 border rounded-xl text-center ${ROLE_COLORS[role]} transition-all`}
            >
              <StatusIcon status={status} />
              <p className="text-white text-xs font-bold mt-1 capitalize">{role}</p>
              <p className="text-gray-400 text-xs">{ROLE_BUDGET[role]} budget</p>
              <p className="text-gray-500 text-xs">via 1Shot</p>
            </div>
          )
        })}
      </div>

      {/* Live cascade events */}
      {cascadeEvents.length > 0 && (
        <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
          {cascadeEvents.map((ev, i) => (
            <p key={i} className="text-xs text-gray-400 font-mono leading-tight">
              {ev.message}
            </p>
          ))}
        </div>
      )}

      <div className="text-xs text-gray-600 text-center pt-1">
        Authority chain: User → Orchestrator → Sub-agents · Enforcer: ERC20TransferAmount
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Shield, DollarSign, ArrowRight } from 'lucide-react'
import { useDelegation } from '../hooks/useDelegation'
import type { SmartAccountResult } from '../lib/smartAccount'
import type { DelegationResult } from '../lib/delegation'

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
    <div className="p-6 bg-gray-900 rounded-2xl border border-gray-700 space-y-5">
      <div className="flex items-center gap-2">
        <Shield className="text-amber-400 w-5 h-5" />
        <h2 className="text-white font-bold">Set Agent Budget</h2>
        <span className="text-xs text-gray-500 ml-auto">Sign once. Run forever.</span>
      </div>

      <div className="space-y-2">
        <label className="text-gray-400 text-xs">USDC Budget for Venice AI calls</label>
        <div className="flex items-center gap-3">
          <DollarSign className="text-green-400 w-4 h-4" />
          <input
            type="number"
            value={budget}
            onChange={e => setBudget(Number(e.target.value))}
            min={1}
            max={100}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-600 w-32 focus:border-amber-500 outline-none"
          />
          <span className="text-gray-400 text-sm">USDC max spend</span>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 space-y-2 text-xs text-gray-400">
        <p>✅ Agent can spend up to <span className="text-white font-bold">{budget} USDC</span> on Venice AI inference</p>
        <p>✅ Gas paid in USDC via 1Shot (no ETH required)</p>
        <p>✅ ERC-7710 scoped delegation — contract enforced, not trusted</p>
        <p>✅ You can revoke anytime from the dashboard</p>
      </div>

      <button
        onClick={handleSign}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-all"
      >
        {loading ? 'Signing...' : (
          <>Sign Delegation <ArrowRight className="w-4 h-4" /></>
        )}
      </button>

      {error && <p className="text-red-400 text-xs">{error}</p>}
    </div>
  )
}

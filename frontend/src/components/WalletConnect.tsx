import { useSmartAccount } from '../hooks/useSmartAccount'
import type { SmartAccountResult } from '../lib/smartAccount'
import { CheckCircle, Zap } from 'lucide-react'

export function WalletConnect({ onConnected }: { onConnected: (result: SmartAccountResult) => void }) {
  const { connect, loading, error, address } = useSmartAccount()

  const handleConnect = async () => {
    const result = await connect()
    if (result) onConnected(result)
  }

  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-gray-900 rounded-2xl border border-gray-700">
      <div className="flex items-center gap-3">
        <Zap className="text-amber-400 w-8 h-8" />
        <h1 className="text-2xl font-bold text-white">NexusAgent</h1>
      </div>
      <p className="text-gray-400 text-center text-sm max-w-xs">
        Autonomous AI that pays for its own intelligence using your delegated MetaMask Smart Account.
      </p>

      {address ? (
        <div className="flex items-center gap-2 text-green-400">
          <CheckCircle className="w-5 h-5" />
          <span className="font-mono text-xs">{address.slice(0,6)}...{address.slice(-4)}</span>
          <span className="text-xs text-gray-400">Smart Account Active</span>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={loading}
          className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold px-8 py-3 rounded-xl transition-all"
        >
          {loading ? 'Connecting...' : 'Connect MetaMask'}
        </button>
      )}

      {error && <p className="text-red-400 text-xs text-center">{error}</p>}
    </div>
  )
}

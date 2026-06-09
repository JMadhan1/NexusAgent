import { useState } from 'react'
import { WalletConnect } from './components/WalletConnect'
import { DelegationSetup } from './components/DelegationSetup'
import { AgentConsole } from './components/AgentConsole'
import type { SmartAccountResult } from './lib/smartAccount'
import type { DelegationResult } from './lib/delegation'
import { Zap } from 'lucide-react'

type Step = 'connect' | 'delegate' | 'run'

export default function App() {
  const [step, setStep] = useState<Step>('connect')
  const [accountResult, setAccountResult] = useState<SmartAccountResult | null>(null)
  const [delegationResult, setDelegationResult] = useState<DelegationResult | null>(null)
  const [budget, setBudget] = useState(5)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-2xl mx-auto py-12 px-4 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Zap className="text-amber-400 w-6 h-6" />
            <h1 className="text-3xl font-bold">NexusAgent</h1>
          </div>
          <p className="text-gray-400 text-sm">
            Autonomous AI that buys its own intelligence via x402 + ERC-7710
          </p>
          <div className="flex items-center justify-center gap-4 pt-2">
            {(['connect', 'delegate', 'run'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                  ${step === s ? 'bg-amber-500 text-black' :
                    (['connect','delegate','run'] as Step[]).indexOf(step) > i ? 'bg-green-500 text-black' : 'bg-gray-700 text-gray-400'
                  }`}>
                  {i + 1}
                </div>
                <span className="text-xs text-gray-400 capitalize">{s}</span>
                {i < 2 && <span className="text-gray-700">→</span>}
              </div>
            ))}
          </div>
        </div>

        <WalletConnect onConnected={result => {
          setAccountResult(result)
          setStep('delegate')
        }} />

        {step !== 'connect' && accountResult && (
          <DelegationSetup
            accountResult={accountResult}
            onDelegated={d => {
              setDelegationResult(d)
              setBudget(d.budgetUsdc)
              setStep('run')
            }}
          />
        )}

        {step === 'run' && delegationResult && (
          <AgentConsole delegationResult={delegationResult} budget={budget} />
        )}

        <div className="text-center text-xs text-gray-600 space-y-1">
          <p>Built for MetaMask Smart Accounts Kit × 1Shot API × Venice AI Hackathon</p>
          <p>Powered by ERC-7710 · x402 · LangGraph · Venice AI</p>
        </div>
      </div>
    </div>
  )
}

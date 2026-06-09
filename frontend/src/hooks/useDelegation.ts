import { useState, useCallback } from 'react'
import { createAgentDelegation, serializeDelegation, type DelegationResult } from '../lib/delegation'
import type { SmartAccountResult } from '../lib/smartAccount'
import { api } from '../lib/api'

export function useDelegation(accountResult: SmartAccountResult | null) {
  const [delegationResult, setDelegationResult] = useState<DelegationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sign = useCallback(async (budgetUsdc: number) => {
    if (!accountResult) throw new Error('No smart account connected')
    setLoading(true)
    setError(null)
    try {
      // Get orchestrator address from backend
      const { agentAddress } = await api.getAgentAddress()

      const result = await createAgentDelegation(
        accountResult,
        budgetUsdc,
        agentAddress as `0x${string}`,
      )

      // Store delegation reference on backend
      await api.storeDelegation({
        encodedDelegation: JSON.stringify(serializeDelegation(result.signedDelegation)),
        delegatorAddress: result.delegatorAddress,
        delegationManager: result.delegationManager,
        budgetUsdc: result.budgetUsdc,
        userAddress: result.delegatorAddress,
      })

      setDelegationResult(result)
      return result
    } catch (e: any) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [accountResult])

  return { delegationResult, loading, error, sign }
}

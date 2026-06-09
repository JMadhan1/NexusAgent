import { useState, useCallback } from 'react'
import { createSmartAccount, type SmartAccountResult } from '../lib/smartAccount'

export function useSmartAccount() {
  const [accountResult, setAccountResult] = useState<SmartAccountResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connect = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (!window.ethereum) throw new Error('MetaMask not found. Install MetaMask.')
      // Request accounts first so MetaMask prompts the user
      await (window.ethereum as any).request({ method: 'eth_requestAccounts' })
      const result = await createSmartAccount()
      setAccountResult(result)
      return result
    } catch (e: any) {
      setError(e.message)
      throw e
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    accountResult,
    address: accountResult?.address ?? null,
    loading,
    error,
    connect,
  }
}

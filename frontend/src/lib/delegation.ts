import { parseUnits } from 'viem'
import {
  createDelegation,
  ROOT_AUTHORITY,
  ScopeType,
  type Delegation,
  type Caveat,
} from '@metamask/smart-accounts-kit'
import type { SmartAccountResult } from './smartAccount'

// USDC on Base mainnet
export const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913' as `0x${string}`

export type { Delegation, Caveat }

export type DelegationResult = {
  signedDelegation: Delegation
  delegatorAddress: `0x${string}`
  delegationManager: `0x${string}`
  enforcerAddress: `0x${string}`
  usdcAddress: `0x${string}`
  budgetUsdc: number
  chainId: string
}

export async function createAgentDelegation(
  accountResult: SmartAccountResult,
  budgetUsdc: number,
  agentAddress: `0x${string}`,
): Promise<DelegationResult> {
  const { smartAccount, environment } = accountResult
  const maxAmount = parseUnits(budgetUsdc.toString(), 6)

  const delegationManager = environment.DelegationManager as `0x${string}`
  const enforcerAddress = environment.caveatEnforcers
    ?.ERC20TransferAmountEnforcer as `0x${string}` ?? '0x0000000000000000000000000000000000000000'

  // New API: environment always required; parentDelegation=ROOT_AUTHORITY for root delegations
  const delegation = createDelegation({
    environment,
    from: smartAccount.address as `0x${string}`,
    to: agentAddress,
    parentDelegation: ROOT_AUTHORITY,
    scope: {
      type: ScopeType.Erc20TransferAmount,
      tokenAddress: USDC_ADDRESS,
      maxAmount,
    },
  })

  // Sign — triggers EIP-712 typed data popup in MetaMask
  const { signature: _unused, ...delegationToSign } = delegation
  const signature = await smartAccount.signDelegation({ delegation: delegationToSign })

  const signedDelegation: Delegation = { ...delegation, signature }

  return {
    signedDelegation,
    delegatorAddress: smartAccount.address as `0x${string}`,
    delegationManager,
    enforcerAddress,
    usdcAddress: USDC_ADDRESS,
    budgetUsdc,
    chainId: '8453',
  }
}

/** Serialize Delegation for JSON transport (Hex salt already a string, no conversion needed). */
export function serializeDelegation(d: Delegation): Record<string, unknown> {
  return {
    delegate: d.delegate,
    delegator: d.delegator,
    authority: d.authority,
    caveats: d.caveats.map(c => ({ enforcer: c.enforcer, terms: c.terms, args: c.args })),
    salt: d.salt,
    signature: d.signature,
  }
}

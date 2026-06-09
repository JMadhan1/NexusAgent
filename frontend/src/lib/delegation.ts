import { encodePacked, parseUnits } from 'viem'
import {
  createDelegation,
  createCaveat,
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

  const enforcerAddress = environment.caveatEnforcers
    .ERC20TransferAmountEnforcer as `0x${string}`
  const delegationManager = environment.DelegationManager as `0x${string}`

  // ERC20TransferAmountEnforcer terms: encodePacked(address token, uint256 maxAmount) = 52 bytes
  const terms = encodePacked(['address', 'uint256'], [USDC_ADDRESS, maxAmount])
  const caveat: Caveat = createCaveat(enforcerAddress, terms)

  // Create unsigned delegation (returned with signature: '0x')
  const delegation = createDelegation({
    environment,
    from: smartAccount.address as `0x${string}`,
    to: agentAddress,
    caveats: [caveat],
  })

  // Sign with MetaMask — triggers EIP-712 typed data popup in the browser
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

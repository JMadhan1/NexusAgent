import { parseUnits } from 'viem'
import type { SmartAccountResult } from './smartAccount'
import {
  createDelegation,
  ScopeType,
  type Delegation,
  type Caveat,
} from '@metamask/smart-accounts-kit'

// EIP-712 types for Delegation signing (from delegation-framework spec)
const DELEGATION_TYPES = {
  Caveat: [
    { name: 'enforcer', type: 'address' },
    { name: 'terms', type: 'bytes' },
    { name: 'args', type: 'bytes' },
  ],
  Delegation: [
    { name: 'delegate', type: 'address' },
    { name: 'delegator', type: 'address' },
    { name: 'authority', type: 'bytes32' },
    { name: 'caveats', type: 'Caveat[]' },
    { name: 'salt', type: 'bytes32' },
  ],
} as const

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
  const { smartAccount, environment, address } = accountResult
  const maxAmount = parseUnits(budgetUsdc.toString(), 6)

  const delegationManager = environment.DelegationManager as `0x${string}`
  const enforcerAddress = environment.caveatEnforcers
    ?.ERC20TransferAmountEnforcer as `0x${string}` ?? '0x0000000000000000000000000000000000000000'

  // Root delegation: scope-only (no parentDelegation/parentPermissionContext)
  const delegation = createDelegation({
    environment,
    from: smartAccount.address as `0x${string}`,
    to: agentAddress,
    scope: {
      type: ScopeType.Erc20TransferAmount,
      tokenAddress: USDC_ADDRESS,
      maxAmount,
    },
  })

  // Sign via raw eth_signTypedData_v4 — bypasses MetaMask kit restriction on internal accounts
  const { signature: _unused, ...delegationToSign } = delegation
  const saltHex = ('0x' + (delegationToSign.salt as string).replace('0x', '').padStart(64, '0')) as `0x${string}`
  const authorityHex = ((delegationToSign.authority as string).length < 66
    ? (delegationToSign.authority as string).padEnd(66, '0')
    : delegationToSign.authority) as `0x${string}`

  const typedData = {
    types: {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      ...DELEGATION_TYPES,
    },
    primaryType: 'Delegation',
    domain: {
      name: 'DelegationManager',
      version: '1',
      chainId: 8453,
      verifyingContract: delegationManager,
    },
    message: {
      delegate: delegationToSign.delegate,
      delegator: delegationToSign.delegator,
      authority: authorityHex,
      caveats: delegationToSign.caveats.map((c: any) => ({
        enforcer: c.enforcer,
        terms: c.terms ?? '0x',
        args: c.args ?? '0x',
      })),
      salt: saltHex,
    },
  }

  const signature = await (window.ethereum as any).request({
    method: 'eth_signTypedData_v4',
    params: [address, JSON.stringify(typedData)],
  }) as `0x${string}`

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

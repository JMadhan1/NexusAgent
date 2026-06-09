import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
} from 'viem'
import { base } from 'viem/chains'
import {
  Implementation,
  toMetaMaskSmartAccount,
  getSmartAccountsEnvironment,
} from '@metamask/smart-accounts-kit'

const RPC_URL = import.meta.env.VITE_BASE_RPC_URL
  || import.meta.env.VITE_RPC_URL
  || 'https://mainnet.base.org'

export const publicClient = createPublicClient({
  chain: base,
  transport: http(RPC_URL),
})

export type SmartAccountEnv = ReturnType<typeof getSmartAccountsEnvironment>

export type SmartAccountResult = {
  smartAccount: Awaited<ReturnType<typeof toMetaMaskSmartAccount>>
  address: `0x${string}`
  environment: SmartAccountEnv
  walletClient: ReturnType<typeof createWalletClient>
}

export async function createSmartAccount(): Promise<SmartAccountResult> {
  if (!window.ethereum) throw new Error('MetaMask extension not found')

  const walletClient = createWalletClient({
    chain: base,
    transport: custom(window.ethereum),
  })

  const [address] = await walletClient.getAddresses()
  if (!address) throw new Error('No accounts found in MetaMask')

  const environment = getSmartAccountsEnvironment(base.id)

  // EIP-7702 Stateless smart account — no deployment needed.
  // MetaMask signs EIP-712 typed data for delegations via walletClient.
  const smartAccount = await toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Stateless7702,
    address,
    signer: { walletClient },
  })

  return { smartAccount, address, environment, walletClient }
}

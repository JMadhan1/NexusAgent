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

  // Request accounts
  const accounts = await (window.ethereum as any).request({ method: 'eth_requestAccounts' })
  if (!accounts || accounts.length === 0) throw new Error('No accounts found in MetaMask')

  // Switch to Base mainnet (chainId 0x2105 = 8453)
  try {
    await (window.ethereum as any).request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x2105' }],
    })
  } catch (switchError: any) {
    // Chain not added yet — add it
    if (switchError.code === 4902) {
      await (window.ethereum as any).request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x2105',
          chainName: 'Base',
          nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://mainnet.base.org'],
          blockExplorerUrls: ['https://basescan.org'],
        }],
      })
    }
    // ignore other errors (user may have already switched)
  }

  const address = accounts[0] as `0x${string}`

  const walletClient = createWalletClient({
    account: address,
    chain: base,
    transport: custom(window.ethereum),
  })

  const environment = getSmartAccountsEnvironment(base.id)

  const smartAccount = await toMetaMaskSmartAccount({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    client: publicClient as any,
    implementation: Implementation.Stateless7702,
    address,
    signer: { walletClient },
  })

  return { smartAccount, address, environment, walletClient }
}

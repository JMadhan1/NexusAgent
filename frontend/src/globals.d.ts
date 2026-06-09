interface Window {
  ethereum?: import('viem').EIP1193Provider & { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> }
}

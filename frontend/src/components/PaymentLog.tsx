export function PaymentLog({ payments }: { payments: any[] }) {
  return (
    <div className="p-4 bg-gray-900 rounded-2xl border border-gray-700">
      <h3 className="text-white font-bold text-sm mb-3">x402 Payment Log</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {payments.map((p, i) => (
          <div key={i} className="flex items-center justify-between text-xs bg-gray-800 rounded-lg px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-amber-400">💳</span>
              <span className="text-gray-300">{p.endpoint}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-green-400">{p.amountUsdc?.toFixed(4)} USDC</span>
              <span className="text-gray-500">Gas: 0 ETH</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${p.status === 'confirmed' ? 'bg-green-900 text-green-400' : 'bg-yellow-900 text-yellow-400'}`}>
                {p.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

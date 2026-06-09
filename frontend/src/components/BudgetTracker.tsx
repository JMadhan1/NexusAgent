export function BudgetTracker({ totalBudget, spent, payments }: {
  totalBudget: number
  spent: number
  payments: any[]
}) {
  const percent = Math.min((spent / totalBudget) * 100, 100)

  return (
    <div className="p-4 bg-gray-900 rounded-2xl border border-gray-700 space-y-3">
      <div className="flex justify-between items-center">
        <span className="text-white font-bold text-sm">USDC Budget</span>
        <span className="text-xs text-gray-400">{payments.length} Venice calls</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2">
        <div
          className="bg-amber-400 h-2 rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-amber-400">{spent.toFixed(4)} USDC spent</span>
        <span className="text-gray-500">{totalBudget} USDC budget</span>
      </div>
    </div>
  )
}

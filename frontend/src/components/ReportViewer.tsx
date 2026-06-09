import { FileText, Download } from 'lucide-react'

export function ReportViewer({ report }: { report: string }) {
  const handleDownload = () => {
    const blob = new Blob([report], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'nexusagent-report.md'
    a.click()
  }

  return (
    <div className="p-4 bg-gray-900 rounded-2xl border border-green-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="text-green-400 w-4 h-4" />
          <h3 className="text-white font-bold text-sm">Agent Report — Complete</h3>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <Download className="w-3 h-3" /> Download
        </button>
      </div>
      <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-300 max-h-96 overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed">
        {report}
      </div>
    </div>
  )
}

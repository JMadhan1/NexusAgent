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
    <div style={{ background: 'rgba(10,12,20,0.7)', backdropFilter: 'blur(20px)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 16, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FileText size={16} color="#22c55e" />
          <span style={{ color: '#f8fafc', fontWeight: 700, fontSize: '0.85rem' }}>Agent Report</span>
          <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 4, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e', fontWeight: 600 }}>COMPLETE</span>
        </div>
        <button onClick={handleDownload} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: '#64748b', background: 'none', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer' }}>
          <Download size={12} /> Export
        </button>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.02)', borderRadius: 10, padding: 16, fontSize: '0.8rem', color: '#94a3b8', maxHeight: 400, overflowY: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.8, border: '1px solid rgba(255,255,255,0.04)' }}>
        {report}
      </div>
    </div>
  )
}

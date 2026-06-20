'use client'

import { useState } from 'react'

export default function ExportButton({
  assignmentId,
  exported,
  memberName,
}: {
  assignmentId: string
  exported: boolean
  memberName: string
}) {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(exported)

  async function handleExport() {
    setLoading(true)
    const res = await fetch(`/api/admin/assignments/${assignmentId}/export`)
    if (!res.ok) {
      alert('Export failed.')
      setLoading(false)
      return
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${memberName.replace(/\s+/g, '_')}_assignment.xlsx`
    a.click()
    URL.revokeObjectURL(url)
    setDone(true)
    setLoading(false)
  }

  return (
    <div className="text-right space-y-1">
      <button
        onClick={handleExport}
        disabled={loading}
        className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Generating…' : '↓ Export to Excel'}
      </button>
      {done && <p className="text-xs text-green-600">✓ Previously exported</p>}
    </div>
  )
}

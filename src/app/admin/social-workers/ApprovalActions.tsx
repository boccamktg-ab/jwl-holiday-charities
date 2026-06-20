'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ApprovalActions({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function updateStatus(status: 'approved' | 'disabled') {
    setLoading(true)
    const res = await fetch('/api/admin/social-workers/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    if (!res.ok) {
      const json = await res.json()
      alert(json.error || 'Something went wrong.')
    }
    router.refresh()
    setLoading(false)
  }

  return (
    <div className="flex gap-2 shrink-0">
      <button
        onClick={() => updateStatus('approved')}
        disabled={loading}
        className="text-sm px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
      >
        Approve
      </button>
      <button
        onClick={() => updateStatus('disabled')}
        disabled={loading}
        className="text-sm px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
      >
        Reject
      </button>
    </div>
  )
}

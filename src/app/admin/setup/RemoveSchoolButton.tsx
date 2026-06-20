'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RemoveSchoolButton({ schoolId, schoolName }: { schoolId: string; schoolName: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleRemove() {
    if (!confirm(`Remove "${schoolName}"? This cannot be undone and will fail if any families are linked to this school.`)) return
    setLoading(true)
    const res = await fetch('/api/admin/setup', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'school', id: schoolId }),
    })
    if (!res.ok) {
      const json = await res.json()
      alert(json.error || 'Could not remove school — it may have families linked to it.')
    }
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleRemove}
      disabled={loading}
      className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50 ml-2"
    >
      remove
    </button>
  )
}

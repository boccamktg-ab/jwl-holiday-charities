'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SwSubmissionsToggle({ swId, enabled }: { swId: string; enabled: boolean }) {
  const router = useRouter()
  const [value, setValue] = useState(enabled)
  const [loading, setLoading] = useState(false)

  async function toggle() {
    setLoading(true)
    const next = !value
    await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ swId, submissionsEnabled: next }),
    })
    setValue(next)
    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-400">{value ? 'Submissions on' : 'Submissions off'}</span>
      <button
        onClick={toggle}
        disabled={loading}
        title={value ? 'Disable submissions for this SW' : 'Enable submissions for this SW'}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors disabled:opacity-50 ${value ? 'bg-green-500' : 'bg-gray-300'}`}
      >
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-1'}`} />
      </button>
    </div>
  )
}

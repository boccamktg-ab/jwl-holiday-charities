'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function IntakeCompleteButton({ intakeComplete }: { intakeComplete: boolean }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(intakeComplete)

  async function toggle() {
    if (done && !confirm('Mark intake as not complete?')) return
    setLoading(true)
    await fetch('/api/dashboard/intake-complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ complete: !done }),
    })
    setDone(d => !d)
    setLoading(false)
    router.refresh()
  }

  if (done) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
        <div>
          <p className="text-sm font-medium text-green-800">✓ Intake marked complete</p>
          <p className="text-xs text-green-600">JWL admin has been notified that all families are submitted.</p>
        </div>
        <button
          onClick={toggle}
          disabled={loading}
          className="text-xs text-green-600 hover:underline ml-4 shrink-0"
        >
          Undo
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-colors text-left"
    >
      <span className="font-medium">Mark intake complete</span>
      <span className="text-gray-400 ml-2">— notify JWL that all families have been submitted</span>
    </button>
  )
}

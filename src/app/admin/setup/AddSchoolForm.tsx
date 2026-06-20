'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddSchoolForm({ districtId }: { districtId: string }) {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/admin/setup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'school', name, districtId }),
    })
    setName('')
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-blue-600 hover:underline"
      >
        + Add school
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
      <input
        type="text"
        required
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="School name"
        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white text-sm px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? '…' : 'Add'}
      </button>
      <button
        type="button"
        onClick={() => setOpen(false)}
        className="text-sm text-gray-400 px-2"
      >
        ✕
      </button>
    </form>
  )
}

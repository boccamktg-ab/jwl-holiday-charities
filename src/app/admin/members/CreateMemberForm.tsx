'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateMemberForm() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', email: '', childrenRequested: '' })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        childrenRequested: form.childrenRequested ? Number(form.childrenRequested) : null,
      }),
    })
    setLoading(false)
    if (!res.ok) {
      const { error: msg } = await res.json()
      setError(msg ?? 'Something went wrong')
      return
    }
    setForm({ name: '', email: '', childrenRequested: '' })
    setOpen(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)}
        className="text-sm px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        + Add member
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 max-w-md">
      <h3 className="font-medium text-gray-800">Add JWL Member</h3>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
        <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
        <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Children requested (optional)</label>
        <input type="number" min={1} max={200} value={form.childrenRequested}
          onChange={e => setForm(f => ({ ...f, childrenRequested: e.target.value }))}
          className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <p className="text-xs text-gray-400">The member will use "Forgot password" at login to set their password.</p>
      <div className="flex gap-2">
        <button type="submit" disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50">
          {loading ? 'Creating…' : 'Create member'}
        </button>
        <button type="button" onClick={() => setOpen(false)}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">
          Cancel
        </button>
      </div>
    </form>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddChildForm({ familyId }: { familyId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    firstName: '', age: '', gender: '', giftRequests: '', topSize: '', bottomSize: '', shoeSize: '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.firstName.trim()) { setError('First name is required.'); return }
    setLoading(true)
    setError('')

    const res = await fetch('/api/children', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ familyId, ...form }),
    })
    const json = await res.json()

    if (!res.ok) {
      setError(json.error || 'Failed to add child.')
      setLoading(false)
      return
    }

    setForm({ firstName: '', age: '', gender: '', giftRequests: '', topSize: '', bottomSize: '', shoeSize: '' })
    setOpen(false)
    setLoading(false)
    router.refresh()
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full border-2 border-dashed border-gray-300 rounded-xl py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
      >
        + Add a child
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-gray-800">New child</h3>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-1">
          <label className="block text-xs font-medium text-gray-600 mb-1">First name *</label>
          <input
            type="text"
            required
            value={form.firstName}
            onChange={e => set('firstName', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Age</label>
          <input
            type="number"
            min={0}
            max={17}
            value={form.age}
            onChange={e => set('age', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
          <select
            value={form.gender}
            onChange={e => set('gender', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">—</option>
            <option value="boy">Boy</option>
            <option value="girl">Girl</option>
            <option value="nonbinary">Non-binary</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Gift requests</label>
        <textarea
          rows={3}
          value={form.giftRequests}
          onChange={e => set('giftRequests', e.target.value)}
          placeholder="What would this child like?"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Top size</label>
          <input
            type="text"
            value={form.topSize}
            onChange={e => set('topSize', e.target.value)}
            placeholder="e.g. 10/12"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Bottom size</label>
          <input
            type="text"
            value={form.bottomSize}
            onChange={e => set('bottomSize', e.target.value)}
            placeholder="e.g. 10/12"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Shoe size</label>
          <input
            type="text"
            value={form.shoeSize}
            onChange={e => set('shoeSize', e.target.value)}
            placeholder="e.g. 5Y"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save child'}
        </button>
        <button
          type="button"
          onClick={() => { setOpen(false); setError('') }}
          className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

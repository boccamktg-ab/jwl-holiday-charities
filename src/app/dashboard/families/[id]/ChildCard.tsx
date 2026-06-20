'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Child = {
  id: string
  first_name: string
  age: number | null
  gender: string | null
  gift_requests: string | null
  top_size: string | null
  bottom_size: string | null
  shoe_size: string | null
}

export default function ChildCard({ child, canEdit }: { child: Child; canEdit: boolean }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    firstName: child.first_name,
    age: child.age?.toString() ?? '',
    gender: child.gender ?? '',
    giftRequests: child.gift_requests ?? '',
    topSize: child.top_size ?? '',
    bottomSize: child.bottom_size ?? '',
    shoeSize: child.shoe_size ?? '',
  })

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await fetch('/api/children', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: child.id, ...form }),
    })
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!confirm(`Remove ${child.first_name}?`)) return
    setDeleting(true)
    await fetch('/api/children', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: child.id }),
    })
    router.refresh()
  }

  if (editing) {
    return (
      <form onSubmit={handleSave} className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
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
            rows={2}
            value={form.giftRequests}
            onChange={e => set('giftRequests', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {(['topSize', 'bottomSize', 'shoeSize'] as const).map((field, i) => (
            <div key={field}>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                {['Top size', 'Bottom size', 'Shoe size'][i]}
              </label>
              <input
                type="text"
                value={form[field]}
                onChange={e => set(field, e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="text-sm text-gray-500 px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
        </div>
      </form>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900">{child.first_name}</p>
            {(child.age || child.gender) && (
              <span className="text-xs text-gray-400">
                {[child.age ? `Age ${child.age}` : null, child.gender].filter(Boolean).join(' · ')}
              </span>
            )}
          </div>
          {child.gift_requests && (
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{child.gift_requests}</p>
          )}
          <div className="flex gap-4 text-xs text-gray-500">
            {child.top_size && <span>Top: {child.top_size}</span>}
            {child.bottom_size && <span>Bottom: {child.bottom_size}</span>}
            {child.shoe_size && <span>Shoes: {child.shoe_size}</span>}
            {!child.top_size && !child.bottom_size && !child.shoe_size && (
              <span className="text-gray-300">No sizes entered</span>
            )}
          </div>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-blue-500 hover:text-blue-700"
          >
            Edit
          </button>
          {canEdit && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

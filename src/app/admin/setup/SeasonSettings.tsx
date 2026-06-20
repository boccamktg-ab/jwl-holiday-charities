'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SeasonSettings({
  submissionsOpen,
  closedMessage,
}: {
  submissionsOpen: boolean
  closedMessage: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(submissionsOpen)
  const [message, setMessage] = useState(closedMessage)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function toggleSubmissions() {
    setLoading(true)
    const newValue = !open
    await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'submissions_open', value: String(newValue) }),
    })
    setOpen(newValue)
    setLoading(false)
    router.refresh()
  }

  async function saveMessage(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'submissions_closed_message', value: message }),
    })
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
      <h2 className="font-semibold text-gray-900">Season Settings</h2>

      {/* System-wide toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">Family submissions</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {open ? 'Social workers can currently add families and children.' : 'New family submissions are currently disabled.'}
          </p>
        </div>
        <button
          onClick={toggleSubmissions}
          disabled={loading}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50 ${open ? 'bg-green-500' : 'bg-gray-300'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${open ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      {/* Closed message */}
      <form onSubmit={saveMessage} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Message shown to social workers when closed
        </label>
        <input
          type="text"
          value={message}
          onChange={e => setMessage(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1B52C1]"
          placeholder="e.g. Family registration will open on October 1st."
        />
        <button
          type="submit"
          disabled={loading}
          className="text-sm px-4 py-1.5 bg-[#1B52C1] text-white rounded-lg hover:bg-[#1540A0] disabled:opacity-50"
        >
          {saved ? 'Saved!' : 'Save message'}
        </button>
      </form>
    </div>
  )
}

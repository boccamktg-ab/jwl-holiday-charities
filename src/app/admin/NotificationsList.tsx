'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Notification = { id: string; message: string; created_at: string }

export default function NotificationsList({ notifications }: { notifications: Notification[] }) {
  const router = useRouter()
  const [dismissing, setDismissing] = useState<string | null>(null)
  const [dismissingAll, setDismissingAll] = useState(false)

  async function dismiss(id: string) {
    setDismissing(id)
    await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setDismissing(null)
    router.refresh()
  }

  async function dismissAll() {
    setDismissingAll(true)
    await fetch('/api/admin/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    setDismissingAll(false)
    router.refresh()
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-800">
          Member updates ({notifications.length})
        </h2>
        <button onClick={dismissAll} disabled={dismissingAll}
          className="text-xs text-gray-400 hover:text-gray-600 disabled:opacity-50">
          {dismissingAll ? 'Clearing…' : 'Dismiss all'}
        </button>
      </div>
      <div className="space-y-2">
        {notifications.map(n => (
          <div key={n.id} className="flex items-center justify-between gap-4 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2.5">
            <div className="flex items-center gap-3">
              <span className="text-[#1B52C1] text-sm">●</span>
              <div>
                <p className="text-sm text-gray-800">{n.message}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <button
              onClick={() => dismiss(n.id)}
              disabled={dismissing === n.id}
              className="text-xs text-gray-400 hover:text-gray-600 shrink-0 disabled:opacity-50"
            >
              {dismissing === n.id ? '…' : 'Dismiss'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

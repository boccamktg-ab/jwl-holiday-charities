'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

type Message = {
  id: string
  body: string
  created_at: string
  author_id: string
  attachment_url?: string | null
  attachment_name?: string | null
}

type Props = {
  applicationId: string
  messages: Message[]
  currentUserId: string
  canMessage: boolean
}

export default function ReviewerMessageThread({ applicationId, messages, currentUserId, canMessage }: Props) {
  const router = useRouter()
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')

  async function send() {
    if (!body.trim() && !fileRef.current?.files?.length) return
    setSending(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('application_id', applicationId)
      formData.append('body', body.trim())
      if (fileRef.current?.files?.length) {
        formData.append('file', fileRef.current.files[0])
      }

      const res = await fetch('/api/grants/reviewer-messages', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error ?? 'Failed to send message.')
      }
      setBody('')
      setFileName('')
      if (fileRef.current) fileRef.current.value = ''
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Messages</h2>

      {messages.length === 0 && (
        <p className="text-sm text-gray-400">No messages yet.</p>
      )}

      <div className="space-y-3">
        {messages.map(msg => {
          const isMe = msg.author_id === currentUserId
          return (
            <div key={msg.id} className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm space-y-1.5 ${
                isMe ? 'bg-[#1B52C1] text-white' : 'bg-gray-100 text-gray-900'
              }`}>
                {msg.body && <p>{msg.body}</p>}
                {msg.attachment_url && (
                  <a
                    href={msg.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-1.5 text-xs underline ${isMe ? 'text-blue-200 hover:text-white' : 'text-[#1B52C1] hover:text-blue-700'}`}
                  >
                    <span>📎</span>
                    <span>{msg.attachment_name ?? 'Attachment'}</span>
                  </a>
                )}
              </div>
              <span className="text-xs text-gray-400">
                {isMe ? 'You (JWL)' : 'Referrer'} · {new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
              </span>
            </div>
          )
        })}
      </div>

      {canMessage && (
        <div className="space-y-2 pt-2 border-t border-gray-100">
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={3}
            placeholder="Write a message to the referrer…"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              <span>📎</span>
              <span className="underline">Attach file</span>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                className="hidden"
                onChange={e => setFileName(e.target.files?.[0]?.name ?? '')}
              />
            </label>
            {fileName && (
              <span className="text-xs text-gray-500 truncate max-w-[180px]">{fileName}</span>
            )}
            {fileName && (
              <button
                type="button"
                onClick={() => { setFileName(''); if (fileRef.current) fileRef.current.value = '' }}
                className="text-xs text-gray-400 hover:text-gray-600"
              >✕</button>
            )}
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            onClick={send}
            disabled={sending || (!body.trim() && !fileName)}
            className="bg-[#1B52C1] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#1540A0] disabled:opacity-50"
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
      )}
    </div>
  )
}

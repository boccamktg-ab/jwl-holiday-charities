'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

type School = { id: string; name: string; district_name: string }

export default function NewFamilyPage() {
  const router = useRouter()
  const [schools, setSchools] = useState<School[]>([])
  const [familyNumber, setFamilyNumber] = useState('')
  const [numChildren, setNumChildren] = useState(1)
  const [schoolId, setSchoolId] = useState('')
  const [languagePref, setLanguagePref] = useState('en')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get the schools this SW covers
      const { data: swSchools } = await supabase
        .from('social_worker_schools')
        .select('school_id, schools ( id, name, districts ( name ) )')
        .eq('social_worker_id', (
          await supabase.from('social_workers').select('id').eq('auth_id', user.id).single()
        ).data?.id)

      const mapped = swSchools?.map((s: any) => ({
        id: s.schools.id,
        name: s.schools.name,
        district_name: s.schools.districts.name,
      })) ?? []

      setSchools(mapped)
      if (mapped.length === 1) setSchoolId(mapped[0].id)
    }
    load()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!schoolId) { setError('Please select a school.'); return }
    setLoading(true)
    setError('')

    const res = await fetch('/api/families', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ familyNumber, numChildren, schoolId, languagePref }),
    })
    const json = await res.json()

    if (!res.ok) {
      setError(json.error || 'Failed to create family.')
      setLoading(false)
      return
    }

    router.push(`/dashboard/families/${json.id}`)
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Back</Link>
        <h1 className="text-2xl font-semibold text-gray-900">Add Family</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {schools.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
            <select
              required
              value={schoolId}
              onChange={e => setSchoolId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a school…</option>
              {schools.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        )}
        {schools.length === 1 && (
          <div>
            <p className="text-sm font-medium text-gray-700">School</p>
            <p className="text-sm text-gray-500 mt-0.5">{schools[0].name}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Family number</label>
          <input
            type="text"
            required
            value={familyNumber}
            onChange={e => setFamilyNumber(e.target.value)}
            placeholder="e.g. 42"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Number of children</label>
          <input
            type="number"
            required
            min={1}
            max={20}
            value={numChildren}
            onChange={e => setNumChildren(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Language preference</label>
          <select
            value={languagePref}
            onChange={e => setLanguagePref(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creating…' : 'Create family'}
        </button>
      </form>
    </div>
  )
}

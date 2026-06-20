'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type District = { id: string; name: string }
type School = { id: string; name: string; district_id: string }

type Props = {
  sw: { id: string; name: string; email: string; phone?: string | null }
  districts: District[]
  schools: School[]
  currentSchoolIds: string[]
  currentDistrictId: string
}

export default function ProfileForm({ sw, districts, schools, currentSchoolIds, currentDistrictId }: Props) {
  const router = useRouter()
  const [name, setName] = useState(sw.name)
  const [email, setEmail] = useState(sw.email)
  const [phone, setPhone] = useState(sw.phone ?? '')
  const [districtId, setDistrictId] = useState(currentDistrictId)
  const [selectedSchools, setSelectedSchools] = useState<string[]>(currentSchoolIds)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const districtSchools = schools.filter(s => s.district_id === districtId)

  function handleDistrictChange(id: string) {
    setDistrictId(id)
    setSelectedSchools([])
  }

  function toggleSchool(id: string) {
    setSelectedSchools(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (selectedSchools.length === 0) { setError('Select at least one school.'); return }
    setLoading(true)
    setError('')
    setSuccess(false)

    const res = await fetch('/api/dashboard/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, schoolIds: selectedSchools }),
    })
    const json = await res.json()

    setLoading(false)
    if (!res.ok) { setError(json.error || 'Failed to save.'); return }
    setSuccess(true)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
        <input
          type="text"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-1">Changing your email will also update your login.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
        <input
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="(555) 555-5555"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
        <select
          required
          value={districtId}
          onChange={e => handleDistrictChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a district…</option>
          {districts.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      {districtId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">School(s) you cover</label>
          <div className="space-y-1">
            {districtSchools.map(school => (
              <label key={school.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedSchools.includes(school.id)}
                  onChange={() => toggleSchool(school.id)}
                  className="rounded border-gray-300 text-blue-600"
                />
                <span className="text-sm text-gray-700">{school.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-green-600">Profile updated successfully.</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  )
}

'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

type Family = {
  id: string
  family_number: string
  num_children: number
  status: string
  schools: { id: string; name: string; district_id: string; districts: { name: string } } | null
  children: { id: string }[]
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  approved: 'Approved',
}

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-600',
  submitted: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
}

type SortKey = 'family_number' | 'school'

export default function FamiliesList({ families }: { families: Family[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('family_number')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [filterSchool, setFilterSchool] = useState('')

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  // Unique schools for filter dropdown
  const schools = useMemo(() => {
    const seen = new Map<string, string>()
    for (const f of families) {
      if (f.schools?.id) seen.set(f.schools.id, f.schools.name)
    }
    return Array.from(seen.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [families])

  // Find duplicate family numbers within the same district (across all families, not just filtered)
  const duplicateKeys = useMemo(() => {
    const seen: Record<string, number> = {}
    for (const f of families) {
      const schoolId = f.schools?.id ?? ''
      const key = `${schoolId}::${f.family_number.trim().toLowerCase()}`
      seen[key] = (seen[key] ?? 0) + 1
    }
    return new Set(
      Object.entries(seen).filter(([, count]) => count > 1).map(([key]) => key)
    )
  }, [families])

  const filtered = useMemo(() => {
    return filterSchool ? families.filter(f => f.schools?.id === filterSchool) : families
  }, [families, filterSchool])

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'family_number') {
        cmp = a.family_number.localeCompare(b.family_number, undefined, { numeric: true })
      } else {
        const schoolA = a.schools?.name ?? ''
        const schoolB = b.schools?.name ?? ''
        cmp = schoolA.localeCompare(schoolB)
        if (cmp === 0) cmp = a.family_number.localeCompare(b.family_number, undefined, { numeric: true })
      }
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  const duplicateCount = useMemo(() => {
    return families.filter(f => {
      const schoolId = f.schools?.id ?? ''
      const key = `${schoolId}::${f.family_number.trim().toLowerCase()}`
      return duplicateKeys.has(key)
    }).length
  }, [families, duplicateKeys])

  function SortButton({ label, col }: { label: string; col: SortKey }) {
    const active = sortKey === col
    return (
      <button
        onClick={() => toggleSort(col)}
        className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
          active
            ? 'border-blue-300 bg-blue-50 text-blue-700 font-medium'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
        }`}
      >
        {label}
        <span className="text-xs">{active ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
      </button>
    )
  }

  if (families.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400 text-sm">
        No families yet. Click &ldquo;Add Family&rdquo; to get started.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {duplicateCount > 0 && (
        <div className="bg-red-50 border border-red-300 rounded-xl px-4 py-3 text-sm text-red-800">
          <strong>Duplicate family numbers detected:</strong> {duplicateCount} {duplicateCount === 1 ? 'family shares' : 'families share'} a family number with another family in the same district. Please review and correct.
        </div>
      )}

      {/* Filter + sort controls */}
      <div className="flex flex-wrap items-center gap-2">
        {schools.length > 1 && (
          <select
            value={filterSchool}
            onChange={e => setFilterSchool(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All schools</option>
            {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-xs text-gray-400 mr-1">Sort:</span>
          <SortButton label="Family #" col="family_number" />
          <SortButton label="School" col="school" />
        </div>
      </div>

      {sorted.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">No families match this filter.</p>
      )}

      {sorted.map(family => {
        const schoolId = family.schools?.id ?? ''
        const dupKey = `${schoolId}::${family.family_number.trim().toLowerCase()}`
        const isDuplicate = duplicateKeys.has(dupKey)

        return (
          <Link
            key={family.id}
            href={`/dashboard/families/${family.id}`}
            className={`block rounded-xl border p-4 transition-colors ${
              isDuplicate
                ? 'bg-red-50 border-red-300 hover:border-red-400'
                : 'bg-white border-gray-200 hover:border-blue-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-medium ${isDuplicate ? 'text-red-900' : 'text-gray-900'}`}>
                    Family #{family.family_number}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[family.status]}`}>
                    {STATUS_LABELS[family.status]}
                  </span>
                  {isDuplicate && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">
                      ⚠ Duplicate #
                    </span>
                  )}
                </div>
                <p className={`text-sm ${isDuplicate ? 'text-red-700' : 'text-gray-500'}`}>
                  {family.schools?.name} &middot; {family.schools?.districts?.name}
                </p>
              </div>
              <div className="text-right text-sm text-gray-400">
                {family.children?.length ?? 0} / {family.num_children} children
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

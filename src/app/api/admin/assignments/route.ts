import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'

function adminClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { memberId, childIds } = await request.json()
  if (!memberId || !childIds?.length) {
    return NextResponse.json({ error: 'Missing memberId or childIds' }, { status: 400 })
  }

  const db = adminClient()

  const { data: assignment, error: aErr } = await db
    .from('assignments')
    .insert({ jwl_member_id: memberId })
    .select('id')
    .single()

  if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 })

  const links = childIds.map((child_id: string) => ({
    assignment_id: assignment.id,
    child_id,
  }))

  const { error: lErr } = await db.from('assignment_children').insert(links)
  if (lErr) return NextResponse.json({ error: lErr.message }, { status: 500 })

  return NextResponse.json({ id: assignment.id })
}

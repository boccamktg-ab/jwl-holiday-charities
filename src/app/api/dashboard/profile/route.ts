import { NextRequest, NextResponse } from 'next/server'
import { createClient as adminSupabase } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'

function adminClient() {
  return adminSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function PATCH(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, email, phone, schoolIds } = await request.json()
  if (!name?.trim() || !email?.trim() || !schoolIds?.length) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  const db = adminClient()

  // Get social worker id
  const { data: sw } = await db
    .from('social_workers')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (!sw) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Update name + email on social_workers row
  const { error: swErr } = await db
    .from('social_workers')
    .update({ name, email, phone: phone?.trim() || null })
    .eq('id', sw.id)

  if (swErr) return NextResponse.json({ error: swErr.message }, { status: 500 })

  // Update auth email if it changed
  if (email !== user.email) {
    const { error: authErr } = await db.auth.admin.updateUserById(user.id, { email })
    if (authErr) return NextResponse.json({ error: authErr.message }, { status: 500 })
  }

  // Replace school assignments
  await db.from('social_worker_schools').delete().eq('social_worker_id', sw.id)
  await db.from('social_worker_schools').insert(
    schoolIds.map((school_id: string) => ({ social_worker_id: sw.id, school_id }))
  )

  return NextResponse.json({ ok: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { createClient as adminSupabase } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'

function db() {
  return adminSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function requireAdmin(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) return null
  return user
}

// PATCH — approve / disable / enable a member
export async function PATCH(request: NextRequest) {
  if (!await requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { memberId, action } = await request.json()
  const statusMap: Record<string, string> = {
    approve: 'approved',
    disable: 'disabled',
    enable:  'approved',
  }
  const newStatus = statusMap[action]
  if (!newStatus) return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  const { error } = await db()
    .from('jwl_members')
    .update({ status: newStatus })
    .eq('id', memberId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

// POST — admin creates a JWL member directly (pre-approved, auto-creates login)
export async function POST(request: NextRequest) {
  if (!await requireAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { name, email, childrenRequested } = await request.json()
  if (!name || !email) return NextResponse.json({ error: 'Name and email required' }, { status: 400 })

  const admin = db()

  // Create auth user; they'll use "Forgot password" to set their own password
  const { data: authData, error: authErr } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
  })
  if (authErr) return NextResponse.json({ error: authErr.message }, { status: 500 })

  const { error: insertErr } = await admin.from('jwl_members').insert({
    name,
    email,
    auth_id: authData.user.id,
    children_requested: childrenRequested ?? null,
    status: 'approved',
  })
  if (insertErr) {
    await admin.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: insertErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

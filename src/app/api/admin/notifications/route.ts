import { NextRequest, NextResponse } from 'next/server'
import { createClient as adminSupabase } from '@supabase/supabase-js'
import { requireAdminFromRequest } from '@/lib/admin'

function db() {
  return adminSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

// PATCH — mark one or all notifications as read
export async function PATCH(request: NextRequest) {
  if (!await requireAdminFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  const { id } = await request.json()
  const query = db().from('admin_notifications').update({ read: true })
  if (id) query.eq('id', id)
  const { error } = await (id
    ? db().from('admin_notifications').update({ read: true }).eq('id', id)
    : db().from('admin_notifications').update({ read: true }).eq('read', false))
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

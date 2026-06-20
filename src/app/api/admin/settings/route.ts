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

export async function PATCH(request: NextRequest) {
  if (!await requireAdminFromRequest(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await request.json()

  // Update app_settings key/value pairs
  if ('key' in body && 'value' in body) {
    const { error } = await db()
      .from('app_settings')
      .upsert({ key: body.key, value: String(body.value) })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Toggle per-SW submissions
  if ('swId' in body && 'submissionsEnabled' in body) {
    const { error } = await db()
      .from('social_workers')
      .update({ submissions_enabled: body.submissionsEnabled })
      .eq('id', body.swId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

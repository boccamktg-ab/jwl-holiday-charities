import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { complete } = await request.json()

  const { data: sw } = await supabase
    .from('social_workers')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (!sw) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await supabase
    .from('social_workers')
    .update({ intake_complete: complete })
    .eq('id', sw.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

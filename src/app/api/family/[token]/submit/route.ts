import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const supabase = adminClient()

  const { data: family } = await supabase
    .from('families')
    .select('id, status')
    .eq('link_token', token)
    .single()

  if (!family) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (family.status !== 'draft') return NextResponse.json({ ok: true })

  const { error } = await supabase
    .from('families')
    .update({ status: 'submitted', submitted_at: new Date().toISOString() })
    .eq('id', family.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

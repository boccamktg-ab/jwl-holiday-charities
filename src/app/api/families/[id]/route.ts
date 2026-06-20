import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

function swClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => request.cookies.getAll(), setAll: () => {} } }
  )
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = swClient(request)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { familyNumber, numChildren, languagePref, schoolId } = await request.json()

  const { error } = await supabase
    .from('families')
    .update({
      family_number: familyNumber,
      num_children: numChildren,
      language_pref: languagePref,
      school_id: schoolId,
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

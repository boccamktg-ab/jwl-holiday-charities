import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

function swClient(request: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    }
  )
}

export async function POST(request: NextRequest) {
  const supabase = swClient(request)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { familyNumber, numChildren, schoolId, languagePref } = await request.json()

  const { data: sw } = await supabase
    .from('social_workers')
    .select('id')
    .eq('auth_id', user.id)
    .single()

  if (!sw) return NextResponse.json({ error: 'Social worker not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('families')
    .insert({
      family_number: familyNumber,
      num_children: numChildren,
      school_id: schoolId,
      social_worker_id: sw.id,
      language_pref: languagePref,
      status: 'draft',
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id })
}

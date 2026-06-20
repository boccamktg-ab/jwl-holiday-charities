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

  const { familyId, firstName, age, gender, giftRequests, topSize, bottomSize, shoeSize } = await request.json()

  const { data, error } = await supabase
    .from('children')
    .insert({
      family_id: familyId,
      first_name: firstName,
      age: age ? Number(age) : null,
      gender: gender || null,
      gift_requests: giftRequests || null,
      top_size: topSize || null,
      bottom_size: bottomSize || null,
      shoe_size: shoeSize || null,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ id: data.id })
}

export async function PATCH(request: NextRequest) {
  const supabase = swClient(request)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id, firstName, age, gender, giftRequests, topSize, bottomSize, shoeSize } = await request.json()

  const { error } = await supabase
    .from('children')
    .update({
      first_name: firstName,
      age: age ? Number(age) : null,
      gender: gender || null,
      gift_requests: giftRequests || null,
      top_size: topSize || null,
      bottom_size: bottomSize || null,
      shoe_size: shoeSize || null,
    })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const supabase = swClient(request)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await request.json()
  const { error } = await supabase.from('children').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

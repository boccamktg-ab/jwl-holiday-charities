import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

async function getFamilyByToken(token: string) {
  const { data } = await adminClient()
    .from('families')
    .select('id, status')
    .eq('link_token', token)
    .single()
  return data
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const family = await getFamilyByToken(token)
  if (!family) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (family.status === 'approved') return NextResponse.json({ error: 'Already approved' }, { status: 403 })

  const { firstName, age, gender, giftRequests, topSize, bottomSize, shoeSize } = await request.json()
  if (!firstName?.trim()) return NextResponse.json({ error: 'First name required' }, { status: 400 })

  const { data, error } = await adminClient()
    .from('children')
    .insert({
      family_id: family.id,
      first_name: firstName,
      age: age ? Number(age) : null,
      gender: gender || null,
      gift_requests: giftRequests || null,
      top_size: topSize || null,
      bottom_size: bottomSize || null,
      shoe_size: shoeSize || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ child: data })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const family = await getFamilyByToken(token)
  if (!family) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (family.status === 'approved') return NextResponse.json({ error: 'Already approved' }, { status: 403 })

  const { id } = await request.json()
  const { error } = await adminClient()
    .from('children')
    .delete()
    .eq('id', id)
    .eq('family_id', family.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

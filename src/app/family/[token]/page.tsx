import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import FamilyForm from './FamilyForm'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function FamilyPublicPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = serviceClient()

  const { data: family } = await supabase
    .from('families')
    .select(`
      id, family_number, status, language_pref, link_token,
      schools ( name ),
      children ( id, first_name, age, gender, gift_requests, top_size, bottom_size, shoe_size, created_at )
    `)
    .eq('link_token', token)
    .single()

  if (!family) notFound()

  return (
    <FamilyForm
      family={{
        id: family.id,
        familyNumber: family.family_number,
        status: family.status,
        languagePref: family.language_pref as 'en' | 'es',
        linkToken: family.link_token,
        school: (family.schools as any)?.name ?? '',
        children: ((family.children as any[]) ?? []).sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        ),
      }}
    />
  )
}

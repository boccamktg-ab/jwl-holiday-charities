import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createClient as adminClient } from '@supabase/supabase-js'

export default async function MembersLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const db = adminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
  const { data: member } = await db
    .from('jwl_members')
    .select('name, status')
    .eq('auth_id', user.id)
    .single()

  if (!member) redirect('/login')

  if (member.status === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-md text-center space-y-3">
          <h1 className="text-lg font-semibold text-gray-900">Account pending approval</h1>
          <p className="text-sm text-gray-500">Your account is awaiting admin approval.</p>
          <form action="/api/auth/logout" method="POST">
            <button className="text-sm text-gray-500 hover:underline">Sign out</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <span className="font-semibold text-gray-900">JWL Holiday Charities</span>
        <div className="flex items-center gap-6 text-sm">
          <span className="text-gray-400">{member.name}</span>
          <form action="/api/auth/logout" method="POST">
            <button className="text-gray-500 hover:text-gray-900">Sign out</button>
          </form>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}

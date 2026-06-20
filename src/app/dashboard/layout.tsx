import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: sw } = await supabase
    .from('social_workers')
    .select('name, status')
    .eq('auth_id', user.id)
    .single()

  if (!sw || sw.status !== 'approved') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <span className="font-semibold text-gray-900">JWL Holiday Charities</span>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">My Families</Link>
          <Link href="/dashboard/profile" className="text-gray-600 hover:text-gray-900">My Profile</Link>
          <span className="text-gray-400">{sw.name}</span>
          <form action="/api/auth/logout" method="POST">
            <button className="text-gray-500 hover:text-gray-900">Sign out</button>
          </form>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}

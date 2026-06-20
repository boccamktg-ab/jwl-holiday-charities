import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <span className="font-semibold text-gray-900">JWL Admin</span>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/admin" className="text-gray-600 hover:text-gray-900">Dashboard</Link>
          <Link href="/admin/children" className="text-gray-600 hover:text-gray-900">Children</Link>
          <Link href="/admin/assignments" className="text-gray-600 hover:text-gray-900">Assignments</Link>
          <Link href="/admin/social-workers" className="text-gray-600 hover:text-gray-900">Social Workers</Link>
          <Link href="/admin/members" className="text-gray-600 hover:text-gray-900">Members</Link>
          <Link href="/admin/setup" className="text-gray-600 hover:text-gray-900">Setup</Link>
          <form action="/api/auth/logout" method="POST">
            <button className="text-gray-500 hover:text-gray-900">Sign out</button>
          </form>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  )
}

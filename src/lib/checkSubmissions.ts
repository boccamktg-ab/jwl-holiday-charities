import { createClient as adminSupabase } from '@supabase/supabase-js'

function db() {
  return adminSupabase(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function checkSubmissionsAllowed(swId: string): Promise<{ allowed: boolean; message: string }> {
  const [{ data: settings }, { data: sw }] = await Promise.all([
    db().from('app_settings').select('key, value'),
    db().from('social_workers').select('submissions_enabled').eq('id', swId).single(),
  ])

  const settingsMap = Object.fromEntries((settings ?? []).map(s => [s.key, s.value]))
  const systemOpen = settingsMap['submissions_open'] !== 'false'
  const closedMessage = settingsMap['submissions_closed_message'] ?? 'Family registration is currently closed.'

  if (!systemOpen) return { allowed: false, message: closedMessage }
  if (!sw?.submissions_enabled) return { allowed: false, message: 'Your submissions have been temporarily disabled. Please contact the admin.' }

  return { allowed: true, message: '' }
}

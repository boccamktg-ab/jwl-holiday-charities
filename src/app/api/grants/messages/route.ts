import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: sw } = await supabase
      .from('social_workers')
      .select('id, status')
      .eq('auth_id', user.id)
      .single()

    if (!sw || sw.status !== 'approved') {
      return NextResponse.json({ error: 'Account not approved' }, { status: 403 })
    }

    const formData = await req.formData()
    const application_id = formData.get('application_id') as string
    const body = (formData.get('body') as string | null) ?? ''
    const file = formData.get('file') as File | null

    if (!application_id || (!body.trim() && !file)) {
      return NextResponse.json({ error: 'Missing application_id or message content' }, { status: 400 })
    }

    const { data: app } = await supabase
      .from('grant_applications')
      .select('id, status')
      .eq('id', application_id)
      .eq('referrer_id', sw.id)
      .single()

    if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    if (['approved', 'denied', 'paid_closed'].includes(app.status)) {
      return NextResponse.json({ error: 'Cannot message on a closed application' }, { status: 400 })
    }

    const service = await createServiceClient()

    let attachment_url: string | null = null
    let attachment_name: string | null = null

    if (file) {
      const ext = file.name.split('.').pop()
      const path = `grants/${application_id}/messages/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error: uploadError } = await service.storage
        .from('grant-documents')
        .upload(path, file, { contentType: file.type })

      if (uploadError) {
        console.error(uploadError)
        return NextResponse.json({ error: 'File upload failed' }, { status: 500 })
      }

      const { data: urlData } = service.storage.from('grant-documents').getPublicUrl(path)
      attachment_url = urlData.publicUrl
      attachment_name = file.name
    }

    const { error } = await service
      .from('grant_messages')
      .insert({ application_id, author_id: user.id, body: body.trim(), attachment_url, attachment_name })

    if (error) {
      console.error(error)
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

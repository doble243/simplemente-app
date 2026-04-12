import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  status: z.enum(['draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled']),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', request.url))

  const { id } = await params

  // Support both form-data (native HTML form) and JSON
  const contentType = request.headers.get('content-type') ?? ''
  let rawStatus: string | undefined

  if (contentType.includes('application/x-www-form-urlencoded')) {
    const form = await request.formData()
    rawStatus = form.get('status')?.toString()
  } else {
    try {
      const body = await request.json()
      rawStatus = body?.status
    } catch { /* ignore */ }
  }

  const parsed = schema.safeParse({ status: rawStatus })
  if (!parsed.success) {
    return NextResponse.redirect(new URL(`/facturas/${id}`, request.url))
  }

  const extra: Record<string, unknown> = {}
  if (parsed.data.status === 'paid') {
    extra.paid_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('invoices')
    .update({ status: parsed.data.status, ...extra })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Error al actualizar el estado.' }, { status: 500 })
  }

  // HTML form submissions expect a redirect; JSON fetch calls expect a JSON response
  if (contentType.includes('application/json')) {
    return NextResponse.json({ success: true, status: parsed.data.status })
  }

  return NextResponse.redirect(new URL(`/facturas/${id}`, request.url))
}

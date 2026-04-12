import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const schema = z.object({
  agency_name:    z.string().min(1, 'Nombre requerido'),
  email:          z.string().email('Email inválido'),
  phone:          z.string().optional(),
  address:        z.string().optional(),
  rut:            z.string().optional(),
  website:        z.string().url('URL inválida').optional().or(z.literal('')),
  invoice_footer: z.string().optional(),
  payment_terms:  z.string().optional(),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('agency_settings')
    .select('*')
    .single()

  if (error || !data) {
    // Return defaults if table not yet seeded (demo mode)
    return NextResponse.json({
      agency_name:    'Simplemente',
      email:          'hola@simplemente.uy',
      phone:          '',
      address:        'Montevideo, Uruguay',
      rut:            '',
      website:        'https://simplemente.uy',
      invoice_footer: 'Gracias por su confianza en Simplemente.',
      payment_terms:  'Pago a 30 días de la fecha de emisión.',
    })
  }

  return NextResponse.json(data)
}

export async function PATCH(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 })
  }

  const { data, error } = await supabase
    .from('agency_settings')
    .update(parsed.data)
    .select()
    .single()

  if (error) {
    console.error('Error updating agency_settings:', error)
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 })
  }

  return NextResponse.json(data)
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PortalNav } from '@/components/portal/PortalNav'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  if (supabaseUrl.includes('placeholder')) {
    return (
      <div className="min-h-screen bg-background">
        <PortalNav userName="Demo" />
        <main className="container mx-auto px-4 py-6 max-w-4xl">{children}</main>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (profile?.role === 'admin') redirect('/dashboard')

  return (
    <div className="min-h-screen bg-background">
      <PortalNav userName={profile?.full_name ?? 'Mi cuenta'} />
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {children}
      </main>
    </div>
  )
}

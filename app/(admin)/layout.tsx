import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/admin/Sidebar'
import { MobileNav } from '@/components/admin/MobileNav'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  if (supabaseUrl.includes('placeholder')) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar newLeads={0} />
        <div className="flex flex-1 flex-col min-w-0">
          {children}
        </div>
        <MobileNav newLeads={0} />
      </div>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/portal')

  // Fetch new leads count for badge
  const { count: newLeads } = await supabase
    .from('leads')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'new')

  const count = newLeads ?? 0

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar newLeads={count} />
      <div className="flex flex-1 flex-col min-w-0">
        {children}
      </div>
      <MobileNav newLeads={count} />
    </div>
  )
}

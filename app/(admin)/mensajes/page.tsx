import { Topbar } from '@/components/admin/Topbar'
import { createClient } from '@/lib/supabase/server'
import { timeAgo } from '@/lib/utils/dates'
import Link from 'next/link'

export default async function MensajesPage() {
  const supabase = await createClient()

  // Get latest message per client
  const { data: messages } = await supabase
    .from('messages')
    .select('id, content, created_at, is_from_client, read_at, clients(id, company_name)')
    .order('created_at', { ascending: false })
    .limit(50)

  // Group by client
  type MsgItem = { id: string; content: string; created_at: string; is_from_client: boolean; read_at: string | null; clients: unknown }
  const byClient: Record<string, { client: { id: string; company_name: string }; lastMsg: MsgItem; unread: number }> = {}
  for (const msg of (messages ?? []) as MsgItem[]) {
    const client = msg.clients as { id: string; company_name: string } | null
    if (!client) continue
    if (!byClient[client.id]) {
      byClient[client.id] = { client, lastMsg: msg, unread: 0 }
    }
    if (msg.is_from_client && !msg.read_at) {
      byClient[client.id].unread++
    }
  }

  const threads = Object.values(byClient).sort(
    (a, b) => new Date(b.lastMsg.created_at).getTime() - new Date(a.lastMsg.created_at).getTime()
  )

  return (
    <>
      <Topbar title="Mensajes" />
      <main className="p-6 max-w-2xl">
        <div className="rounded-xl border bg-card overflow-hidden">
          {threads.map(({ client, lastMsg, unread }) => (
            <Link
              key={client.id}
              href={`/clientes/${client.id}`}
              className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-accent transition-colors"
            >
              <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-muted-foreground">{client.company_name.charAt(0)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${unread > 0 ? 'font-semibold text-foreground' : 'font-medium text-foreground'}`}>
                  {client.company_name}
                </p>
                <p className="text-xs text-muted-foreground truncate">{lastMsg.content}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <p className="text-xs text-gray-300">{timeAgo(lastMsg.created_at)}</p>
                {unread > 0 && (
                  <span className="h-5 w-5 rounded-full bg-black text-white text-xs flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </div>
            </Link>
          ))}
          {threads.length === 0 && (
            <p className="text-sm text-muted-foreground py-12 text-center">Sin mensajes todavía.</p>
          )}
        </div>
      </main>
    </>
  )
}

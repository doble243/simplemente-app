import Link from 'next/link'
import { Topbar } from '@/components/admin/Topbar'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils/dates'
import { MessageCircle, Download } from 'lucide-react'
import { ChatLogsExport } from '@/components/admin/ChatLogsExport'

// ─── Types ───────────────────────────────────────────────────────────────────
interface ChatLog {
  id:               string
  session_id:       string
  user_message:     string
  assistant_message: string
  ip_hash:          string | null
  created_at:       string
}

interface Session {
  session_id:  string
  first_msg:   string
  last_msg:    string
  count:       number
  first_at:    string
  last_at:     string
}

// ─── Group logs into sessions ─────────────────────────────────────────────────
function groupBySessions(logs: ChatLog[]): Session[] {
  const map = new Map<string, Session>()
  for (const log of logs) {
    const existing = map.get(log.session_id)
    if (!existing) {
      map.set(log.session_id, {
        session_id: log.session_id,
        first_msg:  log.user_message,
        last_msg:   log.user_message,
        count:      1,
        first_at:   log.created_at,
        last_at:    log.created_at,
      })
    } else {
      existing.count++
      existing.last_msg = log.user_message
      if (log.created_at < existing.first_at) {
        existing.first_at = log.created_at
        existing.first_msg = log.user_message
      }
      if (log.created_at > existing.last_at) {
        existing.last_at = log.created_at
        existing.last_msg = log.user_message
      }
    }
  }
  // Sort by most recent first
  return Array.from(map.values()).sort((a, b) => b.last_at.localeCompare(a.last_at))
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default async function ChatLogsPage() {
  const supabase = await createClient()

  // Try to fetch chat logs — table may not exist yet
  let logs: ChatLog[] = []
  let tableExists = true
  try {
    const { data, error } = await supabase
      .from('chat_logs')
      .select('id, session_id, user_message, assistant_message, ip_hash, created_at')
      .order('created_at', { ascending: false })
      .limit(2000)
    if (error) {
      if (error.code === '42P01') tableExists = false // table doesn't exist yet
      else console.error('chat_logs fetch error:', error)
    }
    logs = data ?? []
  } catch { tableExists = false }

  const sessions = groupBySessions(logs)
  const totalMessages = logs.length

  return (
    <>
      <Topbar
        title="Chat Logs"
        section="IA"
        actions={
          logs.length > 0
            ? <ChatLogsExport logs={logs} />
            : undefined
        }
      />
      <main className="page-shell">

        {/* Stats row */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Sesiones',         value: sessions.length },
            { label: 'Mensajes totales', value: totalMessages },
            { label: 'Hoy',              value: logs.filter(l => l.created_at.startsWith(new Date().toISOString().slice(0,10))).length },
            { label: 'Esta semana',      value: logs.filter(l => new Date(l.created_at) > new Date(Date.now() - 7*86400*1000)).length },
          ].map(stat => (
            <div key={stat.label} className="card-base p-4">
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/60 mb-1">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Table not ready */}
        {!tableExists && (
          <div className="card-base py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <MessageCircle className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Tabla pendiente de migración</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Aplicá la migración <code className="font-mono bg-muted px-1 rounded">0007_chat_logs.sql</code> en Supabase para activar el guardado de conversaciones.
            </p>
          </div>
        )}

        {/* Empty state */}
        {tableExists && sessions.length === 0 && (
          <div className="card-base py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <MessageCircle className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">Sin conversaciones todavía</p>
            <p className="text-xs text-muted-foreground">
              Las conversaciones del widget de IA se guardan automáticamente aquí.
            </p>
          </div>
        )}

        {/* Sessions list */}
        {sessions.length > 0 && (
          <>
            <p className="text-[12px] text-muted-foreground mb-3">
              {sessions.length} sesiones · {totalMessages} mensajes guardados
            </p>

            {/* Mobile */}
            <div className="space-y-2 md:hidden">
              {sessions.map(s => (
                <Link
                  key={s.session_id}
                  href={`/chat-logs/${encodeURIComponent(s.session_id)}`}
                  className="card-base block p-4 interactive"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <MessageCircle className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-foreground truncate">{s.first_msg}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{formatDate(s.last_at)}</p>
                    </div>
                    <span className="shrink-0 badge-blue text-[11px]">{s.count} msg</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground truncate pl-11">{s.last_msg}</p>
                </Link>
              ))}
            </div>

            {/* Desktop table */}
            <div className="card-base overflow-hidden hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 label-xs text-left w-8">#</th>
                    <th className="px-4 py-3 label-xs text-left">Primer mensaje</th>
                    <th className="px-4 py-3 label-xs text-left">Último mensaje</th>
                    <th className="px-4 py-3 label-xs text-center w-20">Turnos</th>
                    <th className="px-4 py-3 label-xs text-right w-36">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sessions.map((s, i) => (
                    <tr key={s.session_id} className="hover:bg-accent/40 transition-colors">
                      <td className="px-4 py-3 text-[12px] text-muted-foreground/50 tabular-nums">{i + 1}</td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/chat-logs/${encodeURIComponent(s.session_id)}`}
                          className="text-[13px] font-medium text-foreground hover:text-primary transition-colors line-clamp-1 max-w-xs block"
                        >
                          {s.first_msg}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-muted-foreground line-clamp-1 max-w-xs">
                        {s.last_msg}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="badge-blue text-[11px]">{s.count}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-[12px] text-muted-foreground/70 whitespace-nowrap">
                        {formatDate(s.last_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </main>
    </>
  )
}

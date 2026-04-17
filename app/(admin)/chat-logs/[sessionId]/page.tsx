import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Topbar } from '@/components/admin/Topbar'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils/dates'
import { ArrowLeft } from 'lucide-react'

interface Props {
  params: Promise<{ sessionId: string }>
}

export default async function ChatSessionPage({ params }: Props) {
  const { sessionId } = await params
  const decoded = decodeURIComponent(sessionId)

  const supabase = await createClient()
  const { data } = await supabase
    .from('chat_logs')
    .select('id, user_message, assistant_message, created_at')
    .eq('session_id', decoded)
    .order('created_at', { ascending: true })

  const logs = data ?? []
  if (logs.length === 0) notFound()

  const shortId = decoded.slice(0, 12) + '…'

  return (
    <>
      <Topbar
        title={`Sesión ${shortId}`}
        section="Chat Logs"
        actions={
          <Link
            href="/chat-logs"
            className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-background px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver
          </Link>
        }
      />
      <main className="page-shell max-w-2xl">

        <div className="mb-4 flex items-center gap-3">
          <p className="text-[12px] text-muted-foreground">
            {logs.length} intercambios · Iniciado {formatDate(logs[0].created_at)}
          </p>
        </div>

        {/* Conversation thread */}
        <div className="space-y-4">
          {logs.map((log, i) => (
            <div key={log.id} className="card-base p-5 space-y-4">
              {/* Turn number */}
              <p className="label-xs text-muted-foreground/50">Turno {i + 1} · {formatDate(log.created_at)}</p>

              {/* User bubble */}
              <div className="flex gap-3 justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-tr-md bg-primary px-4 py-2.5 text-[13px] leading-relaxed text-primary-foreground">
                  {log.user_message}
                </div>
              </div>

              {/* Assistant bubble */}
              <div className="flex gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                  IA
                </div>
                <div className="max-w-[80%] rounded-2xl rounded-tl-md border border-border/60 bg-muted/30 px-4 py-2.5 text-[13px] leading-relaxed text-foreground">
                  {log.assistant_message}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quality note */}
        <div className="mt-8 card-base p-4 border-dashed">
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            <span className="font-semibold text-foreground">Tip de entrenamiento:</span>{' '}
            Revisá las respuestas donde el asistente no pudo resolver la consulta. Esos patrones se pueden agregar como respuestas rápidas en{' '}
            <code className="font-mono text-primary bg-primary/8 px-1 rounded">ChatWidget.tsx → QUICK</code>.
          </p>
        </div>

      </main>
    </>
  )
}

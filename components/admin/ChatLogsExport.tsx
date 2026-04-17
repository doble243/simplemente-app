'use client'

interface ChatLog {
  id:                string
  session_id:        string
  user_message:      string
  assistant_message: string
  ip_hash:           string | null
  created_at:        string
}

interface Props {
  logs: ChatLog[]
}

export function ChatLogsExport({ logs }: Props) {
  function downloadJSON() {
    const payload = JSON.stringify(logs, null, 2)
    trigger(payload, 'application/json', 'chat_logs.json')
  }

  function downloadJSONL() {
    // Fine-tuning format: each line is {"messages":[{"role":"user","content":"..."},{"role":"assistant","content":"..."}]}
    const lines = logs.map(log =>
      JSON.stringify({
        messages: [
          { role: 'user',      content: log.user_message      },
          { role: 'assistant', content: log.assistant_message },
        ],
      })
    )
    trigger(lines.join('\n'), 'application/jsonl', 'chat_logs.jsonl')
  }

  function trigger(content: string, type: string, filename: string) {
    const blob = new Blob([content], { type })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={downloadJSONL}
        className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-background px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        title="Descargar en formato JSONL para fine-tuning"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 2v9M4.5 7.5 8 11l3.5-3.5M2.5 13.5h11" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        JSONL
      </button>
      <button
        onClick={downloadJSON}
        className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-background px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition-colors hover:text-foreground"
        title="Descargar como JSON completo"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 2v9M4.5 7.5 8 11l3.5-3.5M2.5 13.5h11" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        JSON
      </button>
    </div>
  )
}

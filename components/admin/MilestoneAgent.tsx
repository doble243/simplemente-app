'use client'

import { useState } from 'react'
import { Sparkles, Loader2, ChevronDown, ChevronUp, Clock, AlertTriangle, CheckSquare } from 'lucide-react'

interface AgentResult {
  brief: string
  subtasks: string[]
  estimate: string
  priority: 'alta' | 'media' | 'baja'
  notes: string | null
}

interface Props {
  taskTitle: string
  projectName: string
  projectType?: string
  projectDescription?: string
}

const PRIORITY_STYLE: Record<string, string> = {
  alta:  'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  media: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  baja:  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
}

export function MilestoneAgent({ taskTitle, projectName, projectType, projectDescription }: Props) {
  const [result, setResult] = useState<AgentResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function run() {
    if (result) { setOpen(o => !o); return }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/task-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskTitle, projectName, projectType, projectDescription }),
      })
      if (!res.ok) throw new Error('Error del agente')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResult(data)
      setOpen(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-1.5 rounded-lg border border-purple-200/60 bg-purple-50/40 dark:border-purple-800/30 dark:bg-purple-950/20">
      <button
        onClick={run}
        disabled={loading}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-xs font-medium text-purple-700 dark:text-purple-300 hover:bg-purple-100/50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
      >
        <span className="flex items-center gap-1.5">
          {loading
            ? <Loader2 className="h-3 w-3 animate-spin" />
            : <Sparkles className="h-3 w-3" />}
          {loading ? 'Analizando tarea...' : result ? 'Ver análisis IA' : 'Analizar con IA'}
        </span>
        {result && (open
          ? <ChevronUp className="h-3 w-3" />
          : <ChevronDown className="h-3 w-3" />
        )}
      </button>

      {error && (
        <p className="px-3 pb-2 text-xs text-destructive">{error}</p>
      )}

      {open && result && (
        <div className="border-t border-purple-200/60 dark:border-purple-800/30 px-3 py-3 space-y-3">
          {/* Header badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLE[result.priority] ?? PRIORITY_STYLE.media}`}>
              Prioridad {result.priority}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />{result.estimate}
            </span>
          </div>

          {/* Brief */}
          <p className="text-xs text-foreground/80 leading-relaxed">{result.brief}</p>

          {/* Sub-tasks */}
          {result.subtasks.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <CheckSquare className="h-3 w-3" />Sub-tareas
              </p>
              <ul className="space-y-0.5">
                {result.subtasks.map((st, i) => (
                  <li key={i} className="text-xs text-foreground/70 flex items-start gap-1.5">
                    <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                    {st}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Notes */}
          {result.notes && (
            <div className="flex items-start gap-1.5 rounded bg-yellow-50 dark:bg-yellow-900/20 px-2.5 py-1.5">
              <AlertTriangle className="h-3 w-3 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-700 dark:text-yellow-300">{result.notes}</p>
            </div>
          )}

          {/* Regenerate */}
          <button
            onClick={() => { setResult(null); setOpen(false); }}
            className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
          >
            Regenerar análisis
          </button>
        </div>
      )}
    </div>
  )
}

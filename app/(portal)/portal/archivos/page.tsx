import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Download, FileText, Image, File } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils/dates'

function getFileIcon(mimeType: string | null) {
  if (!mimeType) return File
  if (mimeType.startsWith('image/')) return Image
  if (mimeType === 'application/pdf') return FileText
  return File
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default async function PortalArchivosPage() {
  const isDemo = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').includes('placeholder')
  if (isDemo) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Archivos</h1>
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-lg font-semibold text-foreground mb-2">Modo demo — sin Supabase</p>
          <p className="text-sm text-muted-foreground">Conectá Supabase para ver los archivos disponibles.</p>
        </div>
      </div>
    )
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabase.from('clients').select('id').eq('profile_id', user.id).single()
  if (!client) redirect('/portal')

  const { data: files } = await supabase
    .from('files')
    .select('id, name, description, storage_path, file_size, mime_type, category, created_at')
    .eq('client_id', client.id)
    .eq('visible_to_client', true)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Archivos</h1>

      {(files ?? []).length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <File className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-muted-foreground">Todavía no hay archivos disponibles.</p>
        </div>
      ) : (
        <div className="rounded-xl border bg-card overflow-hidden">
          {(files ?? []).map((file) => {
            const Icon = getFileIcon(file.mime_type)
            const { data: { publicUrl } } = supabase.storage
              .from('deliverables')
              .getPublicUrl(file.storage_path)

            return (
              <div key={file.id} className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-accent transition-colors">
                <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{formatDate(file.created_at)}</span>
                    {file.file_size && (
                      <span className="text-xs text-muted-foreground">{formatBytes(file.file_size)}</span>
                    )}
                    <Badge variant="secondary" className="text-xs">{file.category}</Badge>
                  </div>
                  {file.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{file.description}</p>
                  )}
                </div>
                <a
                  href={publicUrl}
                  download={file.name}
                  className="flex-shrink-0 p-2 text-muted-foreground hover:text-primary transition-colors"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

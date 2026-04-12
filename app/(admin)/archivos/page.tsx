'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Topbar } from '@/components/admin/Topbar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, Image, File, Trash2, Loader2 } from 'lucide-react'
import { formatDate } from '@/lib/utils/dates'

interface FileRecord {
  id: string
  name: string
  description: string | null
  storage_path: string
  file_size: number | null
  mime_type: string | null
  category: string
  visible_to_client: boolean
  created_at: string
  client_id: string | null
  clients: unknown
}

interface Client {
  id: string
  company_name: string
}

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

export default function ArchivosPage() {
  const supabase = createClient()
  const [files, setFiles] = useState<FileRecord[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [selectedClient, setSelectedClient] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadFiles()
    supabase.from('clients').select('id, company_name').order('company_name').then(({ data }) => setClients(data ?? []))
  }, [])

  async function loadFiles() {
    const { data } = await supabase
      .from('files')
      .select('*, clients(company_name)')
      .order('created_at', { ascending: false })
    setFiles((data ?? []) as FileRecord[])
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)

    const path = `${selectedClient || 'general'}/${Date.now()}-${file.name}`
    const { error: uploadErr } = await supabase.storage.from('deliverables').upload(path, file)
    if (uploadErr) { setError(uploadErr.message); setUploading(false); return }

    await supabase.from('files').insert({
      client_id: selectedClient || null,
      name: file.name,
      storage_path: path,
      file_size: file.size,
      mime_type: file.type,
      category: 'entregable',
      visible_to_client: !!selectedClient,
    })

    await loadFiles()
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function deleteFile(file: FileRecord) {
    if (!confirm(`¿Eliminar "${file.name}"?`)) return
    await supabase.storage.from('deliverables').remove([file.storage_path])
    await supabase.from('files').delete().eq('id', file.id)
    setFiles(prev => prev.filter(f => f.id !== file.id))
  }

  return (
    <>
      <Topbar title="Archivos" />
      <main className="p-6 max-w-4xl">
        {/* Upload bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-xl border bg-card">
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="flex h-9 rounded-md border bg-card px-3 py-1 text-sm shadow-sm w-48"
          >
            <option value="">Sin cliente</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.company_name}</option>)}
          </select>
          <input
            type="file"
            ref={fileRef}
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
            id="file-upload"
          />
          <Button asChild variant="outline" size="sm" className="gap-2 cursor-pointer" disabled={uploading}>
            <label htmlFor="file-upload">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Subir archivo
            </label>
          </Button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>

        {/* File list */}
        <div className="rounded-xl border bg-card overflow-hidden">
          {files.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">Sin archivos todavía.</p>
          ) : (
            files.map((file) => {
              const Icon = getFileIcon(file.mime_type)
              const client = file.clients as { company_name: string } | null
              const { data: { publicUrl } } = supabase.storage.from('deliverables').getPublicUrl(file.storage_path)
              return (
                <div key={file.id} className="flex items-center gap-3 px-4 py-3 border-b last:border-b-0 hover:bg-accent transition-colors">
                  <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground hover:underline truncate block">
                      {file.name}
                    </a>
                    <div className="flex items-center gap-2 mt-0.5">
                      {client && <span className="text-xs text-muted-foreground">{client.company_name}</span>}
                      <span className="text-xs text-gray-300">{formatDate(file.created_at)}</span>
                      {file.file_size && <span className="text-xs text-gray-300">{formatBytes(file.file_size)}</span>}
                      <Badge variant="secondary" className="text-xs">{file.category}</Badge>
                      {file.visible_to_client && <Badge variant="outline" className="text-xs text-green-600">Visible al cliente</Badge>}
                    </div>
                  </div>
                  <button onClick={() => deleteFile(file)} className="flex-shrink-0 p-1.5 text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )
            })
          )}
        </div>
      </main>
    </>
  )
}

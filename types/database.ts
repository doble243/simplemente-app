export type UserRole = 'admin' | 'client'
export type ClientStatus = 'active' | 'inactive' | 'prospect'
export type ProjectStatus = 'lead' | 'proposal' | 'active' | 'review' | 'completed' | 'paused' | 'cancelled'
export type ProjectType = 'web_landing' | 'web_app' | 'ecommerce' | 'branding' | 'seo' | 'maintenance'
export type MilestoneStatus = 'pending' | 'in_progress' | 'completed' | 'blocked'
export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled'
export type CurrencyType = 'UYU' | 'USD'
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost'
export type LeadSource = 'landing_form' | 'chatbot' | 'referral' | 'social' | 'direct'
export type FileCategory = 'deliverable' | 'asset' | 'contract' | 'invoice' | 'other'
export type AIConversationType = 'chatbot' | 'lead_qualify' | 'quote' | 'project_summary' | 'portal_assist'

export interface Profile {
  id: string
  role: UserRole
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  company: string | null
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  profile_id: string | null
  company_name: string
  rut: string | null
  email: string
  phone: string | null
  address: string | null
  city: string | null
  country: string
  notes: string | null
  status: ClientStatus
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  client_id: string
  name: string
  slug: string | null
  description: string | null
  status: ProjectStatus
  type: ProjectType
  url: string | null
  budget: number | null
  currency: CurrencyType
  start_date: string | null
  end_date: string | null
  progress: number
  cover_image: string | null
  is_public: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Milestone {
  id: string
  project_id: string
  title: string
  description: string | null
  status: MilestoneStatus
  due_date: string | null
  completed_at: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  client_id: string
  project_id: string | null
  invoice_number: string
  status: InvoiceStatus
  currency: CurrencyType
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  issued_date: string
  due_date: string | null
  paid_at: string | null
  payment_method: string | null
  payment_link: string | null
  notes: string | null
  pdf_url: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  amount: number
  sort_order: number
  created_at: string
}

export interface Lead {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  source: LeadSource
  message: string | null
  project_type: string | null
  budget_range: string | null
  status: LeadStatus
  score: number | null
  ai_notes: string | null
  next_action: string | null
  assigned_to: string | null
  converted_to: string | null
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  project_id: string | null
  client_id: string
  sender_id: string
  content: string
  is_from_client: boolean
  read_at: string | null
  attachments: Array<{ name: string; url: string; size: number; type: string }>
  created_at: string
}

export interface File {
  id: string
  project_id: string | null
  client_id: string
  name: string
  description: string | null
  storage_path: string
  file_size: number | null
  mime_type: string | null
  category: FileCategory
  uploaded_by: string | null
  visible_to_client: boolean
  created_at: string
}

export interface AIConversation {
  id: string
  type: AIConversationType
  lead_id: string | null
  client_id: string | null
  project_id: string | null
  messages: Array<{ role: string; content: string }>
  metadata: Record<string, unknown>
  tokens_used: number | null
  created_at: string
}

export interface PortfolioItem {
  id: string
  project_id: string | null
  title: string
  slug: string
  description: string | null
  long_description: string | null
  tags: string[]
  cover_image: string | null
  gallery: string[]
  url: string | null
  featured: boolean
  sort_order: number
  published: boolean
  created_at: string
  updated_at: string
}

// Joined types
export interface ProjectWithClient extends Project {
  clients: Pick<Client, 'id' | 'company_name' | 'email'>
}

export interface InvoiceWithClient extends Invoice {
  clients: Pick<Client, 'id' | 'company_name' | 'email'>
  invoice_items: InvoiceItem[]
}

export interface ProjectWithMilestones extends Project {
  milestones: Milestone[]
}

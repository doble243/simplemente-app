-- ============================================================
-- 0001_initial_schema.sql
-- Simplemente — Agencia web Uruguay
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE user_role AS ENUM ('admin', 'client');
CREATE TYPE client_status AS ENUM ('active', 'inactive', 'prospect');
CREATE TYPE project_status AS ENUM ('lead', 'proposal', 'active', 'review', 'completed', 'paused', 'cancelled');
CREATE TYPE project_type AS ENUM ('web_landing', 'web_app', 'ecommerce', 'branding', 'seo', 'maintenance');
CREATE TYPE milestone_status AS ENUM ('pending', 'in_progress', 'completed', 'blocked');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled');
CREATE TYPE currency_type AS ENUM ('UYU', 'USD');
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost');
CREATE TYPE lead_source AS ENUM ('landing_form', 'chatbot', 'referral', 'social', 'direct');
CREATE TYPE file_category AS ENUM ('deliverable', 'asset', 'contract', 'invoice', 'other');
CREATE TYPE ai_conversation_type AS ENUM ('chatbot', 'lead_qualify', 'quote', 'project_summary', 'portal_assist');

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================

CREATE TABLE profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role          user_role NOT NULL DEFAULT 'client',
  full_name     text,
  avatar_url    text,
  phone         text,
  company       text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Auto-create profile on new user
-- SECURITY DEFINER needs explicit search_path on PG15+ (search_path='' by default)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- CLIENTS
-- ============================================================

CREATE TABLE clients (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    uuid REFERENCES profiles(id) ON DELETE SET NULL,
  company_name  text NOT NULL,
  rut           text,
  email         text NOT NULL,
  phone         text,
  address       text,
  city          text,
  country       text NOT NULL DEFAULT 'Uruguay',
  notes         text,
  status        client_status NOT NULL DEFAULT 'active',
  created_by    uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_clients_profile_id ON clients(profile_id);
CREATE INDEX idx_clients_status ON clients(status);

-- ============================================================
-- PROJECTS
-- ============================================================

CREATE TABLE projects (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id     uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name          text NOT NULL,
  slug          text UNIQUE,
  description   text,
  status        project_status NOT NULL DEFAULT 'active',
  type          project_type NOT NULL DEFAULT 'web_landing',
  url           text,
  budget        numeric(12,2),
  currency      currency_type NOT NULL DEFAULT 'USD',
  start_date    date,
  end_date      date,
  progress      integer NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  cover_image   text,
  is_public     boolean NOT NULL DEFAULT false,
  created_by    uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_slug ON projects(slug);

-- ============================================================
-- MILESTONES
-- ============================================================

CREATE TABLE milestones (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title         text NOT NULL,
  description   text,
  status        milestone_status NOT NULL DEFAULT 'pending',
  due_date      date,
  completed_at  timestamptz,
  sort_order    integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER milestones_updated_at
  BEFORE UPDATE ON milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_milestones_project_id ON milestones(project_id);

-- ============================================================
-- INVOICES
-- ============================================================

CREATE TABLE invoices (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  project_id      uuid REFERENCES projects(id) ON DELETE SET NULL,
  invoice_number  text UNIQUE NOT NULL,
  status          invoice_status NOT NULL DEFAULT 'draft',
  currency        currency_type NOT NULL DEFAULT 'USD',
  subtotal        numeric(12,2) NOT NULL DEFAULT 0,
  tax_rate        numeric(5,2) NOT NULL DEFAULT 0,
  tax_amount      numeric(12,2) NOT NULL DEFAULT 0,
  total           numeric(12,2) NOT NULL DEFAULT 0,
  issued_date     date NOT NULL DEFAULT CURRENT_DATE,
  due_date        date,
  paid_at         timestamptz,
  payment_method  text,
  payment_link    text,
  notes           text,
  pdf_url         text,
  created_by      uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- ============================================================
-- INVOICE ITEMS
-- ============================================================

CREATE TABLE invoice_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id    uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description   text NOT NULL,
  quantity      numeric(10,2) NOT NULL DEFAULT 1,
  unit_price    numeric(12,2) NOT NULL DEFAULT 0,
  amount        numeric(12,2) NOT NULL DEFAULT 0,
  sort_order    integer NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- ============================================================
-- LEADS
-- ============================================================

CREATE TABLE leads (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text NOT NULL,
  email         text,
  phone         text,
  company       text,
  source        lead_source NOT NULL DEFAULT 'landing_form',
  message       text,
  project_type  text,
  budget_range  text,
  status        lead_status NOT NULL DEFAULT 'new',
  score         integer DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  ai_notes      text,
  next_action   text,
  assigned_to   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  converted_to  uuid REFERENCES clients(id) ON DELETE SET NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_source ON leads(source);

-- ============================================================
-- MESSAGES (chat cliente <-> agencia)
-- ============================================================

CREATE TABLE messages (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      uuid REFERENCES projects(id) ON DELETE CASCADE,
  client_id       uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  sender_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content         text NOT NULL,
  is_from_client  boolean NOT NULL DEFAULT true,
  read_at         timestamptz,
  attachments     jsonb NOT NULL DEFAULT '[]',
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_messages_client_id ON messages(client_id);
CREATE INDEX idx_messages_project_id ON messages(project_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);

-- ============================================================
-- FILES (entregables en Supabase Storage)
-- ============================================================

CREATE TABLE files (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id          uuid REFERENCES projects(id) ON DELETE CASCADE,
  client_id           uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name                text NOT NULL,
  description         text,
  storage_path        text NOT NULL,
  file_size           bigint,
  mime_type           text,
  category            file_category NOT NULL DEFAULT 'deliverable',
  uploaded_by         uuid REFERENCES profiles(id) ON DELETE SET NULL,
  visible_to_client   boolean NOT NULL DEFAULT true,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_files_client_id ON files(client_id);
CREATE INDEX idx_files_project_id ON files(project_id);

-- ============================================================
-- AI CONVERSATIONS (log de todas las interacciones IA)
-- ============================================================

CREATE TABLE ai_conversations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type          ai_conversation_type NOT NULL,
  lead_id       uuid REFERENCES leads(id) ON DELETE SET NULL,
  client_id     uuid REFERENCES clients(id) ON DELETE SET NULL,
  project_id    uuid REFERENCES projects(id) ON DELETE SET NULL,
  messages      jsonb NOT NULL DEFAULT '[]',
  metadata      jsonb NOT NULL DEFAULT '{}',
  tokens_used   integer DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_conversations_type ON ai_conversations(type);
CREATE INDEX idx_ai_conversations_lead_id ON ai_conversations(lead_id);
CREATE INDEX idx_ai_conversations_client_id ON ai_conversations(client_id);

-- ============================================================
-- PORTFOLIO ITEMS
-- ============================================================

CREATE TABLE portfolio_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id        uuid REFERENCES projects(id) ON DELETE SET NULL,
  title             text NOT NULL,
  slug              text UNIQUE NOT NULL,
  description       text,
  long_description  text,
  tags              text[] NOT NULL DEFAULT '{}',
  cover_image       text,
  gallery           text[] NOT NULL DEFAULT '{}',
  url               text,
  featured          boolean NOT NULL DEFAULT false,
  sort_order        integer NOT NULL DEFAULT 0,
  published         boolean NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER portfolio_items_updated_at
  BEFORE UPDATE ON portfolio_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_portfolio_items_published ON portfolio_items(published);
CREATE INDEX idx_portfolio_items_featured ON portfolio_items(featured);

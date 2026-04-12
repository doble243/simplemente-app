-- ============================================================
-- 0002_rls_policies.sql
-- Row Level Security policies
-- ============================================================

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- Helper function: get current user's client_id
CREATE OR REPLACE FUNCTION get_user_client_id()
RETURNS uuid AS $$
  SELECT id FROM public.clients WHERE profile_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

-- ============================================================
-- PROFILES
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin" ON profiles
  FOR SELECT USING (get_user_role() = 'admin');

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- CLIENTS
-- ============================================================
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_select_admin" ON clients
  FOR SELECT USING (get_user_role() = 'admin');

CREATE POLICY "clients_select_own" ON clients
  FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "clients_insert_admin" ON clients
  FOR INSERT WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "clients_update_admin" ON clients
  FOR UPDATE USING (get_user_role() = 'admin');

CREATE POLICY "clients_delete_admin" ON clients
  FOR DELETE USING (get_user_role() = 'admin');

-- ============================================================
-- PROJECTS
-- ============================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select_admin" ON projects
  FOR SELECT USING (get_user_role() = 'admin');

CREATE POLICY "projects_select_client" ON projects
  FOR SELECT USING (client_id = get_user_client_id());

CREATE POLICY "projects_insert_admin" ON projects
  FOR INSERT WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "projects_update_admin" ON projects
  FOR UPDATE USING (get_user_role() = 'admin');

CREATE POLICY "projects_delete_admin" ON projects
  FOR DELETE USING (get_user_role() = 'admin');

-- ============================================================
-- MILESTONES
-- ============================================================
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "milestones_select_admin" ON milestones
  FOR SELECT USING (get_user_role() = 'admin');

CREATE POLICY "milestones_select_client" ON milestones
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE client_id = get_user_client_id()
    )
  );

CREATE POLICY "milestones_insert_admin" ON milestones
  FOR INSERT WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "milestones_update_admin" ON milestones
  FOR UPDATE USING (get_user_role() = 'admin');

CREATE POLICY "milestones_delete_admin" ON milestones
  FOR DELETE USING (get_user_role() = 'admin');

-- ============================================================
-- INVOICES
-- ============================================================
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_select_admin" ON invoices
  FOR SELECT USING (get_user_role() = 'admin');

CREATE POLICY "invoices_select_client" ON invoices
  FOR SELECT USING (client_id = get_user_client_id());

CREATE POLICY "invoices_insert_admin" ON invoices
  FOR INSERT WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "invoices_update_admin" ON invoices
  FOR UPDATE USING (get_user_role() = 'admin');

CREATE POLICY "invoices_delete_admin" ON invoices
  FOR DELETE USING (get_user_role() = 'admin');

-- ============================================================
-- INVOICE ITEMS
-- ============================================================
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoice_items_select_admin" ON invoice_items
  FOR SELECT USING (get_user_role() = 'admin');

CREATE POLICY "invoice_items_select_client" ON invoice_items
  FOR SELECT USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE client_id = get_user_client_id()
    )
  );

CREATE POLICY "invoice_items_all_admin" ON invoice_items
  FOR ALL USING (get_user_role() = 'admin');

-- ============================================================
-- LEADS
-- ============================================================
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Public can insert (contact form / chatbot)
CREATE POLICY "leads_insert_public" ON leads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "leads_select_admin" ON leads
  FOR SELECT USING (get_user_role() = 'admin');

CREATE POLICY "leads_update_admin" ON leads
  FOR UPDATE USING (get_user_role() = 'admin');

CREATE POLICY "leads_delete_admin" ON leads
  FOR DELETE USING (get_user_role() = 'admin');

-- ============================================================
-- MESSAGES
-- ============================================================
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select_admin" ON messages
  FOR SELECT USING (get_user_role() = 'admin');

CREATE POLICY "messages_select_client" ON messages
  FOR SELECT USING (client_id = get_user_client_id());

CREATE POLICY "messages_insert_admin" ON messages
  FOR INSERT WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "messages_insert_client" ON messages
  FOR INSERT WITH CHECK (client_id = get_user_client_id());

CREATE POLICY "messages_update_own" ON messages
  FOR UPDATE USING (sender_id = auth.uid());

-- ============================================================
-- FILES
-- ============================================================
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "files_select_admin" ON files
  FOR SELECT USING (get_user_role() = 'admin');

CREATE POLICY "files_select_client" ON files
  FOR SELECT USING (
    client_id = get_user_client_id()
    AND visible_to_client = true
  );

CREATE POLICY "files_all_admin" ON files
  FOR ALL USING (get_user_role() = 'admin');

-- ============================================================
-- AI CONVERSATIONS (admin only)
-- ============================================================
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_conversations_all_admin" ON ai_conversations
  FOR ALL USING (get_user_role() = 'admin');

-- ============================================================
-- PORTFOLIO ITEMS (public read, admin write)
-- ============================================================
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "portfolio_select_published" ON portfolio_items
  FOR SELECT USING (published = true OR get_user_role() = 'admin');

CREATE POLICY "portfolio_all_admin" ON portfolio_items
  FOR ALL USING (get_user_role() = 'admin');

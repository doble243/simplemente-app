-- ============================================================
-- 0003_storage_buckets.sql
-- Supabase Storage buckets & policies
-- ============================================================

-- Create buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('portfolio',      'portfolio',      true,  52428800, ARRAY['image/jpeg','image/png','image/webp','image/gif']),
  ('deliverables',   'deliverables',   false, 524288000, NULL),
  ('avatars',        'avatars',        false, 5242880,  ARRAY['image/jpeg','image/png','image/webp']),
  ('invoices-pdf',   'invoices-pdf',   false, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PORTFOLIO bucket (public read)
-- ============================================================
CREATE POLICY "portfolio_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio');

CREATE POLICY "portfolio_admin_write" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'portfolio'
    AND get_user_role() = 'admin'
  );

CREATE POLICY "portfolio_admin_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'portfolio'
    AND get_user_role() = 'admin'
  );

CREATE POLICY "portfolio_admin_delete" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'portfolio'
    AND get_user_role() = 'admin'
  );

-- ============================================================
-- DELIVERABLES bucket (client sees own files)
-- Path convention: deliverables/{client_id}/{project_id}/{filename}
-- ============================================================
CREATE POLICY "deliverables_admin_all" ON storage.objects
  FOR ALL USING (
    bucket_id = 'deliverables'
    AND get_user_role() = 'admin'
  );

CREATE POLICY "deliverables_client_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'deliverables'
    AND (storage.foldername(name))[1] = get_user_client_id()::text
  );

-- ============================================================
-- AVATARS bucket (owner can read/write)
-- ============================================================
CREATE POLICY "avatars_authenticated_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "avatars_owner_write" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "avatars_owner_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- INVOICES-PDF bucket (client sees own, admin sees all)
-- Path convention: invoices-pdf/{client_id}/{invoice_number}.pdf
-- ============================================================
CREATE POLICY "invoices_pdf_admin_all" ON storage.objects
  FOR ALL USING (
    bucket_id = 'invoices-pdf'
    AND get_user_role() = 'admin'
  );

CREATE POLICY "invoices_pdf_client_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'invoices-pdf'
    AND (storage.foldername(name))[1] = get_user_client_id()::text
  );

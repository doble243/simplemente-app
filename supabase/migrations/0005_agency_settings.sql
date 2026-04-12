-- 0005_agency_settings.sql
-- Singleton table for agency configuration (used in invoice headers, emails, etc.)

CREATE TABLE IF NOT EXISTS agency_settings (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_name    text NOT NULL DEFAULT 'Simplemente',
  email          text NOT NULL DEFAULT 'hola@simplemente.uy',
  phone          text,
  address        text DEFAULT 'Montevideo, Uruguay',
  rut            text,
  website        text DEFAULT 'https://simplemente.uy',
  invoice_footer text DEFAULT 'Gracias por su confianza en Simplemente.',
  payment_terms  text DEFAULT 'Pago a 30 días de la fecha de emisión.',
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- Only admins can read/write agency settings
ALTER TABLE agency_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_full_access_agency_settings" ON agency_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Reuse the update_updated_at trigger function (defined in 0001_initial_schema.sql)
CREATE TRIGGER agency_settings_updated_at
  BEFORE UPDATE ON agency_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed one singleton row
INSERT INTO agency_settings DEFAULT VALUES;

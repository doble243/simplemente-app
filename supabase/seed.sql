-- =============================================================
-- seed.sql — Datos de desarrollo local
-- Se ejecuta tras cada `supabase db reset`
-- =============================================================

-- ---------------------------------------------------------------
-- Admin de desarrollo
-- Email: admin@simplemente.uy  |  Password: admin123456
-- ---------------------------------------------------------------
DO $$
DECLARE
  admin_id uuid := gen_random_uuid();
BEGIN
  -- Insertar en auth.users con todos los campos NOT NULL
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    confirmation_token,
    recovery_token,
    email_change,
    email_change_token_new,
    email_change_token_current,
    phone_change,
    phone_change_token,
    reauthentication_token,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    created_at,
    updated_at
  ) VALUES (
    admin_id,
    '00000000-0000-0000-0000-000000000000',
    'admin@simplemente.uy',
    crypt('admin123456', gen_salt('bf')),
    now(),
    '', '', '', '', '', '', '', '',   -- token columns vacíos (nunca NULL)
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Waldemini"}',
    'authenticated',
    'authenticated',
    now(),
    now()
  )
  ON CONFLICT (email) DO NOTHING;

  -- Si ya existe, obtener su id
  SELECT id INTO admin_id FROM auth.users WHERE email = 'admin@simplemente.uy';

  -- Identidad para login por email
  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    admin_id,
    admin_id,
    'admin@simplemente.uy',
    jsonb_build_object('sub', admin_id::text, 'email', 'admin@simplemente.uy'),
    'email',
    now(), now(), now()
  )
  ON CONFLICT DO NOTHING;

  -- Elevar a rol admin en profiles (el trigger crea el registro como 'client')
  UPDATE public.profiles
  SET role = 'admin', full_name = 'Waldemini'
  WHERE id = admin_id;

END $$;

-- ============================================================
-- 0004_seed_projects.sql
-- Seed: 4 proyectos activos reales de Simplemente
-- IMPORTANT: Run this AFTER creating the admin user in Supabase Auth
-- Replace 'YOUR_ADMIN_USER_ID' with the actual admin UUID
-- ============================================================

-- NOTE: Update this UUID after creating the admin account
DO $$
DECLARE
  admin_id uuid;
  client_worldcase uuid;
  client_contamina uuid;
  client_mente uuid;
  client_brillo uuid;
  project_worldcase uuid;
  project_contamina uuid;
  project_mente uuid;
  project_brillo uuid;
BEGIN

  -- Get admin profile (assumes admin user already exists)
  SELECT id INTO admin_id FROM profiles WHERE role = 'admin' LIMIT 1;
  IF admin_id IS NULL THEN
    RAISE NOTICE 'No admin profile found. Seed skipped. Create admin user first.';
    RETURN;
  END IF;

  -- Update admin profile
  UPDATE profiles SET full_name = 'Waldemini', company = 'Simplemente' WHERE id = admin_id;

  -- ---- CLIENTS ----

  INSERT INTO clients (id, company_name, email, status, created_by)
  VALUES (gen_random_uuid(), 'World Case UY', 'contacto@worldcaseuy.com', 'active', admin_id)
  RETURNING id INTO client_worldcase;

  INSERT INTO clients (id, company_name, email, status, created_by)
  VALUES (gen_random_uuid(), 'Contamina UY', 'contacto@contaminauy.com', 'active', admin_id)
  RETURNING id INTO client_contamina;

  INSERT INTO clients (id, company_name, email, status, created_by)
  VALUES (gen_random_uuid(), 'Mente Web', 'contacto@menteweb.com', 'active', admin_id)
  RETURNING id INTO client_mente;

  INSERT INTO clients (id, company_name, email, status, created_by)
  VALUES (gen_random_uuid(), 'Brillo Mágico UY', 'contacto@brillomagicouy.com', 'active', admin_id)
  RETURNING id INTO client_brillo;

  -- ---- PROJECTS ----

  INSERT INTO projects (id, client_id, name, slug, description, status, type, url, progress, is_public, created_by)
  VALUES (
    gen_random_uuid(), client_worldcase,
    'World Case UY', 'worldcaseuy',
    'Tienda online de accesorios para celulares en Uruguay. Diseño moderno, catálogo de productos y proceso de compra optimizado.',
    'completed', 'web_landing', 'https://www.worldcaseuy.com', 100, true, admin_id
  ) RETURNING id INTO project_worldcase;

  INSERT INTO projects (id, client_id, name, slug, description, status, type, url, progress, is_public, created_by)
  VALUES (
    gen_random_uuid(), client_contamina,
    'Contamina UY', 'contaminauy',
    'Sitio web para organización ambiental uruguaya. Información sobre contaminación, denuncias ciudadanas y concientización.',
    'completed', 'web_landing', 'https://www.contaminauy.com', 100, true, admin_id
  ) RETURNING id INTO project_contamina;

  INSERT INTO projects (id, client_id, name, slug, description, status, type, url, progress, is_public, created_by)
  VALUES (
    gen_random_uuid(), client_mente,
    'Mente Web', 'menteweb',
    'Plataforma de bienestar mental y meditación. Recursos, artículos y comunidad online para Uruguay.',
    'completed', 'web_app', 'https://www.menteweb.com', 100, true, admin_id
  ) RETURNING id INTO project_mente;

  INSERT INTO projects (id, client_id, name, slug, description, status, type, url, progress, is_public, created_by)
  VALUES (
    gen_random_uuid(), client_brillo,
    'Brillo Mágico UY', 'brillomagicouy',
    'Landing page para empresa de limpieza y cuidado del hogar en Uruguay. Servicios, presupuestos online y agenda de turnos.',
    'active', 'web_landing', 'https://www.brillomagicouy.com', 85, true, admin_id
  ) RETURNING id INTO project_brillo;

  -- ---- MILESTONES: World Case ----
  INSERT INTO milestones (project_id, title, status, sort_order) VALUES
    (project_worldcase, 'Briefing y diseño UX/UI', 'completed', 1),
    (project_worldcase, 'Desarrollo frontend', 'completed', 2),
    (project_worldcase, 'Catálogo de productos', 'completed', 3),
    (project_worldcase, 'Integración MercadoPago', 'completed', 4),
    (project_worldcase, 'Testing y lanzamiento', 'completed', 5);

  -- ---- MILESTONES: Contamina ----
  INSERT INTO milestones (project_id, title, status, sort_order) VALUES
    (project_contamina, 'Relevamiento y diseño', 'completed', 1),
    (project_contamina, 'Desarrollo del sitio', 'completed', 2),
    (project_contamina, 'Sistema de denuncias', 'completed', 3),
    (project_contamina, 'Lanzamiento', 'completed', 4);

  -- ---- MILESTONES: Mente Web ----
  INSERT INTO milestones (project_id, title, status, sort_order) VALUES
    (project_mente, 'Diseño de la plataforma', 'completed', 1),
    (project_mente, 'Desarrollo frontend', 'completed', 2),
    (project_mente, 'Módulo de artículos', 'completed', 3),
    (project_mente, 'Comunidad / foros', 'completed', 4),
    (project_mente, 'Lanzamiento', 'completed', 5);

  -- ---- MILESTONES: Brillo Mágico ----
  INSERT INTO milestones (project_id, title, status, sort_order) VALUES
    (project_brillo, 'Briefing y diseño', 'completed', 1),
    (project_brillo, 'Desarrollo landing', 'completed', 2),
    (project_brillo, 'Formulario de presupuestos', 'completed', 3),
    (project_brillo, 'Sistema de agenda de turnos', 'in_progress', 4),
    (project_brillo, 'Testing y lanzamiento', 'pending', 5);

  -- ---- PORTFOLIO ITEMS ----
  INSERT INTO portfolio_items (project_id, title, slug, description, long_description, tags, url, featured, sort_order, published)
  VALUES
    (
      project_worldcase,
      'World Case UY',
      'worldcaseuy',
      'Tienda online de accesorios para celulares en Uruguay.',
      'Desarrollamos una tienda online moderna para World Case UY, especializada en fundas y accesorios para smartphones. El proyecto incluyó diseño UX/UI desde cero, catálogo dinámico de productos, carrito de compras y pasarela de pago integrada con MercadoPago. El resultado fue un aumento del 40% en ventas online.',
      ARRAY['ecommerce', 'ux/ui', 'mercadopago', 'next.js'],
      'https://www.worldcaseuy.com', true, 1, true
    ),
    (
      project_contamina,
      'Contamina UY',
      'contaminauy',
      'Plataforma ambiental para Uruguay.',
      'Sitio web para organización que monitorea y denuncia la contaminación en Uruguay. Incluye mapa interactivo de puntos de contaminación, formulario de denuncias ciudadanas, blog de concientización y panel de estadísticas públicas.',
      ARRAY['web', 'social', 'mapas', 'next.js'],
      'https://www.contaminauy.com', false, 2, true
    ),
    (
      project_mente,
      'Mente Web',
      'menteweb',
      'Plataforma de bienestar mental.',
      'Plataforma digital de bienestar mental y meditación para el mercado uruguayo. Desarrollamos un sistema de artículos con categorías, comunidad de usuarios con foros moderados, recursos descargables y newsletter. La plataforma alcanzó 500+ usuarios en el primer mes.',
      ARRAY['web app', 'bienestar', 'comunidad', 'next.js'],
      'https://www.menteweb.com', true, 3, true
    ),
    (
      project_brillo,
      'Brillo Mágico UY',
      'brillomagicouy',
      'Landing y sistema de turnos para empresa de limpieza.',
      'Landing page profesional para empresa de servicios de limpieza del hogar en Uruguay. Incluye presentación de servicios, galería de trabajos, formulario de cotización online y sistema de agenda de turnos. Actualmente en fase de testing final.',
      ARRAY['landing', 'servicios', 'reservas', 'next.js'],
      'https://www.brillomagicouy.com', false, 4, true
    );

  RAISE NOTICE 'Seed completado exitosamente.';

END $$;

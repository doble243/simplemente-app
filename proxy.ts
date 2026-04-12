import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  // Skip middleware if Supabase is not configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || supabaseUrl.includes('placeholder') || !supabaseKey || supabaseKey.includes('placeholder')) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session (important — don't remove)
  let user = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    return supabaseResponse
  }

  const pathname = request.nextUrl.pathname

  // Routes that require authentication
  const isAdminRoute = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/clientes') ||
    pathname.startsWith('/proyectos') ||
    pathname.startsWith('/facturas') ||
    pathname.startsWith('/leads') ||
    pathname.startsWith('/mensajes') ||
    pathname.startsWith('/archivos') ||
    pathname.startsWith('/reportes') ||
    pathname.startsWith('/configuracion')

  const isPortalRoute = pathname.startsWith('/portal')

  // Unauthenticated user trying to access protected routes
  if (!user && (isAdminRoute || isPortalRoute)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  // Authenticated user — check role-based access
  if (user && (isAdminRoute || isPortalRoute)) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role

    // Client trying to access admin routes
    if (isAdminRoute && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/portal'
      return NextResponse.redirect(url)
    }

    // Admin trying to access portal (redirect to admin dashboard)
    if (isPortalRoute && role === 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // Authenticated user on login page — redirect to their home
  if (user && pathname === '/login') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const url = request.nextUrl.clone()
    url.pathname = profile?.role === 'admin' ? '/dashboard' : '/portal'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

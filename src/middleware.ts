import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  console.log('\n\n=== MIDDLEWARE EXÉCUTÉ ===')
  console.log('URL:', req.nextUrl.pathname)
  
  // Créer une nouvelle réponse
  const res = NextResponse.next()
  
  // Créer le client Supabase avec les en-têtes de la requête
  const supabase = createMiddlewareClient({ req, res })

  try {
    // Afficher tous les cookies pour debug
    console.log('Tous les cookies:', req.cookies.getAll())

    // Récupérer et rafraîchir la session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('Erreur de session:', error)
    }

    console.log('Session:', session ? '✅ Authentifié' : '❌ Non authentifié')
    if (session) {
      console.log('User ID:', session.user.id)
    }

    // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
    if (!session && (
      req.nextUrl.pathname.startsWith('/documents') ||
      req.nextUrl.pathname.startsWith('/dashboard') ||
      req.nextUrl.pathname.startsWith('/my-documents')
    )) {
      // Redirection simple vers la page de login sans paramètre returnUrl
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Si l'utilisateur est connecté et essaie d'accéder à /login ou /register
    if (session && (
      req.nextUrl.pathname === '/login' ||
      req.nextUrl.pathname === '/register'
    )) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

  } catch (error) {
    console.error('Erreur dans le middleware:', error)
  }

  return res
}

// Spécifier les routes à protéger
export const config = {
  matcher: [
    '/documents/:path*',
    '/dashboard/:path*',
    '/my-documents/:path*',
    '/login',
    '/register'
  ]
} 
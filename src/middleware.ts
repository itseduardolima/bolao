import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from '@/lib/auth.config'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const session = req.auth
  const path = req.nextUrl.pathname

  const isAuthenticated = !!session?.user
  const hasNickname = session?.user?.hasNickname ?? false

  const isPublicPath =
    path === '/' ||
    path === '/jogos' ||
    path === '/pontuacao' ||
    path.startsWith('/grupos/entrar') || // landing de convite: visível deslogado
    path.startsWith('/api/auth') ||
    path.startsWith('/api/cron') ||
    path.startsWith('/api/games')

  const isApiPath = path.startsWith('/api/')

  // Regra 1: não autenticado tentando acessar rota protegida
  if (!isAuthenticated && !isPublicPath && path !== '/onboarding') {
    return NextResponse.redirect(new URL('/?login=1', req.url))
  }

  // Regra 2: autenticado sem nickname → forçar onboarding, preservando o
  // destino original (ex.: link de convite) via callbackUrl interno.
  if (isAuthenticated && !hasNickname && path !== '/onboarding' && !isApiPath) {
    const onboardingUrl = new URL('/onboarding', req.url)
    onboardingUrl.searchParams.set('callbackUrl', path + req.nextUrl.search)
    return NextResponse.redirect(onboardingUrl)
  }

  // Regra 3: autenticado com nickname tentando acessar /onboarding
  if (isAuthenticated && hasNickname && path === '/onboarding') {
    return NextResponse.redirect(new URL('/jogos', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

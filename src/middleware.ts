import NextAuth from 'next-auth'
import { NextResponse } from 'next/server'
import { authConfig } from '@/lib/auth.config'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const session = req.auth
  const path = req.nextUrl.pathname

  const isAuthenticated = !!session?.user
  const hasNickname = session?.user?.hasNickname ?? false

  // Páginas legais (LGPD): devem ser acessíveis deslogado E durante o onboarding
  // — o usuário precisa poder ler a política/termos que está aceitando.
  const isLegalPath = path === '/privacidade' || path === '/termos'

  const isPublicPath =
    path === '/' ||
    isLegalPath ||
    path.startsWith('/jogos') || // lista e detalhe de jogo: visíveis deslogado
    path === '/pontuacao' ||
    path.startsWith('/grupos/entrar') || // landing de convite: visível deslogado
    path.startsWith('/api/auth') ||
    path.startsWith('/api/cron') ||
    path.startsWith('/api/games') ||
    path.startsWith('/api/asaas') ||
    path.startsWith('/api/account') || // auth-gated no próprio handler (401 limpo)
    path.startsWith('/subscriptions/')

  const isApiPath = path.startsWith('/api/')

  // Regra 1: não autenticado tentando acessar rota protegida → home com prompt
  // de login, preservando o destino pretendido para voltar após autenticar.
  if (!isAuthenticated && !isPublicPath && path !== '/onboarding') {
    const loginUrl = new URL('/', req.url)
    loginUrl.searchParams.set('login', '1')
    loginUrl.searchParams.set('from', path + req.nextUrl.search)
    return NextResponse.redirect(loginUrl)
  }

  // Regra 2: autenticado sem nickname → forçar onboarding, preservando o
  // destino original (ex.: link de convite) via callbackUrl interno.
  if (isAuthenticated && !hasNickname && path !== '/onboarding' && !isApiPath && !isLegalPath) {
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

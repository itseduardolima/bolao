import type { NextAuthConfig } from 'next-auth'
import Google from 'next-auth/providers/google'

export const authConfig = {
  providers: [Google],
  pages: {
    signIn: '/',
  },
  callbacks: {
    jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!
        token.hasNickname = (user as { hasNickname?: boolean }).hasNickname ?? false
        token.nickname = (user as { nickname?: string | null }).nickname ?? null
      }
      if (trigger === 'update' && session) {
        if (typeof session.hasNickname === 'boolean') token.hasNickname = session.hasNickname
        if (typeof session.nickname === 'string') token.nickname = session.nickname
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.hasNickname = token.hasNickname as boolean
      session.user.nickname = token.nickname as string | null
      return session
    },
  },
} satisfies NextAuthConfig

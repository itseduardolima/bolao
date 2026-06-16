import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [Google],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id!
        token.hasNickname = user.hasNickname ?? false
        token.nickname = user.nickname ?? null
      }
      if (trigger === 'update' && session) {
        if (typeof session.hasNickname === 'boolean') token.hasNickname = session.hasNickname
        if (typeof session.nickname === 'string') token.nickname = session.nickname
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id
      session.user.hasNickname = token.hasNickname
      session.user.nickname = token.nickname
      return session
    },
  },
  pages: {
    signIn: '/',
  },
})

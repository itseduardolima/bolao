import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
  providers: [Google],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!
        token.hasNickname = user.hasNickname ?? false
        token.nickname = user.nickname ?? null
      }
      if (token.id && !token.hasNickname) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { hasNickname: true, nickname: true },
        })
        if (dbUser) {
          token.hasNickname = dbUser.hasNickname
          token.nickname = dbUser.nickname
        }
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

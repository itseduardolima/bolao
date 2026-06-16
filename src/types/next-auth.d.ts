import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      nickname: string | null
      hasNickname: boolean
    } & DefaultSession['user']
  }

  interface User {
    nickname?: string | null
    hasNickname?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    nickname: string | null
    hasNickname: boolean
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    id: string
    nickname: string | null
    hasNickname: boolean
  }
}

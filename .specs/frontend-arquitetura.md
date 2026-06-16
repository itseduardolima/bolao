# Arquitetura Frontend — Spec

## Visão Geral

Next.js 15 App Router com TypeScript e Tailwind. Páginas como views puras (só JSX), lógica encapsulada em hooks co-localizados. TanStack Query para fetching e cache. Zero biblioteca de componentes externa — tudo construído do zero com Tailwind.

---

## Estrutura de Pastas

```
src/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout: fonts, QueryClientProvider, Header
│   ├── page.tsx                      # / → Ranking (só JSX)
│   ├── useRanking.ts                 # Lógica do ranking
│   ├── jogos/
│   │   ├── page.tsx                  # /jogos → Listagem (só JSX)
│   │   ├── useGames.ts               # Lógica da listagem
│   │   └── [id]/
│   │       ├── page.tsx              # /jogos/[id] → Detalhe (só JSX)
│   │       └── useGame.ts            # Lógica do detalhe + palpite + polling
│   ├── perfil/
│   │   ├── page.tsx                  # /perfil (só JSX)
│   │   └── useProfile.ts             # Lógica do perfil
│   ├── onboarding/
│   │   ├── page.tsx                  # /onboarding (só JSX)
│   │   └── useOnboarding.ts          # Lógica do nickname
│   └── api/
│       ├── auth/[...nextauth]/       # NextAuth handler
│       ├── cron/sync/route.ts        # Cron endpoint
│       ├── games/[id]/live/route.ts  # Polling ao vivo
│       └── nickname/route.ts         # Check + POST nickname
├── components/
│   ├── ui/                           # Primitivos reutilizáveis
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Avatar.tsx
│   ├── game/                         # Componentes de jogo
│   │   ├── GameCard.tsx
│   │   ├── GameList.tsx
│   │   ├── ScoreBadge.tsx
│   │   └── LiveScore.tsx
│   ├── prediction/                   # Componentes de palpite
│   │   ├── PredictionForm.tsx
│   │   ├── PredictionCountdown.tsx
│   │   └── PredictionList.tsx
│   ├── ranking/                      # Componentes de ranking
│   │   ├── RankingTable.tsx
│   │   └── RankingRow.tsx
│   └── layout/                       # Estrutura das páginas
│       ├── Header.tsx
│       ├── Container.tsx
│       └── SectionTitle.tsx
├── lib/
│   ├── auth.ts                       # Config NextAuth
│   ├── prisma.ts                     # Singleton Prisma client
│   ├── scoring.ts                    # calculatePoints()
│   ├── sync.ts                       # Lógica de sync da API
│   ├── football-data.ts              # Cliente football-data.org
│   └── utils.ts                      # cn(), formatDate(), etc.
├── types/
│   └── index.ts                      # Tipos compartilhados
└── middleware.ts                      # Proteção de rotas
```

---

## Regra Page / Hook

**`page.tsx`:** apenas JSX. Sem `useState`, sem `fetch`, sem lógica de negócio. Importa o hook da mesma pasta e desestrutura o que precisa renderizar.

**`useX.ts`:** toda a lógica da página — TanStack Query, Server Actions, estado local (`useState`), derivações e handlers.

### Exemplo

```tsx
// app/perfil/page.tsx
'use client'
import { useProfile } from './useProfile'
import PredictionList from '@/components/prediction/PredictionList'
import SectionTitle from '@/components/layout/SectionTitle'

export default function PerfilPage() {
  const { predictions, totalPoints, isLoading } = useProfile()

  if (isLoading) return <div className="text-muted">Carregando...</div>

  return (
    <main>
      <SectionTitle>{totalPoints} pontos</SectionTitle>
      <PredictionList predictions={predictions} />
    </main>
  )
}
```

```ts
// app/perfil/useProfile.ts
'use client'
import { useQuery } from '@tanstack/react-query'

export function useProfile() {
  const { data, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => fetch('/api/profile').then(r => r.json()),
  })

  return {
    predictions: data?.predictions ?? [],
    totalPoints: data?.totalPoints ?? 0,
    isLoading,
  }
}
```

---

## Server vs Client Components

| Tipo | Quando usar | Marcador |
|------|-------------|---------|
| Server Component | Busca dados no servidor, sem interatividade | padrão (sem marcador) |
| Client Component | TanStack Query, useState, eventos, polling | `'use client'` no topo |

**Regra prática:** páginas com hook são sempre Client Components (`'use client'`). Componentes puramente visuais sem estado podem ser Server Components.

---

## Convenções de Nomenclatura

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Componentes | PascalCase | `GameCard.tsx` |
| Hooks de página | camelCase com `use` + nome da página | `useGames.ts` |
| Hooks de componente | camelCase com `use` + descrição | `useLiveScore.ts` |
| Funções utilitárias | camelCase | `calculatePoints()` |
| Constantes | UPPER_SNAKE_CASE | `CRON_SECRET` |
| Tipos / interfaces | PascalCase descritivo | `GameWithPrediction` |
| Query keys | array de strings | `['game', id, 'live']` |
| Rotas de API | kebab-case | `/api/cron/sync` |

---

## Anatomia de um Componente

```tsx
// 1. 'use client' se necessário
// 2. imports de bibliotecas externas
// 3. imports internos (@/components, @/lib, @/types)
// 4. tipos locais (type Props = {...})
// 5. export default function ComponentName(props: Props)
// 6. funções auxiliares locais abaixo (não exportadas)

'use client'

import { Clock } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { Game } from '@/types'

type GameCardProps = {
  game: Game
  prediction?: { homeScore: number; awayScore: number; points: number | null }
  className?: string
}

export default function GameCard({ game, prediction, className }: GameCardProps) {
  return (
    <div className={cn('bg-surface rounded-xl border border-border p-5', className)}>
      ...
    </div>
  )
}
```

---

## TanStack Query

### Setup (`app/layout.tsx`)

```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 2,
    },
  },
})

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </body>
    </html>
  )
}
```

### Query Keys Padronizadas

```ts
['games']                  // lista de todos os jogos
['game', id]               // jogo individual
['game', id, 'live']       // placar ao vivo (polling 30s)
['ranking']                // ranking geral
['profile']                // palpites + pontos do usuário logado
['prediction', gameId]     // palpite do usuário num jogo específico
```

### Polling Ao Vivo

```ts
// app/jogos/[id]/useGame.ts
useQuery({
  queryKey: ['game', id, 'live'],
  queryFn: () => fetch(`/api/games/${id}/live`).then(r => r.json()),
  refetchInterval: (query) =>
    query.state.data?.status === 'LIVE' ? 30_000 : false,
  enabled: game?.status === 'LIVE',
})
```

Polling ativa automaticamente quando o jogo está `LIVE` e para quando encerra.

### Mutation de Palpite

```ts
// app/jogos/[id]/useGame.ts
const mutation = useMutation({
  mutationFn: savePrediction,   // Server Action
  onSuccess: () => {
    setFeedback('success')
    queryClient.invalidateQueries({ queryKey: ['game', id] })
    queryClient.invalidateQueries({ queryKey: ['profile'] })
  },
  onError: (err: Error) => {
    setFeedback(err.message)
  },
})
```

---

## Utilitários (`lib/utils.ts`)

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Combina classes Tailwind com lógica condicional
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formata data para exibição (ex: "Segunda, 11 Jun")
export function formatGameDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(date)
}

// Formata horário local (ex: "15:00")
export function formatGameTime(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
```

---

## Tipos Compartilhados (`types/index.ts`)

```ts
export type GameStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED'

export type Game = {
  id: string
  homeTeam: string
  awayTeam: string
  homeFlag: string | null
  awayFlag: string | null
  startsAt: string       // ISO string (serializado do banco)
  status: GameStatus
  homeScore: number | null
  awayScore: number | null
  phase: string
  groupName: string | null
  venue: string | null
}

export type Prediction = {
  id: string
  gameId: string
  homeScore: number
  awayScore: number
  points: number | null  // null até o jogo encerrar
}

export type RankingEntry = {
  id: string
  nickname: string
  image: string | null
  totalPoints: number
  exactHits: number
  winnerHits: number
  gamesPlayed: number
}

export type GameWithPrediction = Game & {
  prediction: Prediction | null
}
```

---

## Regras Gerais de Código

- **Sem any:** TypeScript strict, sem `any` explícito
- **Sem comentários óbvios:** só comentar o "porquê", nunca o "o quê"
- **Imports absolutos:** sempre `@/components/...`, nunca `../../`
- **Props opcionais com `?`:** nunca `| undefined` explícito
- **Early return:** preferir retorno antecipado a blocos `if/else` aninhados
- **Sem lógica em JSX:** extrair para variável ou hook antes de renderizar
- **Sem index como key:** usar sempre `id` estável como key em listas

---

## Fora do Escopo

- Gerenciamento de estado global (Zustand, Redux, Context)
- Testes de componentes (Vitest/Testing Library)
- Storybook ou documentação de componentes
- SSR vs CSR por rota (todas as páginas com hook são Client)
- Lazy loading de rotas (Next.js já faz por padrão)

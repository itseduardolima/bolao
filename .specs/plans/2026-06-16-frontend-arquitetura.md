# Frontend Arquitetura — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar a base do projeto Next.js 15 com tema dark, fontes, ícones, TanStack Query, estrutura de pastas, tipos compartilhados, utilitários e componentes primitivos de UI e layout.

**Architecture:** Next.js 15 App Router com TypeScript strict e Tailwind CSS. Zero biblioteca de componentes externa — primitivos construídos do zero. TanStack Query como camada de cache/fetching. Páginas limpas com lógica em hooks co-localizados.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS v4, TanStack Query v5, Phosphor Icons, Barlow Condensed + Inter (Google Fonts), clsx, tailwind-merge.

---

## Arquivos que serão criados

```
src/
├── app/
│   ├── layout.tsx                  # Root layout com fontes, providers, Header
│   ├── globals.css                 # CSS variables do tema dark + reset
│   └── providers.tsx               # QueryClientProvider isolado
├── components/
│   ├── ui/
│   │   ├── Badge.tsx               # Badge de status e pontos
│   │   ├── Button.tsx              # Botão primário e variantes
│   │   ├── Input.tsx               # Input genérico e InputScore (placar)
│   │   └── Avatar.tsx              # Avatar com fallback de iniciais
│   └── layout/
│       ├── Header.tsx              # Header fixo com logo e nav
│       ├── Container.tsx           # Wrapper de largura máxima centralizado
│       └── SectionTitle.tsx        # Título de seção em Barlow Condensed
├── lib/
│   └── utils.ts                    # cn(), formatGameDate(), formatGameTime()
├── types/
│   └── index.ts                    # Game, Prediction, RankingEntry, GameWithPrediction
└── tailwind.config.ts              # Tema dark: cores, fontes, animações
```

---

### Task 1: Scaffold do projeto Next.js 15

**Files:**
- Create: projeto em `C:\Users\eduar\Desktop\projetos\bolao`

- [ ] **Step 1: Criar projeto Next.js 15**

```bash
cd C:\Users\eduar\Desktop\projetos\bolao
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --no-turbopack
```

Quando perguntado, confirmar todas as opções padrão com Enter.

- [ ] **Step 2: Verificar estrutura criada**

```bash
ls src/app
```

Esperado: `favicon.ico  globals.css  layout.tsx  page.tsx`

- [ ] **Step 3: Instalar dependências do projeto**

```bash
npm install @tanstack/react-query @phosphor-icons/react clsx tailwind-merge
npm install -D @tanstack/react-query-devtools
```

- [ ] **Step 4: Verificar instalação**

```bash
npm list @tanstack/react-query @phosphor-icons/react clsx tailwind-merge
```

Esperado: versões listadas sem erros.

- [ ] **Step 5: Inicializar git e commit inicial**

```bash
git init
git add .
git commit -m "chore: scaffold Next.js 15 com TypeScript e Tailwind"
```

---

### Task 2: Tema dark no Tailwind e CSS variables

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: Configurar tailwind.config.ts**

Substituir o conteúdo de `tailwind.config.ts` por:

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        base: '#0f0f1a',
        surface: '#16162a',
        elevated: '#1e1e36',
        border: '#ffffff0f',
        accent: '#00ff87',
        'accent-dim': '#00ff8722',
        'accent-border': '#00ff8744',
        primary: '#ffffff',
        secondary: '#ffffffaa',
        muted: '#ffffff44',
        error: '#ff4d6d',
        warning: '#ffd43b',
        finished: '#4dabf7',
        scheduled: '#868e96',
      },
      fontFamily: {
        barlow: ['"Barlow Condensed"', 'Impact', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        score: ['40px', { lineHeight: '1', fontWeight: '900' }],
        team: ['17px', { lineHeight: '1.2', fontWeight: '700' }],
        section: ['30px', { lineHeight: '1.1', fontWeight: '800' }],
      },
      keyframes: {
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
      },
      animation: {
        'pulse-live': 'pulse 1.5s ease-in-out infinite',
      },
      borderRadius: {
        card: '12px',
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Configurar globals.css**

Substituir o conteúdo de `src/app/globals.css` por:

```css
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=Inter:wght@400;500;600&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    background-color: #0f0f1a;
    color: #ffffff;
    font-family: 'Inter', system-ui, sans-serif;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  ::selection {
    background-color: #00ff8733;
    color: #ffffff;
  }

  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: #0f0f1a;
  }

  ::-webkit-scrollbar-thumb {
    background: #ffffff22;
    border-radius: 3px;
  }
}
```

- [ ] **Step 3: Verificar compilação**

```bash
npm run dev
```

Abrir `http://localhost:3000` — deve mostrar fundo `#0f0f1a` (quase preto). Parar o servidor com `Ctrl+C`.

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts src/app/globals.css
git commit -m "feat: tema dark com paleta de cores e fontes"
```

---

### Task 3: Tipos compartilhados

**Files:**
- Create: `src/types/index.ts`

- [ ] **Step 1: Criar src/types/index.ts**

```ts
export type GameStatus = 'SCHEDULED' | 'LIVE' | 'FINISHED'

export type Game = {
  id: string
  homeTeam: string
  awayTeam: string
  homeFlag: string | null
  awayFlag: string | null
  startsAt: string
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
  points: number | null
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

- [ ] **Step 2: Verificar tipos com TypeScript**

```bash
npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: tipos compartilhados Game, Prediction, RankingEntry"
```

---

### Task 4: Utilitários

**Files:**
- Create: `src/lib/utils.ts`

- [ ] **Step 1: Criar src/lib/utils.ts**

```ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatGameDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const formatted = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  }).format(d)
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function formatGameTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00'
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/lib/utils.ts
git commit -m "feat: utilitários cn, formatGameDate, formatGameTime, formatCountdown"
```

---

### Task 5: Providers (TanStack Query)

**Files:**
- Create: `src/app/providers.tsx`

- [ ] **Step 1: Criar src/app/providers.tsx**

```tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 2,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/app/providers.tsx
git commit -m "feat: QueryClientProvider com staleTime 30s"
```

---

### Task 6: Componentes de layout (Container, SectionTitle, Header)

**Files:**
- Create: `src/components/layout/Container.tsx`
- Create: `src/components/layout/SectionTitle.tsx`
- Create: `src/components/layout/Header.tsx`

- [ ] **Step 1: Criar Container.tsx**

```tsx
import { cn } from '@/lib/utils'

type ContainerProps = {
  children: React.ReactNode
  className?: string
}

export default function Container({ children, className }: ContainerProps) {
  return (
    <div className={cn('mx-auto w-full max-w-[960px] px-4 py-8', className)}>
      {children}
    </div>
  )
}
```

- [ ] **Step 2: Criar SectionTitle.tsx**

```tsx
import { cn } from '@/lib/utils'

type SectionTitleProps = {
  children: React.ReactNode
  className?: string
}

export default function SectionTitle({ children, className }: SectionTitleProps) {
  return (
    <h2
      className={cn(
        'font-barlow text-section uppercase tracking-wide text-primary',
        className
      )}
    >
      {children}
    </h2>
  )
}
```

- [ ] **Step 3: Criar Header.tsx**

```tsx
import Link from 'next/link'
import { Trophy } from '@phosphor-icons/react/dist/ssr'
import Container from './Container'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[#0a0a14]">
      <Container className="flex h-14 items-center justify-between py-0">
        <Link
          href="/"
          className="flex items-center gap-2 font-barlow text-[22px] font-black uppercase tracking-wide text-accent"
        >
          <Trophy size={22} weight="fill" />
          Bolão 2026
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/jogos"
            className="font-inter text-sm font-medium text-secondary transition-colors hover:text-primary"
          >
            Jogos
          </Link>
          <Link
            href="/perfil"
            className="font-inter text-sm font-medium text-secondary transition-colors hover:text-primary"
          >
            Meu perfil
          </Link>
        </nav>
      </Container>
    </header>
  )
}
```

- [ ] **Step 4: Verificar tipos**

```bash
npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/
git commit -m "feat: componentes de layout Container, SectionTitle, Header"
```

---

### Task 7: Root layout com fontes e providers

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Substituir src/app/layout.tsx**

```tsx
import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'
import Header from '@/components/layout/Header'

export const metadata: Metadata = {
  title: 'Bolão Copa 2026',
  description: 'Palpites e ranking da Copa do Mundo 2026',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-base font-inter text-primary antialiased">
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Substituir src/app/page.tsx por placeholder**

```tsx
import Container from '@/components/layout/Container'
import SectionTitle from '@/components/layout/SectionTitle'

export default function HomePage() {
  return (
    <Container>
      <SectionTitle>Ranking</SectionTitle>
    </Container>
  )
}
```

- [ ] **Step 3: Rodar o projeto e verificar visualmente**

```bash
npm run dev
```

Abrir `http://localhost:3000`. Verificar:
- Fundo preto (`#0f0f1a`)
- Header fixo com "Bolão 2026" em verde neon e ícone de troféu
- Texto "RANKING" em Barlow Condensed branco
- Links "Jogos" e "Meu perfil" no header

Parar com `Ctrl+C`.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/page.tsx
git commit -m "feat: root layout com providers, header e tema dark"
```

---

### Task 8: Componente Button

**Files:**
- Create: `src/components/ui/Button.tsx`

- [ ] **Step 1: Criar src/components/ui/Button.tsx**

```tsx
import { cn } from '@/lib/utils'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
  size?: 'sm' | 'md'
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center font-barlow font-bold uppercase tracking-wide transition-opacity',
        'rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        variant === 'primary' && 'bg-accent text-base hover:opacity-85',
        variant === 'ghost' &&
          'border border-border text-secondary hover:text-primary',
        size === 'md' && 'px-6 py-2.5 text-base',
        size === 'sm' && 'px-4 py-1.5 text-sm',
        disabled && 'cursor-not-allowed opacity-30',
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Button.tsx
git commit -m "feat: componente Button com variantes primary e ghost"
```

---

### Task 9: Componente Badge

**Files:**
- Create: `src/components/ui/Badge.tsx`

- [ ] **Step 1: Criar src/components/ui/Badge.tsx**

```tsx
import { cn } from '@/lib/utils'
import type { GameStatus } from '@/types'

type BadgeVariant = GameStatus | 'points-exact' | 'points-winner' | 'points-miss'

type BadgeProps = {
  variant: BadgeVariant
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  SCHEDULED: 'bg-elevated text-scheduled',
  LIVE: 'bg-accent-dim text-accent border border-accent-border animate-pulse-live',
  FINISHED: 'bg-[#1a3a4a] text-finished',
  'points-exact': 'bg-accent-dim text-accent border border-accent-border',
  'points-winner': 'bg-[#2a2a1a] text-warning border border-[#ffd43b44]',
  'points-miss': 'bg-elevated text-muted',
}

const variantLabels: Partial<Record<BadgeVariant, string>> = {
  SCHEDULED: 'Agendado',
  LIVE: 'Ao vivo',
  FINISHED: 'Encerrado',
}

export default function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 font-inter text-[11px] font-semibold uppercase tracking-wide',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: GameStatus }) {
  return <Badge variant={status}>{variantLabels[status]}</Badge>
}
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit
```

Esperado: sem erros.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Badge.tsx
git commit -m "feat: componente Badge com variantes de status e pontos"
```

---

### Task 10: Componentes Input e Avatar

**Files:**
- Create: `src/components/ui/Input.tsx`
- Create: `src/components/ui/Avatar.tsx`

- [ ] **Step 1: Criar src/components/ui/Input.tsx**

```tsx
import { cn } from '@/lib/utils'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  className?: string
}

export default function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        'w-full rounded-md border border-border bg-elevated px-3 py-2',
        'font-inter text-sm text-primary placeholder:text-muted',
        'transition-colors focus:border-accent focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-40',
        className
      )}
      {...props}
    />
  )
}

type InputScoreProps = Omit<InputProps, 'type' | 'min' | 'max'>

export function InputScore({ className, ...props }: InputScoreProps) {
  return (
    <input
      type="number"
      min={0}
      max={99}
      className={cn(
        'h-14 w-16 rounded-md border border-border bg-elevated text-center',
        'font-barlow text-2xl font-extrabold text-primary',
        'transition-colors focus:border-accent focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-40',
        '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
        className
      )}
      {...props}
    />
  )
}
```

- [ ] **Step 2: Criar src/components/ui/Avatar.tsx**

```tsx
import Image from 'next/image'
import { cn } from '@/lib/utils'

type AvatarProps = {
  src: string | null
  name: string
  size?: number
  className?: string
}

export default function Avatar({ src, name, size = 36, className }: AvatarProps) {
  const initials = name
    .split(/[\s_]/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  if (!src) {
    return (
      <div
        style={{ width: size, height: size }}
        className={cn(
          'flex items-center justify-center rounded-full bg-elevated font-barlow font-bold text-accent',
          className
        )}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {initials}
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={name}
      width={size}
      height={size}
      className={cn('rounded-full object-cover', className)}
    />
  )
}
```

- [ ] **Step 3: Verificar tipos**

```bash
npx tsc --noEmit
```

Esperado: sem erros. Se houver erro de `style` duplicado no Avatar, remover a primeira ocorrência de `style={{ width: size, height: size }}` (manter apenas o segundo com `fontSize`).

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Input.tsx src/components/ui/Avatar.tsx
git commit -m "feat: componentes Input, InputScore e Avatar"
```

---

### Task 11: Verificação final

**Files:** nenhum arquivo novo

- [ ] **Step 1: Rodar build de produção**

```bash
npm run build
```

Esperado: build completo sem erros de TypeScript ou ESLint.

- [ ] **Step 2: Checar estrutura de arquivos criados**

```bash
find src -type f | sort
```

Esperado (mínimo):
```
src/app/globals.css
src/app/layout.tsx
src/app/page.tsx
src/app/providers.tsx
src/components/layout/Container.tsx
src/components/layout/Header.tsx
src/components/layout/SectionTitle.tsx
src/components/ui/Avatar.tsx
src/components/ui/Badge.tsx
src/components/ui/Button.tsx
src/components/ui/Input.tsx
src/lib/utils.ts
src/types/index.ts
```

- [ ] **Step 3: Rodar dev e verificar visualmente**

```bash
npm run dev
```

Abrir `http://localhost:3000`. Confirmar:
- Fundo `#0f0f1a` em toda a página
- Header com logo verde neon + ícone troféu
- Fonte Barlow Condensed carregando no título "RANKING"
- Sem erros no console do browser

- [ ] **Step 4: Commit final**

```bash
git add .
git commit -m "chore: arquitetura base do frontend completa"
```

# Bolão Copa do Mundo 2026

Site de bolão entre amigos para a Copa do Mundo de 2026. Sem apostas ou prêmios em dinheiro — qualquer pessoa com o link se cadastra, envia palpites de placar para cada jogo e disputa um ranking de pontuação.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Banco de dados | SQLite via Prisma 7 + Turso/libSQL (serverless) |
| Autenticação | Auth.js v5 (`next-auth@beta`) — Google OAuth |
| API de jogos | [football-data.org](https://www.football-data.org) (plano gratuito, competição `WC`) |
| Fetching/Cache | TanStack Query (React Query v5) |
| Estilo | Tailwind CSS v4 — visual dark/esports |
| Ícones | Phosphor Icons |
| Deploy | Vercel + Vercel Cron |

## Como funciona

1. **Login** com Google. Na primeira vez o usuário é levado ao onboarding para escolher um apelido único.
2. **Palpites** — em `/jogos`, cada jogo permite enviar um palpite de placar. O palpite pode ser alterado quantas vezes quiser até o jogo começar; depois trava automaticamente.
3. **Pontuação** — quando um jogo termina, os pontos de todos os palpites são recalculados:
   - **3 pts** — placar exato
   - **1 pt** — acertou o vencedor (ou o empate), mas errou o placar
   - **0 pts** — errou o resultado
   - Em mata-matas vale **sempre o placar do tempo normal (90 min)** — prorrogação e pênaltis não contam para a pontuação.
4. **Ranking** — a home (`/`) mostra a classificação geral, com desempate por placares exatos → acertos de vencedor → jogos jogados.

## Páginas

- `/` — ranking geral dos participantes
- `/jogos` — jogos por dia, com envio de palpites
- `/jogos/[id]` — detalhe do jogo, placar ao vivo e palpites de todos os participantes
- `/pontuacao` — explicação das regras de pontuação
- `/perfil` — palpites e pontos do próprio usuário
- `/onboarding` — escolha do apelido (primeiro acesso)

## Sincronização de jogos

Os jogos e placares vêm da football-data.org através de `syncGames()` (`src/lib/sync.ts`), que cria/atualiza partidas e recalcula os pontos dos palpites quando um jogo é finalizado. O sync é disparado por:

- **Cron diário** — `vercel.json` agenda `/api/cron/sync` às 08:00 UTC (protegido por `CRON_SECRET`).
- **Ao vivo** — `/api/games/[id]/live` sincroniza sob demanda quando o dado está desatualizado e o jogo está em andamento; o front faz polling a cada 5 min.
- **Manual** — botão na página de jogos chama `/api/games/sync` (requer usuário autenticado).

## Variáveis de ambiente

Defina em `.env.local`:

```bash
# Auth.js
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# Banco de dados (Turso/libSQL)
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=

# API de jogos
FOOTBALL_DATA_API_KEY=

# Cron
CRON_SECRET=
```

## Desenvolvimento

```bash
npm install
npx prisma generate
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — `prisma generate` + build de produção
- `npm run start` — servidor de produção
- `npm run lint` — ESLint

## Estrutura

```
src/
  actions/        Server actions (ex.: salvar palpite)
  app/            Páginas (App Router) e rotas de API
  components/     Componentes de UI (game, prediction, layout, ui)
  lib/            Domínio: scoring, sync, football-data, auth, prisma
  middleware.ts   Proteção de rotas e fluxo de onboarding
prisma/           Schema do banco
.specs/           Especificações de cada feature
```

> **Nota:** este projeto usa uma versão do Next.js com mudanças em relação ao comportamento conhecido. Antes de escrever código, consulte os guias em `node_modules/next/dist/docs/` (ver `AGENTS.md`).

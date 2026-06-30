# Bolão Copa do Mundo 2026

Site de bolão entre amigos para a Copa do Mundo de 2026. Sem apostas ou prêmios em dinheiro — qualquer pessoa com o link se cadastra, envia palpites de placar para cada jogo e disputa um ranking de pontuação.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Banco de dados | SQLite via Prisma 7 + Turso/libSQL (serverless) |
| Autenticação | Auth.js v5 (`next-auth@beta`) — Google OAuth |
| API de jogos | [football-data.org](https://www.football-data.org) (plano gratuito, competição `WC`) |
| Pagamentos | [Asaas](https://www.asaas.com) — cobrança PIX para criação de ligas |
| Estilo | Tailwind CSS v4 — visual dark/esports |
| Ícones | Phosphor Icons |
| Deploy | Vercel + cron externo (cron-job.org) |

## Como funciona

1. **Login** com Google. Na primeira vez o usuário é levado ao onboarding para escolher um apelido único.
2. **Palpites** — em `/jogos`, cada jogo permite enviar um palpite de placar. O palpite pode ser alterado quantas vezes quiser até o jogo começar; depois trava automaticamente.
3. **Pontuação** — quando um jogo termina, os pontos de todos os palpites são recalculados:
   - **3 pts** — placar exato
   - **1 pt** — acertou o vencedor (ou o empate), mas errou o placar
   - **0 pts** — errou o resultado
   - Em mata-matas vale **sempre o placar do tempo normal (90 min)** — prorrogação e pênaltis não contam para a pontuação.
4. **Ranking** — a home (`/`) mostra a classificação geral, com desempate por placares exatos → acertos de vencedor → jogos jogados.
5. **Ligas (grupos)** — rankings privados entre amigos. A criação de uma liga requer pagamento único de R$ 6,00 via PIX (processado pelo Asaas). O palpite no bolão geral vale automaticamente em todas as ligas.

## Páginas

- `/` — ranking geral dos participantes
- `/jogos` — jogos por dia, com envio de palpites
- `/jogos/[id]` — detalhe do jogo, placar ao vivo e palpites de todos os participantes
- `/grupos` — ligas privadas do usuário; criação via pagamento PIX
- `/grupos/[id]` — ranking e membros de uma liga
- `/grupos/entrar/[code]` — landing de convite (acessível sem login)
- `/grupos/pagamento/[paymentId]` — aguarda confirmação do PIX e redireciona ao grupo criado
- `/pontuacao` — explicação das regras de pontuação
- `/perfil` — palpites e pontos do próprio usuário
- `/onboarding` — escolha do apelido (primeiro acesso)

## Sincronização de jogos

Os jogos e placares vêm da football-data.org através de `syncGames()` (`src/lib/sync.ts`), que cria/atualiza partidas e recalcula os pontos dos palpites assim que o placar do tempo normal (90 min) trava — no encerramento ou ao entrar em prorrogação/pênaltis. O sync é disparado por:

- **Cron externo (cron-job.org)** — chama `GET /api/cron/sync` a cada 5 min (protegido por `CRON_SECRET`). É o que mantém placares e ranking atualizados durante os jogos (ver configuração abaixo).
- **Cron diário (Vercel, fallback)** — `vercel.json` agenda `/api/cron/sync` às 08:00 UTC. Redundante com o cron-job.org, mantido apenas como rede de segurança.
- **Manual** — botão na página de jogos chama `/api/games/sync` (requer usuário autenticado).

> A listagem de jogos se atualiza sozinha (re-render do servidor a cada 60s) enquanto houver jogo ao vivo — ela lê o banco, que o cron mantém fresco.

### Configuração do cron-job.org

1. Crie uma conta gratuita em [cron-job.org](https://cron-job.org).
2. **Create cronjob**:
   - **URL:** `https://SEU_DOMINIO/api/cron/sync` (sem `?force=true`)
   - **Schedule:** a cada 5 minutos
   - **Request method:** GET
   - **Header:** `Authorization: Bearer <valor de CRON_SECRET>`
3. Em dias sem jogo a rota faz no-op (gate `hasGameNearby`) e não consome a cota da football-data; em dias de jogo ela sincroniza os placares ao vivo.

## Fluxo de pagamento (ligas)

```
CreateGroupForm → POST /api/asaas/checkout
  → cria cliente + cobrança PIX no Asaas
  → retorna QR code (base64) + código copia-e-cola
  → redireciona para /grupos/pagamento/[paymentId]

Página de pagamento → polling GET /api/asaas/status/[paymentId] a cada 3s

Asaas → POST /subscriptions/webhook (PAYMENT_RECEIVED / PAYMENT_CONFIRMED)
  → lock atômico (updateMany WHERE status=PENDING)
  → cria grupo + GroupMember do dono
  → atualiza GroupPayment.groupId

Polling detecta status PAID → redireciona para /grupos/[groupId]
```

## Variáveis de ambiente

Defina em `.env.local`:

```bash
# Auth.js
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# Banco de dados (Turso/libSQL)
DATABASE_URL=
DATABASE_AUTH_TOKEN=

# API de jogos
FOOTBALL_DATA_API_KEY=

# Cron
CRON_SECRET=

# Asaas — pagamentos PIX para criação de ligas
ASAAS_ENV=sandbox              # sandbox | production
ASAAS_API_KEY=                 # $aact_... (use \$ para escapar o $ no .env.local)
ASAAS_WEBHOOK_TOKEN=           # token do painel Asaas → Integrações → Webhooks
GROUP_PRICE_CENTS=600          # valor em centavos (600 = R$ 6,00)
NEXT_PUBLIC_GROUP_PRICE_DISPLAY=R$ 6,00
```

> **Atenção:** a chave da Asaas começa com `$` — no `.env.local` escape com `\$` para evitar que o dotenv-expand interpole a variável:
> ```
> ASAAS_API_KEY=\$aact_hmlg_...
> ```

### Configuração do webhook (Asaas)

1. Painel Asaas → Minha Conta → Integrações → Webhooks
2. URL: `https://seudominio.com/subscriptions/webhook`
3. Eventos: `PAYMENT_RECEIVED`, `PAYMENT_CONFIRMED`
4. Copie o token de acesso e coloque em `ASAAS_WEBHOOK_TOKEN`

Para testes locais use [ngrok](https://ngrok.com): `ngrok http 3000`.

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
  actions/        Server actions (palpites, grupos)
  app/            Páginas (App Router) e rotas de API
    api/asaas/    Checkout PIX e polling de status
    subscriptions/webhook/  Webhook do Asaas
    grupos/       Ligas privadas + página de pagamento
  components/     Componentes de UI (game, group, prediction, layout, ui)
  lib/            Domínio: scoring, sync, football-data, auth, prisma, asaas
  middleware.ts   Proteção de rotas e fluxo de onboarding
prisma/           Schema do banco
docs/             Documentação interna de features
```

> **Nota:** este projeto usa uma versão do Next.js com mudanças em relação ao comportamento conhecido. Antes de escrever código, consulte os guias em `node_modules/next/dist/docs/` (ver `AGENTS.md`).

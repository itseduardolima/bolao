# Bolão Copa do Mundo 2026 — Spec Principal

## Visão Geral

Site de bolão entre amigos para a Copa do Mundo 2026. Sem apostas ou prêmios financeiros. Qualquer pessoa com o link pode se cadastrar, enviar palpites de placar para cada jogo e competir no ranking de pontuação.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Banco de dados | SQLite via Prisma 7 + Turso/libSQL (serverless) |
| Autenticação | Auth.js v5 (`next-auth@beta`) — Google OAuth |
| API de jogos | football-data.org (plano gratuito, competição `WC`) |
| Pagamentos | Asaas — cobrança PIX para criação de ligas |
| Deploy | Vercel + Vercel Cron |
| Estilo | Tailwind CSS v4 (sem biblioteca de componentes) |
| Ícones | Phosphor Icons (`@phosphor-icons/react`), estilo Bold |
| Fontes | Barlow Condensed (títulos/placares) + Inter (corpo) |
| Fetching/Cache | TanStack Query (React Query v5) |

---

## Design Visual

- **Estilo:** Dark / Esports — fundo `#0f0f1a`, acentos em verde neon `#00ff87`
- **Cards de jogo:** bandeiras dos times, placar em destaque, palpite e pontos no rodapé
- **Sem emojis** em nenhuma parte do site — bandeiras via `<img>` com URL da API
- Detalhes completos em `.specs/design.md`

---

## Arquitetura Frontend

- **Pages limpas:** `page.tsx` contém apenas JSX
- **Hooks co-localizados:** `useX.ts` na mesma pasta da página concentra toda a lógica
- **TanStack Query** para fetching, cache e polling de jogos ao vivo
- Detalhes completos em `.specs/frontend-arquitetura.md`

---

## Páginas

| Rota | Descrição | Acesso |
|------|-----------|--------|
| `/` | Ranking geral de todos os participantes | Público |
| `/jogos` | Lista de jogos por data, com palpites | Público |
| `/jogos/[id]` | Detalhes do jogo + formulário de palpite | Autenticado |
| `/grupos` | Ligas privadas do usuário; criação via PIX | Autenticado |
| `/grupos/[id]` | Ranking e membros de uma liga | Autenticado |
| `/grupos/entrar/[code]` | Landing de convite | Público |
| `/grupos/pagamento/[paymentId]` | Aguarda confirmação do PIX | Autenticado |
| `/pontuacao` | Explicação das regras de pontuação | Público |
| `/perfil` | Meus palpites e pontuação detalhada | Autenticado |
| `/onboarding` | Escolha de nickname no primeiro acesso | Autenticado (sem nickname) |
| `/api/asaas/checkout` | Cria cobrança PIX no Asaas | Autenticado |
| `/api/asaas/status/[paymentId]` | Polling de status do pagamento | Autenticado |
| `/subscriptions/webhook` | Webhook do Asaas (confirma pagamento e cria grupo) | Público (token-protected) |
| `/api/cron/sync` | Endpoint interno para sync de jogos e resultados | Interno (`CRON_SECRET`) |
| `/api/games/[id]/live` | Placar ao vivo para polling client-side | Público |
| `/api/nickname` | Check de disponibilidade + salvar nickname | Autenticado |

> Não há painel admin. A gestão de jogos e resultados é 100% automática via API.

---

## Modelo de Dados

### User
```prisma
id            String   @id
name          String
email         String   @unique
image         String?
nickname      String?  @unique   // 3–20 chars, /^[a-zA-Z0-9_]{3,20}$/
hasNickname   Boolean  @default(false)
createdAt     DateTime @default(now())
ownedGroups   Group[]
groupMembers  GroupMember[]
groupPayments GroupPayment[]
```

### Group
```prisma
id         String   @id @default(cuid())
name       String
inviteCode String   @unique
ownerId    String
createdAt  DateTime @default(now())
updatedAt  DateTime @updatedAt
```

### GroupMember
```prisma
id       String   @id @default(cuid())
groupId  String
userId   String
role     String   @default("MEMBER")  // OWNER | MEMBER
joinedAt DateTime @default(now())

@@unique([groupId, userId])
```

### GroupPayment
```prisma
id        String    @id @default(cuid())
userId    String
groupName String
asaasId   String    @unique   // ID da cobrança no Asaas (pay_xxx)
status    String    @default("PENDING")  // PENDING | PAID | EXPIRED | CANCELLED
groupId   String?                        // preenchido após grupo ser criado
pixCode   String?                        // código PIX copia-e-cola
expiresAt DateTime?
createdAt DateTime  @default(now())
updatedAt DateTime  @updatedAt
```

### Game
```prisma
id          String     @id @default(cuid())
externalId  String     @unique
homeTeam    String
awayTeam    String
homeFlag    String?    // URL do escudo/bandeira (football-data.org)
awayFlag    String?
startsAt    DateTime
venue       String?
city        String?
phase       String     // ex: "Fase de Grupos", "Oitavas de Final"
groupName   String?    // ex: "Grupo A" (null em mata-mata)
status      GameStatus @default(SCHEDULED)
homeScore   Int?
awayScore   Int?
createdAt   DateTime   @default(now())
updatedAt   DateTime   @updatedAt
```

### Prediction
```prisma
id        String   @id @default(cuid())
userId    String
gameId    String
homeScore Int
awayScore Int
points    Int?     // null até encerrar; 0, 1 ou 3 após cron
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt

@@unique([userId, gameId])
```

---

## Regras de Negócio

### Autenticação
- Login via Google OAuth (Auth.js v5)
- Cadastro aberto — qualquer pessoa com o link pode entrar
- Primeiro acesso exige escolha de nickname antes de usar o site
- Detalhes em `.specs/auth.md`

### Palpites
- Um palpite por usuário por jogo (upsert)
- Palpite aberto para edição enquanto `Game.startsAt > now()`
- Countdown nos últimos 5 minutos antes do jogo
- Bloqueio automático no client e validação no servidor
- Detalhes em `.specs/palpites.md`

### Pontuação (baseada no placar do tempo normal — 90min)

| Resultado | Pontos |
|-----------|--------|
| Placar exato | 3 pts |
| Acertou vencedor ou empate | 1 pt |
| Errou | 0 pts |

- Jogos de prorrogação/pênaltis: pontuação pelo placar do 90min
- Recalcula automaticamente sempre que o placar muda (mesmo após `FINISHED`)
- Detalhes em `.specs/pontuacao.md`

### Ranking
- Todos os usuários cadastrados aparecem (mesmo sem palpites)
- Ordenação: pontos → acertos exatos → acertos de vencedor → jogos palpitados → nickname
- Colunas: posição, avatar, nickname, pontos, exatos, vencedor, jogos
- Detalhes em `.specs/ranking.md`

### Ligas (grupos privados)
- Rankings privados entre amigos — o palpite no bolão geral vale automaticamente em todas as ligas
- **Criação paga:** R$ 6,00 via PIX (processado pelo Asaas); grupo só é criado após confirmação do webhook
- Entrada por código de convite (8 caracteres, alfabeto sem ambiguidade)
- Dono pode regenerar o código, remover membros e excluir o grupo
- Limites: 20 grupos criados por usuário, 50 grupos participados, 100 membros por grupo
- Webhook atômico: `updateMany WHERE status=PENDING` impede criação dupla em retentativas

---

## Integração com API (football-data.org)

- **Dois crons no Vercel:** a cada 5 min e a cada hora
- **Lógica interna:** só chama a API se houver jogo no dia (economiza quota)
- **Retry:** até 3 tentativas com backoff exponencial (1s → 2s → 4s)
- **Recálculo de pontos:** automático após atualização de placar
- Detalhes em `.specs/sync-api.md`

---

## Fluxo do Usuário

```
Acessa o site
    → Vê ranking público e lista de jogos (sem login)

Faz login com Google
    → Primeiro acesso: escolhe nickname em /onboarding
    → Acessos seguintes: entra direto

Antes do jogo começar
    → Acessa /jogos/[id] e envia palpite
    → Pode editar até o jogo começar
    → Countdown nos últimos 5 minutos

Jogo começa
    → Palpite congelado, formulário bloqueado
    → Placar ao vivo atualiza a cada 30s (polling)

Jogo termina
    → Cron sync atualiza placar e recalcula pontos
    → Palpites e estatísticas dos participantes revelados
    → Ranking atualizado
```

---

## Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `DATABASE_URL` | URL do banco Turso (SQLite serverless) |
| `DATABASE_AUTH_TOKEN` | Token de autenticação do Turso |
| `AUTH_SECRET` | Secret do Auth.js |
| `AUTH_GOOGLE_ID` | Client ID do Google OAuth |
| `AUTH_GOOGLE_SECRET` | Client Secret do Google OAuth |
| `FOOTBALL_DATA_API_KEY` | Token da football-data.org |
| `CRON_SECRET` | Secret para autenticar chamadas ao cron |
| `ASAAS_ENV` | `sandbox` ou `production` |
| `ASAAS_API_KEY` | Chave da API Asaas (escape `$` inicial com `\$` no `.env.local`) |
| `ASAAS_WEBHOOK_TOKEN` | Token do webhook Asaas (painel → Integrações → Webhooks) |
| `GROUP_PRICE_CENTS` | Valor da liga em centavos (ex: `600` = R$ 6,00) |
| `NEXT_PUBLIC_GROUP_PRICE_DISPLAY` | Texto exibido no botão de pagamento (ex: `R$ 6,00`) |

---

## Fora do Escopo

- Chat ou comentários entre participantes
- Notificações (email/push) sobre jogos ou resultados
- Palpites especiais (campeão, semifinalistas, artilheiro)
- Painel admin manual de resultados
- Troca de nickname após onboarding
- Modo claro (light theme)
- Transferência de propriedade de liga

---

## Índice de Specs

| Arquivo | Conteúdo |
|---------|---------|
| `.specs/auth.md` | Login Google, onboarding de nickname, middleware |
| `.specs/jogos.md` | Listagem por fase/data, detalhe, polling ao vivo |
| `.specs/palpites.md` | Formulário, countdown, validações, Server Action |
| `.specs/pontuacao.md` | Algoritmo de cálculo e recálculo automático |
| `.specs/ranking.md` | Ranking geral, critérios de desempate, /perfil |
| `.specs/sync-api.md` | football-data.org, cron job, retry, mapeamento |
| `.specs/design.md` | Identidade visual, paleta, tipografia, componentes |
| `.specs/frontend-arquitetura.md` | Estrutura de pastas, hooks, TanStack Query, tipos |
| `docs/pagamento-grupos-asaas.md` | Fluxo completo de pagamento PIX para criação de ligas |

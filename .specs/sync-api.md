# Sync da API — Spec

## Visão Geral

Integração com football-data.org para buscar automaticamente jogos e resultados da Copa do Mundo 2026. Dois crons no Vercel disparam o sync: a cada 5 min e a cada hora. A lógica interna só chama a API externa se houver jogo no dia. Retry automático com backoff em caso de falha.

---

## API Externa

| Item | Detalhe |
|------|---------|
| Provider | football-data.org |
| Plano | Free (10 req/min) |
| Competição | `WC` (FIFA World Cup) |
| Endpoint | `GET https://api.football-data.org/v4/competitions/WC/matches` |
| Auth | Header `X-Auth-Token: ${FOOTBALL_DATA_API_KEY}` |

---

## Crons (Vercel)

Dois crons configurados em `vercel.json`:

```json
{
  "crons": [
    { "path": "/api/cron/sync", "schedule": "*/5 * * * *" },
    { "path": "/api/cron/sync", "schedule": "0 * * * *" }
  ]
}
```

- **A cada 5 min:** para capturar atualizações de jogos ao vivo
- **A cada hora:** fallback para dias sem jogos (mantém dados atualizados)

A lógica interna verifica se há jogo hoje antes de chamar a API — se não houver, retorna `{ skipped: true }` sem consumir quota.

---

## Endpoint `GET /api/cron/sync`

**Autenticação:**
- Header obrigatório: `Authorization: Bearer ${CRON_SECRET}`
- Retorna `401` se token ausente ou inválido
- `CRON_SECRET` configurado como variável de ambiente no Vercel

**Respostas:**

| Situação | Status | Body |
|----------|--------|------|
| Sucesso | 200 | `{ updated, created, skipped, errors }` |
| Sem jogos hoje | 200 | `{ skipped: true }` |
| Token inválido | 401 | `{ error: "Unauthorized" }` |
| Falha após retries | 200 | `{ error: true, message: "..." }` |

---

## Lógica de Sync (`lib/sync.ts`)

```
1. Verifica se há jogo hoje ou ontem (margem para jogos noturnos)
   → Se não: retorna { skipped: true }

2. Chama football-data.org com retry:
   - Tentativa 1: imediata
   - Tentativa 2: aguarda 1s
   - Tentativa 3: aguarda 2s
   - Tentativa 4: aguarda 4s
   → Se todas falharem: loga erro, retorna { error: true }

3. Para cada jogo retornado:
   a. Busca Game no banco pelo externalId
   b. Mapeia status da API para GameStatus interno
   c. Compara placar e status com dados atuais no banco
   d. Se mudou: atualiza Game + recalcula pontos (se FINISHED)
   e. Se não mudou: skip (zero writes)
   f. Se não existe: cria Game novo

4. Retorna { updated, created, skipped, errors }
```

**Idempotência:** rodar o sync duas vezes com os mesmos dados da API não gera writes desnecessários.

---

## Mapeamento de Campos

| Campo API (football-data.org) | Campo no banco | Observação |
|-------------------------------|---------------|------------|
| `id` | `externalId` | Chave de lookup |
| `homeTeam.name` | `homeTeam` | Nome completo |
| `awayTeam.name` | `awayTeam` | Nome completo |
| `homeTeam.crest` | `homeFlag` | URL da bandeira/escudo |
| `awayTeam.crest` | `awayFlag` | URL da bandeira/escudo |
| `utcDate` | `startsAt` | Convertido para DateTime |
| `venue` | `venue` | Pode ser null |
| `score.fullTime.home` | `homeScore` | Null se não encerrado |
| `score.fullTime.away` | `awayScore` | Null se não encerrado |
| `status` | `status` | Mapeado (ver abaixo) |
| `stage` | `phase` | Ex: "GROUP_STAGE", "ROUND_OF_16" |
| `group` | `groupName` | Ex: "GROUP_A", null em mata-mata |

### Mapeamento de Status

| Status API | GameStatus interno |
|------------|-------------------|
| `SCHEDULED` | `SCHEDULED` |
| `TIMED` | `SCHEDULED` |
| `IN_PLAY` | `LIVE` |
| `PAUSED` | `LIVE` |
| `FINISHED` | `FINISHED` |
| `SUSPENDED` | `SCHEDULED` |
| `POSTPONED` | `SCHEDULED` |
| `CANCELLED` | `SCHEDULED` |

### Mapeamento de Fase

| Stage API | Exibição no site |
|-----------|-----------------|
| `GROUP_STAGE` | `Fase de Grupos` |
| `ROUND_OF_16` | `Oitavas de Final` |
| `QUARTER_FINALS` | `Quartas de Final` |
| `SEMI_FINALS` | `Semifinal` |
| `THIRD_PLACE` | `Disputa de Terceiro Lugar` |
| `FINAL` | `Final` |

---

## Recálculo de Pontos

Quando `Game.status` muda para `FINISHED` ou `homeScore`/`awayScore` muda:

1. Busca todas as `Prediction` do `gameId`
2. Para cada uma: chama `calculatePoints()` de `lib/scoring.ts`
3. Atualiza `Prediction.points` no banco

Detalhes do algoritmo em `.specs/pontuacao.md`.

---

## Variáveis de Ambiente

| Variável | Descrição |
|----------|-----------|
| `FOOTBALL_DATA_API_KEY` | Token da football-data.org |
| `CRON_SECRET` | Secret para autenticar chamadas ao endpoint de cron |

---

## Localização do Código

| Arquivo | Responsabilidade |
|---------|-----------------|
| `app/api/cron/sync/route.ts` | Endpoint Next.js, valida token, chama sync |
| `lib/sync.ts` | Lógica principal: fetch API, upsert banco, dispara recálculo |
| `lib/football-data.ts` | Cliente da API com retry e mapeamento de campos |
| `vercel.json` | Configuração dos dois crons |

---

## Fora do Escopo

- Sync manual via painel admin
- Webhook da football-data.org (não disponível no plano free)
- Histórico de chamadas à API / log de auditoria
- Alertas por email em caso de falha
- Fallback para API alternativa

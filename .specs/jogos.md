# Jogos — Spec

## Visão Geral

Listagem e detalhe dos jogos da Copa do Mundo 2026. Jogos agrupados por fase e data. Jogos ao vivo atualizam o placar via polling client-side. Palpites e estatísticas dos participantes são revelados apenas após o jogo encerrar.

---

## Arquitetura

- **Server Components** para jogos `SCHEDULED` e `FINISHED` — renderização no servidor, dados via Prisma
- **Client Component com polling (30s)** apenas para jogos `LIVE` — busca `/api/games/[id]/live` para atualizar placar sem reload
- Sem cache complexo por tag — revalidação simples via `revalidate` no Server Component

---

## Páginas

### `/jogos` — Listagem

**Agrupamento:** fase → data dentro da fase

```
Fase de Grupos
  └─ Segunda, 11 Jun 2026
       ├─ Brasil × Argentina  15:00  [Agendado]
       └─ França × Alemanha   19:00  [Ao vivo] 1×0
  └─ Terça, 12 Jun 2026
       └─ ...
Oitavas de Final
  └─ ...
```

**Comportamento por status no card:**

| Status | Exibição |
|--------|----------|
| `SCHEDULED` | Horário local + badge cinza "Agendado" |
| `LIVE` | Placar atual + badge verde "Ao vivo" (polling 30s) |
| `FINISHED` | Placar final + badge azul "Encerrado" |

**Usuário logado:** card mostra seu palpite e pontos ganhos (se `FINISHED`)
**Usuário não logado:** card sem palpite, link "Entre para palpitar" nos jogos disponíveis

---

### `/jogos/[id]` — Detalhe

**Layout:**
```
[Badge status]  Brasil × Argentina  — Quartas de Final
15:00 · Estádio X · Nova York

[Placar]  1 × 2  (se LIVE ou FINISHED)

─── Meu palpite ───
[Input casa] × [Input visitante]   [Botão Salvar]
(bloqueado se startsAt <= now(), com aviso "Palpites encerrados")

─── Palpites dos participantes ───  (só após FINISHED)
Nickname       Palpite    Pontos
Eduardo        1×2        3 pts
João           2×1        0 pts

─── Estatísticas ───  (só após FINISHED)
Acertaram o placar exato:   4 pessoas (13%)
Acertaram o vencedor:      18 pessoas (60%)
Erraram:                    9 pessoas (27%)
```

**Regras:**
- Formulário de palpite: visível apenas para usuário autenticado
- Palpites dos outros participantes: ocultos até `FINISHED` (evita influência)
- Estatísticas: ocultas até `FINISHED`
- Jogo `LIVE`: placar com polling 30s, formulário bloqueado, palpites ainda ocultos
- Jogo `FINISHED`: placar final, formulário bloqueado, palpites e stats visíveis

---

## Modelo de Dados

```prisma
enum GameStatus {
  SCHEDULED
  LIVE
  FINISHED
}

model Game {
  id          String      @id @default(cuid())
  externalId  String      @unique
  homeTeam    String
  awayTeam    String
  homeFlag    String?
  awayFlag    String?
  startsAt    DateTime
  venue       String?
  city        String?
  phase       String      // ex: "Fase de Grupos", "Oitavas de Final"
  groupName   String?     // ex: "Grupo A" (null para fases eliminatórias)
  status      GameStatus  @default(SCHEDULED)
  homeScore   Int?
  awayScore   Int?
  predictions Prediction[]
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
}
```

---

## Endpoints de API

### `GET /api/games/[id]/live`
- Público (sem auth)
- Retorna placar e status atuais do jogo
- Usado pelo polling client-side de jogos `LIVE`
- Resposta:
```json
{
  "status": "LIVE",
  "homeScore": 1,
  "awayScore": 0
}
```
- Se jogo não existe: 404
- Se jogo não está `LIVE`: retorna status atual igualmente (client para o polling se `FINISHED`)

---

## Ordenação e Agrupamento

**Ordem das fases:**
1. Fase de Grupos
2. Oitavas de Final
3. Quartas de Final
4. Semifinal
5. Disputa de Terceiro Lugar
6. Final

**Dentro de cada fase:** jogos ordenados por `startsAt` crescente, agrupados por data (timezone do usuário via `Intl`).

---

## Fora do Escopo

- Filtro por seleção/time favorito
- Notificações de início de jogo
- Histórico de atualizações de placar (ex: minuto do gol)
- Transmissão ao vivo ou link para assistir
- Palpites visíveis antes do jogo encerrar

# Pontuação — Spec

## Visão Geral

Algoritmo de cálculo de pontos por palpite, executado automaticamente pelo cron após cada atualização de placar. Pontuação baseada no placar do tempo normal (90min) — prorrogação e pênaltis ignorados. Recalcula automaticamente sempre que o placar muda, mesmo após o jogo encerrado.

---

## Regras de Pontuação

| Resultado | Pontos |
|-----------|--------|
| Placar exato | 3 pts |
| Acertou vencedor ou empate | 1 pt |
| Errou | 0 pts |

**Importante:** pontuação sempre baseada no placar do tempo normal (90min). Jogos que vão para prorrogação ou pênaltis usam o placar do 90min para calcular acerto exato e vencedor.

### Exemplos

| Resultado real | Palpite | Pontos | Motivo |
|---------------|---------|--------|--------|
| 2×1 | 2×1 | 3 | Placar exato |
| 2×1 | 3×1 | 1 | Acertou vencedor |
| 2×1 | 1×2 | 0 | Errou |
| 1×1 | 1×1 | 3 | Placar exato |
| 1×1 | 2×2 | 1 | Acertou empate |
| 1×1 | 2×1 | 0 | Errou |
| 1×1 (Brasil vence nos pên.) | 1×1 | 3 | Placar do tempo normal |
| 1×1 (Brasil vence nos pên.) | 2×2 | 1 | Acertou empate no tempo normal |

---

## Algoritmo

Função pura em `lib/scoring.ts`, sem acesso ao banco:

```ts
export function calculatePoints(
  prediction: { homeScore: number; awayScore: number },
  game: { homeScore: number; awayScore: number }
): number {
  // Placar exato
  if (
    prediction.homeScore === game.homeScore &&
    prediction.awayScore === game.awayScore
  ) {
    return 3
  }

  // Acertou vencedor ou empate
  const predResult = Math.sign(prediction.homeScore - prediction.awayScore)
  const gameResult = Math.sign(game.homeScore - game.awayScore)

  if (predResult === gameResult) {
    return 1
  }

  return 0
}
```

**Propriedades:**
- Pura: sem efeitos colaterais, sem I/O
- Determinística: mesmo input sempre produz mesmo output
- Testável unitariamente sem banco ou mocks

---

## Recálculo Automático

### Quando recalcula

O cron recalcula pontos de um jogo sempre que:
- `Game.status` muda para `FINISHED`
- `Game.homeScore` ou `Game.awayScore` muda (mesmo que já `FINISHED`)

Se o placar não mudou desde o último sync, nenhum write é feito.

### Fluxo no cron (por jogo)

```
1. Busca Game atual no banco pelo externalId
2. Compara placar e status com dados da API
3. Se mudou:
   a. Atualiza Game (homeScore, awayScore, status)
   b. Busca todas as Predictions daquele gameId
   c. Para cada Prediction:
      - Chama calculatePoints(prediction, game)
      - Atualiza Prediction.points no banco
4. Se não mudou: skip (zero writes)
```

### Garantias

- Recálculo é idempotente: rodar duas vezes com mesmo placar produz mesmo resultado
- Não há estado acumulado: `points` é sempre recalculado do zero com os dados atuais
- Palpites sem resultado (`Game.status != FINISHED`) mantêm `points = null`

---

## Modelo de Dados Afetado

```prisma
model Prediction {
  // ...
  points Int?  // null = jogo não encerrado; 0, 1 ou 3 = calculado pelo cron
}
```

`points` é escrito exclusivamente pelo cron — nunca pelo formulário de palpite.

---

## Localização do Código

| Arquivo | Responsabilidade |
|---------|-----------------|
| `lib/scoring.ts` | Função pura `calculatePoints()` |
| `lib/sync.ts` | Cron: atualiza jogos e chama recálculo |
| `lib/scoring.test.ts` | Testes unitários da função |

---

## Fora do Escopo

- Pontuação bônus por fase (ex: gols na final valem mais)
- Pontuação parcial por proximidade de placar (ex: acertou casa mas errou visitante)
- Prorrogação e pênaltis como critério de desempate de palpite
- Desfazer pontuação manualmente

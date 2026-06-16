# Ranking — Spec

## Visão Geral

Página pública `/` com a classificação de todos os participantes cadastrados. Mostra posição, avatar, nickname, pontos totais, acertos de placar exato, acertos de vencedor/empate e jogos palpitados. Dados sempre frescos (sem cache), calculados on-demand via query agregada no banco.

---

## Página `/` — Ranking Geral

**Layout:**

```
#   Participante        Pontos   Exatos   Vencedor   Jogos
──────────────────────────────────────────────────────────
🥇  [avatar] Eduardo      42       8         14        30
🥈  [avatar] João         38       6         12        28
🥉  [avatar] Maria        38       5         14        30
4   [avatar] Pedro         0       0          0         0
```

**Colunas:**

| Coluna | Descrição |
|--------|-----------|
| `#` | Posição no ranking (1º, 2º, 3º com medalha; demais com número) |
| Participante | Avatar (Google) + nickname |
| Pontos | Soma de `Prediction.points` dos jogos encerrados |
| Exatos | Quantidade de palpites com 3 pontos (placar exato) |
| Vencedor | Quantidade de palpites com 1 ponto (acertou vencedor/empate) |
| Jogos | Total de jogos em que fez palpite |

**Todos os usuários cadastrados aparecem**, mesmo sem nenhum palpite (valores zerados).

---

## Ordenação e Desempate

Critérios aplicados em sequência:

1. `totalPoints` decrescente
2. `exactHits` decrescente (acertos de placar exato)
3. `winnerHits` decrescente (acertos de vencedor/empate)
4. `gamesPlayed` decrescente (mais ativo)
5. `nickname` alfabético crescente (determinístico)

---

## Destaques Visuais

- **Posições 1º, 2º, 3º:** medalha (🥇🥈🥉) no lugar do número
- **Linha do usuário logado:** destacada com fundo diferente, mesmo que esteja em qualquer posição
- **Usuários sem palpites:** aparecem ao final (0 pontos), sem destaque especial

---

## Query Agregada

LEFT JOIN de `User` com `Prediction` para garantir que todos os usuários aparecem:

```sql
SELECT
  u.id,
  u.nickname,
  u.image,
  COALESCE(SUM(p.points), 0)                          AS totalPoints,
  COUNT(CASE WHEN p.points = 3 THEN 1 END)            AS exactHits,
  COUNT(CASE WHEN p.points = 1 THEN 1 END)            AS winnerHits,
  COUNT(p.id)                                          AS gamesPlayed
FROM User u
LEFT JOIN Prediction p ON p.userId = u.id
GROUP BY u.id, u.nickname, u.image
ORDER BY
  totalPoints DESC,
  exactHits DESC,
  winnerHits DESC,
  gamesPlayed DESC,
  u.nickname ASC
```

Executada via `prisma.$queryRaw` no Server Component.

---

## Implementação

- **Server Component** com `cache: 'no-store'` — dados sempre atualizados após cada sync do cron
- Sem polling client-side — usuário recarrega a página para ver ranking atualizado
- Sem paginação — grupo de amigos não justifica

---

## Página `/perfil` — Meus Palpites

Mesma lógica, filtrada pelo `userId` do usuário logado. Exibe:

```
Meus palpites

Jogo                  Meu palpite   Resultado   Pontos
──────────────────────────────────────────────────────
Brasil × Argentina    2×1           2×1         3 pts ✓
França × Alemanha     1×0           2×1         1 pt  ~
Espanha × Portugal    —             —           —      (sem palpite)
```

**Estados por linha:**
- Jogo encerrado com palpite: mostra resultado + pontos ganhos
- Jogo encerrado sem palpite: mostra resultado, coluna palpite vazia
- Jogo não encerrado com palpite: mostra meu palpite, resultado `—`
- Jogo não encerrado sem palpite: linha com `—` em tudo, link "Palpitar"

Agrupado por fase (igual à listagem de jogos).

---

## Fora do Escopo

- Ranking por fase (ex: quem foi melhor na fase de grupos)
- Histórico de posições ao longo do torneio
- Ranking de amigos filtrado (subgrupos)
- Paginação
- Exportar ranking (CSV, imagem)

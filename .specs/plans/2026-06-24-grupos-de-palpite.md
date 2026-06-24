# Grupos de Palpite — Plano de Implementação

> Status: proposta · Data: 2026-06-24

## Visão Geral

Hoje o bolão é **global**: todos os usuários cadastrados disputam um único ranking (página `/`). Esta funcionalidade adiciona **grupos privados** — qualquer usuário pode criar um grupo, convidar amigos por um link/código e ver um ranking restrito aos membros daquele grupo.

O ranking geral (`/`) continua existindo como está. Os grupos são uma **camada de visualização** por cima dos mesmos palpites.

> Esta feature traz para o escopo o item antes listado como "fora do escopo" em `ranking.md`: _"Ranking de amigos filtrado (subgrupos)"_.

---

## Decisão de Arquitetura (a mais importante)

**Pergunta:** o palpite é único por jogo, ou o usuário palpita separadamente em cada grupo?

### ✅ Recomendado: palpite global, grupo só filtra o ranking

- Continua **um `Prediction` por usuário por jogo** (`@@unique([userId, gameId])` intacto).
- O usuário dá o palpite **uma vez** e ele conta em **todos** os grupos de que participa.
- Um grupo é apenas um conjunto de membros; o ranking do grupo é a mesma query agregada de hoje, **filtrada** por `WHERE userId IN (membros do grupo)`.

**Por quê:**
- Não quebra nada do que já existe (modelo `Prediction`, server action `savePrediction`, sync, scoring).
- É o comportamento que bolões entre amigos esperam: você palpita uma vez e compete em vários grupos.
- Implementação incremental e de baixo risco — nenhuma mudança nas telas de jogos/palpites.

### ❌ Alternativa: palpite por grupo

Exigiria `groupId` em `Prediction`, trocar a unique para `@@unique([userId, gameId, groupId])`, multiplicar a UI de palpite por grupo e recalcular pontos por grupo. Muito mais complexo, sem ganho real para o caso de uso. **Descartado.**

> O restante deste plano assume a opção recomendada.

---

## Modelo de Dados

Dois modelos novos. Nenhuma mudança em `Game` ou `Prediction`.

```prisma
model Group {
  id         String        @id @default(cuid())
  name       String
  inviteCode String        @unique           // código curto p/ link de convite
  ownerId    String
  createdAt  DateTime      @default(now())
  owner      User          @relation("OwnedGroups", fields: [ownerId], references: [id], onDelete: Cascade)
  members    GroupMember[]
}

model GroupMember {
  id       String   @id @default(cuid())
  groupId  String
  userId   String
  role     String   @default("MEMBER")       // "OWNER" | "MEMBER"
  joinedAt DateTime @default(now())
  group    Group    @relation(fields: [groupId], references: [id], onDelete: Cascade)
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([groupId, userId])                 // não entra duas vezes no mesmo grupo
}
```

Adicionar a `User`:

```prisma
model User {
  // ...campos existentes
  ownedGroups   Group[]       @relation("OwnedGroups")
  groupMembers  GroupMember[]
}
```

**Notas:**
- `inviteCode`: gerar um código curto, único e legível (ex.: 8 chars `A-Z0-9`, sem caracteres ambíguos como `0/O`, `1/I`). Regenerar em caso de colisão.
- O **owner** também é um `GroupMember` (com `role = "OWNER"`) — assim a query de ranking trata todos uniformemente. Criar a membership do dono no mesmo passo da criação do grupo (idealmente numa transação).
- `onDelete: Cascade` garante limpeza ao excluir grupo ou usuário.

### Migration

Como o projeto usa SQLite/Turso via Prisma, gerar a migração com o fluxo padrão do Prisma (`prisma migrate dev` em dev / `prisma migrate deploy` no deploy). Verificar a convenção exata em `node_modules/next/dist/docs/` e nos scripts existentes antes de rodar — conforme `AGENTS.md`. O `build` já roda `prisma generate`.

---

## Rotas e Páginas

| Rota | Tipo | Descrição | Auth |
|------|------|-----------|------|
| `/grupos` | Página | Lista os grupos do usuário logado + botões "Criar" e "Entrar com código" | Requer login |
| `/grupos/novo` | Página/modal | Form de criação (nome do grupo) | Requer login |
| `/grupos/[id]` | Página | Ranking do grupo + membros + link de convite | Membro do grupo |
| `/grupos/entrar/[code]` | Página | Aterrissagem do convite: mostra o grupo e botão "Entrar" | Requer login |

**API / Server Actions:**

| Ação | Forma | Descrição |
|------|-------|-----------|
| Criar grupo | Server Action | Cria `Group` + `GroupMember(OWNER)` numa transação, gera `inviteCode` |
| Entrar no grupo | Server Action | `upsert` de `GroupMember` a partir do `inviteCode` |
| Sair do grupo | Server Action | Remove o `GroupMember` (owner não pode sair sem transferir/excluir) |
| Excluir grupo | Server Action | Só o owner; cascade remove memberships |
| (opcional) Remover membro | Server Action | Só o owner |

Preferir **Server Actions** (padrão já adotado em `src/actions/predictions.ts`), exceto se precisar de endpoint REST para algo client-side específico.

---

## Ranking por Grupo

Reaproveitar a query agregada de `src/app/page.tsx`, adicionando o filtro por membros. Em vez de `LEFT JOIN` em todos os usuários, parte-se dos membros do grupo:

```sql
SELECT
  u.id,
  u.nickname,
  u.image,
  COALESCE(SUM(p.points), 0)                AS totalPoints,
  COUNT(CASE WHEN p.points = 3 THEN 1 END)  AS exactHits,
  COUNT(CASE WHEN p.points = 1 THEN 1 END)  AS winnerHits,
  COUNT(p.id)                               AS gamesPlayed
FROM GroupMember gm
JOIN User u           ON u.id = gm.userId
LEFT JOIN Prediction p ON p.userId = u.id
WHERE gm.groupId = ${groupId}
GROUP BY u.id, u.nickname, u.image
ORDER BY
  totalPoints DESC,
  exactHits DESC,
  winnerHits DESC,
  gamesPlayed DESC,
  u.nickname ASC
```

> **Refatoração sugerida:** extrair a montagem do ranking para uma função reutilizável (ex.: `src/lib/ranking.ts` → `getRanking({ groupId? })`), e fazer tanto `/` (sem `groupId`) quanto `/grupos/[id]` (com `groupId`) consumirem ela. Evita duplicar a lógica de ordenação/mapeamento de `bigint → number`.

Mesmos critérios de ordenação e destaque visual do ranking geral (medalhas 1º/2º/3º, linha do usuário logado destacada).

---

## Fluxo de Convite

1. Owner cria o grupo → recebe um link `…/grupos/entrar/{inviteCode}`.
2. Compartilha o link (WhatsApp etc.).
3. Amigo abre o link:
   - **Não logado:** middleware redireciona para login com retorno para a página de convite.
   - **Logado:** vê nome do grupo + nº de membros e um botão **"Entrar no grupo"**.
4. Ao confirmar, cria-se o `GroupMember` e redireciona para `/grupos/[id]`.
5. Reentrada idempotente: se já é membro, apenas redireciona para o grupo (sem erro).

Botão **"Copiar link de convite"** na página do grupo.

---

## Middleware e Permissões

Atualizar `src/middleware.ts`:

- `/grupos` e subrotas → **exigem autenticação** (não são públicas). Hoje as rotas públicas são `/`, `/jogos`, `/pontuacao`; manter assim e deixar `/grupos*` cair na regra de "rota protegida".
- A página de convite `/grupos/entrar/[code]` exige login, mas deve **preservar o destino** após o login (retornar para o convite, não para `/jogos`).

Validações nas actions/páginas (defesa no servidor, independente do middleware):
- Ver ranking/membros de `/grupos/[id]` → checar que `session.user.id` é membro; senão 404/redirect.
- Excluir grupo / remover membro → checar `role === "OWNER"`.
- Entrar → validar que o `inviteCode` existe.

Considerar um **limite** simples (ex.: máx. N grupos por usuário, máx. M membros por grupo) para evitar abuso — opcional para o MVP.

---

## UI / UX

- **Navegação:** adicionar item "Grupos" no `NavLinks` (visível só quando logado).
- **`/grupos`:** cards de grupo (nome, nº de membros, sua posição atual) + ações "Criar grupo" e "Entrar com código".
- **`/grupos/[id]`:** cabeçalho com nome do grupo, ranking (mesmo componente visual do ranking geral), lista de membros, botão "Copiar convite", e (para o owner) "Excluir grupo".
- **Estado vazio:** grupo recém-criado mostra só o owner; incentivar o compartilhamento do link.
- Seguir o design dark/esports existente (sem emojis no produto final — usar ícones Phosphor, conforme `.specs/design.md`).

---

## Casos de Borda

- Owner sai do grupo → bloquear; oferecer "excluir grupo" ou (futuro) "transferir propriedade".
- Excluir grupo → cascade remove memberships; redirecionar para `/grupos`.
- Usuário sem nenhum palpite aparece no ranking do grupo com tudo zerado (igual ao geral).
- Código de convite inválido/expirado → mensagem clara na página de convite.
- Colisão de `inviteCode` na criação → regenerar e tentar de novo.
- Membro removido pelo owner → deixa de ver o grupo na lista.

---

## Fases de Implementação (incremental)

1. **Modelo + migration:** `Group`, `GroupMember`, relações em `User`. Rodar migração e `prisma generate`.
2. **Criação e ranking:** Server Action de criar grupo; refatorar ranking para `getRanking({ groupId? })`; página `/grupos/[id]` exibindo o ranking filtrado; item no menu.
3. **Convite e entrada:** geração do `inviteCode` + link; página `/grupos/entrar/[code]`; action de entrar; retorno pós-login no middleware.
4. **Gestão:** `/grupos` (lista), sair do grupo, excluir grupo, copiar link; (opcional) remover membro e limites.
5. **Polimento:** estados vazios, mensagens de erro, ajustes de design, e atualização das specs (`ranking.md` e um novo `.specs/grupos.md`).

Cada fase é entregável e testável de forma independente.

---

## Fora de Escopo (por enquanto)

- Palpites diferentes por grupo (ver decisão de arquitetura).
- Grupos públicos / descoberta de grupos.
- Transferência de propriedade do grupo.
- Chat ou mural dentro do grupo.
- Prêmios, apostas ou qualquer aspecto financeiro.
- Ranking por fase dentro do grupo.
- Notificações (e-mail/push) de convite ou de mudança de ranking.

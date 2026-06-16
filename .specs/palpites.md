# Palpites — Spec

## Visão Geral

Formulário de palpite de placar na página `/jogos/[id]`. Um palpite por usuário por jogo. Bloqueio automático quando o jogo começa, com countdown nos últimos 5 minutos. Feedback inline após salvar. Implementado via Server Action do Next.js 15.

---

## Implementação

- **Server Action** para salvar/atualizar palpite (sem endpoint REST separado)
- **Server Component** carrega jogo + palpite existente do usuário no load da página
- **Client Component** gerencia countdown e estado do formulário
- Formulário pré-preenchido com palpite atual se o usuário já palpitou

---

## Formulário

**Layout:**

```
─── Meu palpite ───

[Brasil 🇧🇷]  [Input: 0-99]  ×  [Input: 0-99]  [🇦🇷 Argentina]
                              [Salvar palpite]

✓ Palpite salvo!            (sucesso)
✗ Prazo encerrado.          (erro de bloqueio)
✗ Palpite inválido.         (erro de validação)
```

**Estados do formulário:**

| Estado | Condição | Comportamento |
|--------|----------|--------------|
| Aberto | `startsAt > now() + 5min` | Inputs editáveis, botão ativo |
| Countdown | `startsAt` entre agora e 5 min | Inputs editáveis, contador visível |
| Bloqueado (client) | Countdown chegou a zero | Inputs desabilitados, "Palpites encerrados" |
| Bloqueado (jogo iniciado) | `startsAt <= now()` no load | Formulário não renderizado, mensagem "Palpites encerrados" |
| Salvo com sucesso | Após Server Action ok | Mensagem "✓ Palpite salvo!" inline, formulário permanece |
| Erro | Server Action retorna erro | Mensagem de erro inline, formulário permanece editável |

**Countdown:**
- Ativado quando `startsAt - now() < 5 minutos`
- Exibe: `⏱ Palpites encerram em MM:SS`
- Ao chegar a zero: desabilita inputs e botão no client
- Servidor sempre valida independentemente do client

---

## Fluxo de Dados

```
1. Usuário acessa /jogos/[id]
2. Server Component busca: Game + Prediction do usuário (se existir)
3. Formulário renderiza pré-preenchido com palpite atual
4. Client calcula tempo restante → ativa countdown se < 5 min
5. Usuário edita scores e clica "Salvar palpite"
6. Server Action executa:
   a. Valida sessão (usuário autenticado)
   b. Valida campos (inteiros 0-99)
   c. Verifica Game.startsAt > now()
   d. Upsert em Prediction (cria ou atualiza)
7. Server Action retorna { success: true } ou { error: string }
8. UI exibe mensagem inline
```

---

## Validações (Servidor)

Todas as validações ocorrem no Server Action, independente do client:

| Regra | Erro retornado |
|-------|---------------|
| Usuário autenticado | Redirect para login |
| `homeScore` e `awayScore` presentes | "Palpite inválido" |
| Ambos inteiros entre 0 e 99 | "Palpite inválido" |
| `Game.startsAt > now()` | "Prazo encerrado" |
| Jogo existe | 404 |

---

## Modelo de Dados

```prisma
model Prediction {
  id        String   @id @default(cuid())
  userId    String
  gameId    String
  homeScore Int
  awayScore Int
  points    Int?     // null até o jogo encerrar
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user      User     @relation(fields: [userId], references: [id])
  game      Game     @relation(fields: [gameId], references: [id])

  @@unique([userId, gameId])
}
```

**Notas:**
- `points` é calculado pelo cron após `Game.status = FINISHED` — nunca pelo formulário
- Cada edição do usuário atualiza `homeScore`, `awayScore` e `updatedAt`
- Não há histórico de versões de palpite

---

## Fora do Escopo

- Palpites em múltiplos jogos de uma vez
- Confirmação antes de salvar ("Tem certeza?")
- Histórico de edições do palpite
- Palpite de jogos futuros em lote (ex: toda a fase de grupos de uma vez)
- Notificação quando o prazo está se aproximando (push/email)

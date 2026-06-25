# LGPD — Política de Retenção e Minimização de Dados

Documento **interno** (do controlador). Complementa a [Política de Privacidade](../src/app/privacidade/page.tsx) pública. Registra quais dados pessoais o Bolão trata, por quanto tempo, com que justificativa, e como o descarte é feito.

> Última revisão: 25 de junho de 2026.

## 1. Princípios aplicados

- **Necessidade (art. 6º, III):** coletamos apenas o necessário para operar o bolão.
- **Armazenamento limitado:** dados são mantidos apenas pelo tempo necessário à finalidade ou exigido por lei.
- **Minimização verificada:** cada campo abaixo tem finalidade e base legal explícitas.

## 2. Inventário, finalidade e retenção

| Dado | Origem | Finalidade | Base legal | Retenção |
|------|--------|-----------|------------|----------|
| `nickname` | usuário | identificação pública no ranking/ligas | execução de serviço | enquanto a conta existir |
| `email` | Google | login e identificação da conta | execução de serviço | enquanto a conta existir |
| `name` (nome real) | Google | **necessário** para criar o cliente de cobrança na Asaas e exibir o usuário antes de escolher apelido | execução de serviço / obrigação contratual | enquanto a conta existir |
| `image` (foto) | Google | avatar — reconhecimento dos participantes no ranking (propósito social do produto) | legítimo interesse | enquanto a conta existir |
| Tokens OAuth (`Account`) | Google | manter a sessão autenticada | execução de serviço | enquanto a conta existir |
| Palpites / pontos | usuário | núcleo do serviço (competição) | execução de serviço | enquanto a conta existir |
| Ligas e participações | usuário | rankings privados | execução de serviço | enquanto a conta/liga existir |
| `GroupPayment` PAID | Asaas | comprovação da transação de criação de liga | obrigação legal/fiscal | mantido após exclusão da conta pelo prazo legal |
| `GroupPayment` PENDING | Asaas | checkout em andamento | execução de serviço | **expurgado após expirar** (ver §4) |

## 3. Justificativa de minimização

- **`name` é mantido** porque é necessário, não excedente: o checkout PIX da Asaas (`src/app/api/asaas/checkout/route.ts`) exige um nome real para criar o cliente, e a landing de convite usa o nome antes de o usuário ter apelido.
- **`image` é mantido** sob legítimo interesse: o avatar serve ao propósito social do ranking (reconhecer quem está competindo). Decisão registrada em 2026-06-25; alternativa avaliada (avatares só com iniciais) foi descartada por degradar a experiência sem ganho material de privacidade.
- **Tokens OAuth**: auditado — não são gravados em log em nenhum ponto do código; são usados apenas para a sessão. Acesso restrito ao banco (Turso) e à aplicação.

## 4. Descarte automático (expurgo)

- `cleanupExpiredPayments()` (`src/lib/retention.ts`) remove cobranças `GroupPayment` com status `PENDING` cujo `expiresAt` já passou — checkouts abandonados.
- Executa no **cron diário** (`/api/cron/sync`, 08:00 UTC), de forma **não-fatal**: uma falha no expurgo não interrompe o sync de jogos.
- Pagamentos `PAID` nunca são removidos por aqui (retenção fiscal/legal).

## 5. Descarte a pedido (direito de eliminação)

- O titular pode excluir a própria conta em `/perfil` → `deleteAccount()` (`src/actions/account.ts`).
- O `onDelete: Cascade` do schema remove em cascata palpites, memberships, contas OAuth e pagamentos do usuário.
- Donos de liga são bloqueados até excluir suas ligas (evita apagar ligas com membros sem aviso).
- Export dos dados (acesso/portabilidade): `GET /api/account/export`.

## 6. Revisão

Reavaliar este documento a cada mudança de schema, de operador (Google/Vercel/Turso/Asaas) ou de finalidade de tratamento.

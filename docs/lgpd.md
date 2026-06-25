# LGPD — Conformidade do Bolão Copa 2026

Índice da documentação de proteção de dados. Reúne os artefatos públicos (voltados ao titular) e os internos (voltados ao controlador).

## Documentos públicos (na aplicação)

| Artefato | Onde | Função |
|----------|------|--------|
| Política de Privacidade | `/privacidade` (`src/app/privacidade/page.tsx`) | Transparência ao titular (art. 9º) |
| Termos de Uso | `/termos` (`src/app/termos/page.tsx`) | Regras de uso do serviço |
| Aviso de consentimento | onboarding (`src/app/onboarding/page.tsx`) | Ciência no primeiro acesso |

## Documentos internos (controlador)

| Documento | Função |
|-----------|--------|
| [ROPA](./lgpd-ropa.md) | Registro das operações de tratamento (art. 37) |
| [Retenção e minimização](./lgpd-retencao.md) | O que guardamos, por quanto tempo e por quê |
| [Plano de resposta a incidentes](./lgpd-incidentes.md) | Detecção, contenção e notificação (art. 48) |
| [Encarregado (DPO)](./lgpd-encarregado.md) | Designação e atribuições (art. 41) |

## Mecanismos no código

| Direito / dever | Implementação |
|-----------------|---------------|
| Eliminação (exclusão de conta) | `deleteAccount()` — `src/actions/account.ts` |
| Acesso / portabilidade | `GET /api/account/export` |
| Armazenamento limitado (expurgo) | `cleanupExpiredPayments()` — `src/lib/retention.ts`, via cron diário |
| Canal do titular | eduardolima2417@gmail.com |

> Estes documentos são rascunhos de trabalho. Antes de uso em produção, recomenda-se revisão por profissional jurídico, especialmente a Política de Privacidade e os Termos de Uso.
>
> Última revisão: 25 de junho de 2026.

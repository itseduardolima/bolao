# Refatoração Front — Componentização e Tailwind

> Status: em execução · Data: 2026-06-24

## Objetivo

Manter **exatamente o visual atual**, mas:
1. Eliminar `style={{}}` inline → Tailwind.
2. Parar de repetir inputs/botões/cards soltos → reutilizar/expandir primitivos.
3. Trocar valores arbitrários `text-[rgba(255,255,255,.42)]` por `text-white/42` (Tailwind v4, mesmo pixel) e por tokens semânticos quando já existirem.

Sem mudança de comportamento, sem migração, sem mudança de cor perceptível.

---

## Diagnóstico (inventário)

- **`style={{}}` inline:** 12 arquivos, ~60 ocorrências. Pior caso: `CreateGroupForm` (100% inline).
- **`<button>` cru:** 15 arquivos (vários reimplementam o CTA accent + spinner sem usar `ui/Button`).
- **`<input>` cru:** 5 arquivos (não usam `ui/Input`).
- **Duplicações achadas:**
  - `PointsBadge` reescrito em `perfil/page.tsx` e `GameCard.tsx` — já existe `Badge variant="points-exact|points-winner|points-miss"`.
  - Spinner (`border-2 … animate-spin`) copiado em onboarding (2×), `PredictionForm`, `CreateGroupForm`.
  - "Card" (`bg-surface border border-border rounded-[…] p-[…]`) repetido em perfil (5×), forms e páginas de grupo.
  - "Eyebrow" (label uppercase `tracking-[.14–.22em] text-white/42`) repetido ~12×.

---

## Fundação (primitivos novos / expandidos)

| Componente | Status | Substitui |
|------------|--------|-----------|
| `ui/Card.tsx` | novo | `bg-surface border border-border rounded-[…] p-[…]` |
| `ui/Eyebrow.tsx` | novo | labels uppercase `tracking-… text-white/42` |
| `ui/Spinner.tsx` | novo | os 4 spinners `animate-spin` inline |
| `ui/Button.tsx` | expandir | add `loading` (usa Spinner), variante `cta` (inter, não-upper, rounded-xl, full-width) p/ os CTAs de formulário |
| `ui/Field.tsx` | novo | `<label>` + `<input>` dos forms (onboarding, grupos) |
| `ui/StatCard.tsx` | novo | os 4 cards de métrica do `/perfil` |

`Badge` (points-*) e `Input`/`InputScore` já existem — só passar a usar.

---

## Clusters de execução (cada um = 1 commit, type-check antes)

1. **Fundação** — criar os 6 primitivos acima.
2. **Forms** — `CreateGroupForm`, `JoinGroupForm`, `PredictionForm`, `onboarding/page`.
3. **Páginas** — `perfil/page` (StatCard + Badge + Card + Eyebrow), `grupos/pagamento/[paymentId]/page`.
4. **Grupos** — `GroupTabs`, `InviteLink`, `GroupActions`, `MemberStack`, `RemoveMemberButton`, `JoinGroupButton`, `SignInToJoinButton`.
5. **Jogos/Ranking** — `GameCard`, `GameDetailHeader`, `DateNav`, `RankingTable`, `Avatar`, `MobileNav`.
6. **Sweep de cores** — varredura final `text-[rgba(255,255,255,.NN)]` → `text-white/NN` e `style` de cor → className condicional (`cn()`), em tudo que sobrar.

---

## Regras da refatoração

- **Pixel-exato:** `rgba(255,255,255,.42)` → `text-white/42`; opacidades não-mapeáveis a token continuam com modificador de opacidade do Tailwind, nunca `style`.
- **Cores dinâmicas** (ex.: borda por status de validação) → `cn()` com classes condicionais, não `style`.
- **Sem regressão visual** — conferir cada tela após o cluster.
- `tsc --noEmit` + `eslint` limpos a cada commit.

---

## Fora de escopo

- Redesenho visual / novos componentes de produto.
- Mudança de tokens existentes no `globals.css` (só adicionar, se necessário).
- Testes automatizados de componente.

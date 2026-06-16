# Padrão de Design — Spec

## Identidade Visual

**Estilo:** Dark / Esports — fundo escuro, acentos neon, tipografia condensada e impactante. Clima de placar ao vivo e competição esportiva.

---

## Paleta de Cores

| Token | Valor | Uso |
|-------|-------|-----|
| `--bg-base` | `#0f0f1a` | Fundo principal de todas as páginas |
| `--bg-surface` | `#16162a` | Cards, modais, inputs |
| `--bg-elevated` | `#1e1e36` | Hover de cards, dropdowns |
| `--border` | `#ffffff0f` | Bordas sutis em cards e divisores |
| `--accent` | `#00ff87` | Cor primária: placares, pontos, badges, links, botões |
| `--accent-dim` | `#00ff8722` | Fundo de badges com acento |
| `--accent-border` | `#00ff8744` | Borda de badges com acento |
| `--text-primary` | `#ffffff` | Títulos, nomes de times |
| `--text-secondary` | `#ffffffaa` | Textos de suporte, horários |
| `--text-muted` | `#ffffff44` | Labels, metadados, placeholders |
| `--success` | `#00ff87` | Acerto (mesmo que accent) |
| `--error` | `#ff4d6d` | Erro, palpite errado |
| `--warning` | `#ffd43b` | Countdown, atenção |
| `--live` | `#00ff87` | Badge "Ao vivo" (pisca) |
| `--finished` | `#4dabf7` | Badge "Encerrado" |
| `--scheduled` | `#868e96` | Badge "Agendado" |

---

## Tipografia

### Fontes

| Fonte | Uso | Import |
|-------|-----|--------|
| **Barlow Condensed** | Títulos, placares, nomes de times, ranking | Google Fonts |
| **Inter** | Corpo de texto, labels, descrições | Google Fonts |

```html
<!-- No layout.tsx -->
<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800;900&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
```

### Escala Tipográfica

| Token | Fonte | Tamanho | Peso | Uso |
|-------|-------|---------|------|-----|
| `text-score` | Barlow Condensed | 40px | 900 | Placar em destaque no card |
| `text-team` | Barlow Condensed | 16–18px | 700 | Nome de time |
| `text-section` | Barlow Condensed | 28–32px | 800 | Títulos de seção (RANKING, JOGOS) |
| `text-body` | Inter | 14–15px | 400 | Corpo de texto geral |
| `text-label` | Inter | 11–12px | 500–600 | Labels, badges, metadados |
| `text-nickname` | Inter | 14px | 600 | Nickname no ranking |

---

## Componentes Base

### Card de Jogo

```
┌─────────────────────────────────────────────┐
│ Fase de Grupos · Grupo A        [ENCERRADO] │
│                                             │
│    🇧🇷          2 × 1          🇦🇷          │
│   BRASIL       (verde)      ARGENTINA       │
│                                             │
│ Seu palpite: 2×1               +3 pts ●    │
└─────────────────────────────────────────────┘
```

- Fundo: `--bg-surface` com borda `--border`
- Border-radius: `12px`
- Placar: `text-score` na cor `--accent`
- Palpite + pontos: rodapé separado por linha `--border`
- Sem palpite ainda: rodapé com link "Palpitar →" em `--accent`
- Jogo não iniciado: exibe horário no lugar do placar, em `--text-secondary`

### Badge de Status

```
[AGENDADO]   → bg: --bg-elevated, text: --scheduled
[AO VIVO]    → bg: --accent-dim, text: --accent, borda: --accent-border, animation: pulse
[ENCERRADO]  → bg: #1a3a4a, text: --finished
```

- Border-radius: `4px`
- Font: Inter 11px, weight 600, uppercase

### Pontos Badge

```
+3 pts  → bg: --accent-dim, text: --accent, borda: --accent-border, border-radius: 20px
+1 pt   → bg: #2a2a1a, text: --warning, borda: #ffd43b44
0 pts   → bg: --bg-elevated, text: --text-muted
```

### Botão Primário

```
bg: --accent
text: #0f0f1a (escuro para contraste)
font: Barlow Condensed 16px, weight 700, uppercase
border-radius: 6px
padding: 10px 24px
hover: opacity 0.85
disabled: opacity 0.3, cursor: not-allowed
```

### Input de Placar

```
bg: --bg-elevated
border: 1px solid --border
border-radius: 6px
text: --text-primary, Barlow Condensed 24px, weight 800, text-align: center
width: 64px
focus: border-color: --accent
```

### Linha do Ranking

```
┌────────────────────────────────────────────────────────┐
│  🥇  [avatar]  eduardo_    42 pts   8    14    30      │
│  (highlight se for o usuário logado: bg --bg-elevated) │
└────────────────────────────────────────────────────────┘
```

- Posição: Barlow Condensed 20px weight 800
- Nickname: Inter 14px weight 600
- Pontos: Barlow Condensed 18px weight 700, cor `--accent`
- Colunas menores (exatos, vencedor, jogos): Inter 14px, `--text-secondary`

---

## Layout Geral

### Estrutura das Páginas

```
┌──────────────────────────────────────┐
│  [LOGO] BOLÃO 2026   [nav]  [avatar] │  ← Header fixo, bg: #0a0a14
├──────────────────────────────────────┤
│                                      │
│         Conteúdo da página           │  ← max-width: 960px, centralizado
│                                      │
└──────────────────────────────────────┘
```

- Header: `bg: #0a0a14`, borda inferior `--border`, altura `56px`
- Logo: "BOLÃO 2026" em Barlow Condensed 22px weight 900, cor `--accent`
- Nav links: Inter 14px weight 500, `--text-secondary` → hover `--text-primary`
- Conteúdo: `padding: 32px 16px`, `max-width: 960px`, `margin: 0 auto`

### Separadores de Seção (fases, datas)

```
FASE DE GRUPOS                    ← Barlow Condensed 13px, weight 700, --text-muted, uppercase, letter-spacing: 2px
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ← border-top: 1px solid --border
Segunda, 11 Jun                   ← Inter 12px, --text-muted
```

---

## Animações e Feedback

| Elemento | Animação |
|----------|----------|
| Badge "AO VIVO" | `pulse` suave na cor `--accent` (opacity 1 → 0.5, 1.5s loop) |
| Salvar palpite (sucesso) | Fade in mensagem "✓ Palpite salvo!" em `--accent` |
| Salvar palpite (erro) | Shake + mensagem em `--error` |
| Countdown | Cor muda para `--warning` nos últimos 60s |
| Hover em card | `translateY(-1px)` + `box-shadow: 0 4px 20px #00ff8715` |

---

## Tailwind Config

Adicionar ao `tailwind.config.ts`:

```ts
theme: {
  extend: {
    colors: {
      accent: '#00ff87',
      base: '#0f0f1a',
      surface: '#16162a',
      elevated: '#1e1e36',
    },
    fontFamily: {
      barlow: ['"Barlow Condensed"', 'Impact', 'sans-serif'],
      inter: ['Inter', 'system-ui', 'sans-serif'],
    },
  },
}
```

---

## Responsividade

- **Mobile (< 640px):** cards em coluna única, placar centralizado, nav colapsado em menu hamburguer
- **Tablet (640–960px):** cards em grade 2 colunas
- **Desktop (> 960px):** cards em grade 2–3 colunas, ranking em tabela completa

---

## Ícones

**Biblioteca:** [Phosphor Icons](https://phosphoricons.com/) via `@phosphor-icons/react`

```bash
npm install @phosphor-icons/react
```

**Estilo padrão:** `Bold` — peso visual compatível com o tema dark e tipografia condensada.

**Uso:**
```tsx
import { Trophy, SoccerBall, Clock, CheckCircle, XCircle } from '@phosphor-icons/react'

// Sempre especificar weight="bold" ou usar o Provider global
<Trophy size={20} weight="bold" color="var(--accent)" />
```

**Referência de ícones por contexto:**

| Contexto | Ícone |
|----------|-------|
| Ranking / troféu | `Trophy` |
| Jogo / bola | `SoccerBall` |
| Horário / agendado | `Clock` |
| Ao vivo | `RadioButton` (com pulse) |
| Encerrado | `CheckCircle` |
| Acerto exato | `Target` |
| Acerto vencedor | `ThumbsUp` |
| Erro / 0 pts | `XCircle` |
| Palpite | `PencilSimple` |
| Perfil | `UserCircle` |
| Sair | `SignOut` |
| Countdown | `Timer` |

**Não usar emojis em nenhuma parte do site** — substituir bandeiras de países por `<img>` com a URL do crest da football-data.org (campo `homeFlag`/`awayFlag` no banco).

---

## Fora do Escopo

- Modo claro (light theme)
- Tema customizável pelo usuário
- Animações complexas / transições de página
- Design system completo com Storybook

# Auth — Spec

## Visão Geral

Autenticação via Google OAuth usando Auth.js v5 (NextAuth). Cadastro aberto: qualquer pessoa com o link pode entrar. No primeiro acesso, o usuário escolhe um apelido único antes de usar o site.

---

## Provider

| Item | Detalhe |
|------|---------|
| Library | Auth.js v5 (`next-auth@beta`) |
| Provider | Google OAuth |
| Strategy de sessão | JWT (sem tabela de sessão no banco) |
| Configuração central | `auth.ts` na raiz do projeto |

---

## Fluxo de Autenticação

### Primeiro acesso
```
1. Usuário clica "Entrar com Google"
2. Redirect para Google OAuth
3. Google retorna: nome, email, avatar
4. Auth.js cria User no banco com hasNickname = false
5. Middleware detecta hasNickname = false → redirect para /onboarding
6. Usuário digita e confirma nickname
7. Banco atualiza: nickname = escolhido, hasNickname = true
8. Redirect para /jogos
```

### Acessos seguintes
```
1. Usuário clica "Entrar com Google"
2. Auth.js atualiza avatar se mudou
3. Middleware verifica hasNickname = true → passa direto
4. Usuário vai para a rota que tentou acessar (ou /jogos)
```

---

## Proteção de Rotas (Middleware)

Arquivo: `middleware.ts` na raiz do projeto.

| Rota | Acesso |
|------|--------|
| `/` | Público |
| `/jogos` | Público |
| `/api/auth/*` | Público |
| `/api/cron/*` | Interno (CRON_SECRET header) |
| `/jogos/[id]` | Autenticado + nickname |
| `/perfil` | Autenticado + nickname |
| `/onboarding` | Autenticado (sem nickname) |

**Regras do middleware:**
1. Usuário não autenticado tentando rota protegida → redirect para `/?login=1`
2. Usuário autenticado sem nickname em qualquer rota (exceto `/onboarding` e `/api/*`) → redirect para `/onboarding`
3. Usuário autenticado com nickname tentando acessar `/onboarding` → redirect para `/jogos`

---

## Sessão JWT

O token JWT contém:

```ts
{
  id: string
  name: string       // nome do Google
  email: string
  image: string      // avatar do Google
  nickname: string | null
  hasNickname: boolean
}
```

`hasNickname` é incluído no token para evitar query ao banco a cada verificação de middleware.

O token é atualizado quando o nickname é salvo (via `update()` do Auth.js).

---

## Tela de Onboarding (`/onboarding`)

Campos:
- Input de nickname

Validações (client + server):
- Mínimo 3 caracteres
- Máximo 20 caracteres
- Apenas letras (`a-z`, `A-Z`), números (`0-9`) e underscore (`_`)
- Regex: `/^[a-zA-Z0-9_]{3,20}$/`
- Único no banco

UX:
- Verificação de disponibilidade em tempo real (debounce 300ms) via `GET /api/nickname/check?value=xxx`
- Feedback visual: disponível (verde) / indisponível (vermelho) / checando (cinza)
- Botão "Confirmar" só habilita quando nickname é válido e disponível
- Erro de conflito (race condition): mensagem "Esse apelido já foi escolhido, tente outro"

---

## Modelo de Dados (adições ao User)

```prisma
model User {
  // campos existentes (id, name, email, image, createdAt)
  nickname    String?  @unique
  hasNickname Boolean  @default(false)
}
```

**Restrições:**
- `nickname` é único no banco (`@unique`)
- Validação de formato feita na camada de API antes de salvar
- `hasNickname` sincroniza com `nickname != null` (ambos atualizados juntos)

---

## Endpoints de API

### `GET /api/nickname/check?value=xxx`
- Autenticado
- Verifica se o nickname está disponível
- Retorna: `{ available: boolean }`
- Não expõe qual usuário tem o nickname

### `POST /api/nickname`
- Autenticado
- Body: `{ nickname: string }`
- Valida formato e unicidade
- Salva no banco e chama `session.update()` para atualizar JWT
- Retorna: `{ success: true }` ou erro de validação

---

## Fora do Escopo

- Troca de nickname após onboarding (pode ser spec futura)
- Login com outros providers (GitHub, email/senha)
- Logout confirmado (basta o botão padrão do NextAuth)
- Moderação de nicknames ofensivos

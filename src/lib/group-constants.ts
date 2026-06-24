// Constantes e validadores PUROS de grupos — seguros para o cliente.
// NÃO importe prisma/crypto aqui: este módulo pode ser incluído no bundle do
// navegador (usado por client components para limites e formatação de input).

export const GROUP_NAME_MIN = 3
export const GROUP_NAME_MAX = 30
export const INVITE_CODE_LENGTH = 8
export const MAX_GROUPS_OWNED = 20
export const MAX_GROUPS_JOINED = 50
export const MAX_MEMBERS_PER_GROUP = 100

export const GROUP_ROLE = { OWNER: 'OWNER', MEMBER: 'MEMBER' } as const

// Alfabeto sem caracteres ambíguos (sem I, L, O, 0, 1) — códigos legíveis.
export const INVITE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
export const INVITE_CODE_REGEX = new RegExp(`^[${INVITE_ALPHABET}]{${INVITE_CODE_LENGTH}}$`)

/**
 * True se a string contiver caracteres não permitidos em nomes: controles
 * C0/C1/DEL e caracteres de formatação Unicode perigosos (zero-width, bidi
 * override/isolate, BOM) — usados para spoofing visual de nomes. Emojis
 * (pares substitutos U+D800–U+DFFF) NÃO são afetados pelos intervalos abaixo.
 */
function hasDisallowedChars(value: string): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i)
    if (code < 0x20 || (code >= 0x7f && code <= 0x9f)) return true // C0, DEL, C1
    if (code >= 0x200b && code <= 0x200f) return true // zero-width + LRM/RLM
    if (code >= 0x202a && code <= 0x202e) return true // bidi embeddings/overrides
    if (code >= 0x2066 && code <= 0x2069) return true // bidi isolates
    if (code === 0xfeff) return true // BOM / ZWNBSP
  }
  return false
}

/**
 * Normaliza e valida o nome do grupo. Retorna o nome saneado ou `null` se
 * inválido. Colapsa espaços, corta nas pontas e rejeita caracteres de
 * controle (incluindo quebras de linha) para evitar nomes maliciosos.
 */
export function normalizeGroupName(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const name = raw.replace(/\s+/g, ' ').trim()
  if (name.length < GROUP_NAME_MIN || name.length > GROUP_NAME_MAX) return null
  if (hasDisallowedChars(name)) return null
  return name
}

/**
 * Normaliza e valida um código de convite. Faz uppercase e trim, e exige bater
 * exatamente com o alfabeto/length esperados. Retorna o código canônico ou `null`.
 */
export function normalizeInviteCode(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const code = raw.trim().toUpperCase()
  if (!INVITE_CODE_REGEX.test(code)) return null
  return code
}

/** Caminho relativo da página de convite a partir de um código. */
export function buildInvitePath(code: string): string {
  return `/grupos/entrar/${code}`
}

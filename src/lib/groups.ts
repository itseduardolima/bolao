import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { INVITE_ALPHABET, INVITE_CODE_LENGTH, GROUP_ROLE } from '@/lib/group-constants'

// Reexporta as constantes/validadores puros para uso server-side conveniente.
export * from '@/lib/group-constants'

/**
 * Gera um código de convite aleatório e uniforme (rejection sampling para
 * eliminar viés de módulo). Usa CSPRNG (`crypto.randomBytes`). Server-only.
 */
export function generateInviteCode(): string {
  const max = Math.floor(256 / INVITE_ALPHABET.length) * INVITE_ALPHABET.length
  let code = ''
  while (code.length < INVITE_CODE_LENGTH) {
    const byte = randomBytes(1)[0]
    if (byte >= max) continue // descarta para manter distribuição uniforme
    code += INVITE_ALPHABET[byte % INVITE_ALPHABET.length]
  }
  return code
}

/** Detecta violação de unique constraint do Prisma (P2002) de forma robusta. */
export function isUniqueConstraintError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false
  const code = (err as { code?: unknown }).code
  if (code === 'P2002') return true
  const message = (err as { message?: unknown }).message
  return typeof message === 'string' && message.includes('Unique constraint')
}

/**
 * Cria o grupo e a membership do dono numa única operação atômica, gerando um
 * inviteCode único. Tenta novamente caso (raríssimo) o código colida.
 */
export async function createGroupWithUniqueCode(
  name: string,
  ownerId: string
): Promise<{ id: string; inviteCode: string }> {
  const MAX_ATTEMPTS = 5
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const inviteCode = generateInviteCode()
    try {
      return await prisma.group.create({
        data: {
          name,
          inviteCode,
          ownerId,
          members: { create: { userId: ownerId, role: GROUP_ROLE.OWNER } },
        },
        select: { id: true, inviteCode: true },
      })
    } catch (err) {
      // Só continua em colisão de inviteCode; outros erros sobem.
      if (isUniqueConstraintError(err) && attempt < MAX_ATTEMPTS - 1) continue
      throw err
    }
  }
  throw new Error('Não foi possível gerar um código de convite único')
}

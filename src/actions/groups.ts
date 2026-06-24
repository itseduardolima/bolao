'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  GROUP_NAME_MIN,
  GROUP_NAME_MAX,
  MAX_GROUPS_OWNED,
  MAX_GROUPS_JOINED,
  MAX_MEMBERS_PER_GROUP,
  GROUP_ROLE,
  normalizeGroupName,
  normalizeInviteCode,
  generateInviteCode,
  isUniqueConstraintError,
  createGroupWithUniqueCode,
} from '@/lib/groups'

// ─────────────────────────────────────────────────────────────────────────
// IMPORTANTE (segurança): server actions são POSTs que NÃO passam pelas regras
// de redirect do middleware. Por isso cada action revalida `auth()` e deriva o
// ator SEMPRE da sessão — nunca confia em id de usuário vindo do cliente.
// Toda autorização é feita no servidor; mutações de dono usam guardas atômicas
// (deleteMany/updateMany com filtro de ownerId) para evitar TOCTOU.
// ─────────────────────────────────────────────────────────────────────────

export type CreateGroupResult = { success: true; groupId: string } | { error: string }
export type JoinGroupResult = { success: true; groupId: string } | { error: string }
export type RegenerateResult = { success: true; inviteCode: string } | { error: string }
export type ActionResult = { success: true } | { error: string }

const NOT_AUTHED = 'Não autenticado'
const NO_PROFILE = 'Complete seu cadastro (apelido) antes de continuar'

async function requireUser() {
  const session = await auth()
  if (!session?.user?.id) return null
  return session.user
}

/**
 * Confirma NO BANCO que o usuário tem apelido. `hasNickname` no JWT é um cache
 * que o cliente pode forjar via o trigger `update` do next-auth, portanto não é
 * autoritativo para gates — re-derivamos da fonte da verdade.
 */
async function hasNicknameInDb(userId: string): Promise<boolean> {
  const profile = await prisma.user.findUnique({
    where: { id: userId },
    select: { hasNickname: true },
  })
  return profile?.hasNickname === true
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

/** Cria um grupo (o criador vira dono/membro). */
export async function createGroup(rawName: unknown): Promise<CreateGroupResult> {
  const user = await requireUser()
  if (!user) return { error: NOT_AUTHED }
  if (!(await hasNicknameInDb(user.id))) return { error: NO_PROFILE }

  const name = normalizeGroupName(rawName)
  if (!name) {
    return { error: `O nome deve ter entre ${GROUP_NAME_MIN} e ${GROUP_NAME_MAX} caracteres` }
  }

  const owned = await prisma.group.count({ where: { ownerId: user.id } })
  if (owned >= MAX_GROUPS_OWNED) {
    return { error: `Você atingiu o limite de ${MAX_GROUPS_OWNED} grupos criados` }
  }

  try {
    const group = await createGroupWithUniqueCode(name, user.id)
    revalidatePath('/grupos')
    return { success: true, groupId: group.id }
  } catch {
    return { error: 'Erro ao criar grupo. Tente novamente.' }
  }
}

/** Entra em um grupo a partir do código de convite (capability). Idempotente. */
export async function joinGroup(rawCode: unknown): Promise<JoinGroupResult> {
  const user = await requireUser()
  if (!user) return { error: NOT_AUTHED }
  if (!(await hasNicknameInDb(user.id))) return { error: NO_PROFILE }

  const code = normalizeInviteCode(rawCode)
  if (!code) return { error: 'Código de convite inválido' }

  const group = await prisma.group.findUnique({
    where: { inviteCode: code },
    select: { id: true, _count: { select: { members: true } } },
  })
  if (!group) return { error: 'Convite não encontrado ou expirado' }

  // Já é membro? Operação idempotente — sucesso direto.
  const existing = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: group.id, userId: user.id } },
    select: { id: true },
  })
  if (existing) {
    revalidatePath('/grupos')
    return { success: true, groupId: group.id }
  }

  // Cotas SOFT (anti-abuso). São check-then-insert não-transacionais: sob
  // concorrência extrema podem estourar por poucas unidades. Aceito de forma
  // consciente — não há impacto de segurança/pontuação, e a invariante crítica
  // (sem dupla-membership) é garantida pela unique constraint abaixo.
  if (group._count.members >= MAX_MEMBERS_PER_GROUP) {
    return { error: 'Este grupo está cheio' }
  }

  const joined = await prisma.groupMember.count({ where: { userId: user.id } })
  if (joined >= MAX_GROUPS_JOINED) {
    return { error: `Você atingiu o limite de ${MAX_GROUPS_JOINED} grupos` }
  }

  try {
    await prisma.groupMember.create({
      data: { groupId: group.id, userId: user.id, role: GROUP_ROLE.MEMBER },
    })
  } catch (err) {
    // Corrida: outra aba/requisição entrou ao mesmo tempo → trata como sucesso.
    if (isUniqueConstraintError(err)) {
      revalidatePath('/grupos')
      return { success: true, groupId: group.id }
    }
    return { error: 'Erro ao entrar no grupo. Tente novamente.' }
  }

  revalidatePath('/grupos')
  revalidatePath(`/grupos/${group.id}`)
  return { success: true, groupId: group.id }
}

/** Sai de um grupo. O dono não pode sair (precisa excluir o grupo). */
export async function leaveGroup(rawGroupId: unknown): Promise<ActionResult> {
  const user = await requireUser()
  if (!user) return { error: NOT_AUTHED }
  if (!isNonEmptyString(rawGroupId)) return { error: 'Grupo inválido' }
  const groupId = rawGroupId

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { ownerId: true },
  })
  if (!group) return { error: 'Grupo não encontrado' }
  if (group.ownerId === user.id) {
    return { error: 'O dono não pode sair. Exclua o grupo.' }
  }

  // deleteMany é idempotente: remove só a própria membership; 0 linhas se já saiu.
  await prisma.groupMember.deleteMany({ where: { groupId, userId: user.id } })
  revalidatePath('/grupos')
  revalidatePath(`/grupos/${groupId}`)
  return { success: true }
}

/** Exclui um grupo. Apenas o dono. Guarda de autorização atômica. */
export async function deleteGroup(rawGroupId: unknown): Promise<ActionResult> {
  const user = await requireUser()
  if (!user) return { error: NOT_AUTHED }
  if (!isNonEmptyString(rawGroupId)) return { error: 'Grupo inválido' }
  const groupId = rawGroupId

  // Autorização + ação numa só query: só apaga se o ator for o dono.
  const res = await prisma.group.deleteMany({
    where: { id: groupId, ownerId: user.id },
  })
  if (res.count === 0) {
    return { error: 'Você não tem permissão para excluir este grupo' }
  }

  revalidatePath('/grupos')
  return { success: true }
}

/** Remove um membro. Apenas o dono; não pode remover a si mesmo por aqui. */
export async function removeMember(
  rawGroupId: unknown,
  rawTargetUserId: unknown
): Promise<ActionResult> {
  const user = await requireUser()
  if (!user) return { error: NOT_AUTHED }
  if (!isNonEmptyString(rawGroupId) || !isNonEmptyString(rawTargetUserId)) {
    return { error: 'Dados inválidos' }
  }
  const groupId = rawGroupId
  const targetUserId = rawTargetUserId

  if (targetUserId === user.id) {
    return { error: 'Você não pode remover a si mesmo. Exclua o grupo.' }
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { ownerId: true },
  })
  if (!group) return { error: 'Grupo não encontrado' }
  if (group.ownerId !== user.id) return { error: 'Sem permissão' }

  // Não permite remover o dono (defesa extra, mesmo que ownerId === user.id já barre).
  await prisma.groupMember.deleteMany({
    where: { groupId, userId: targetUserId, role: { not: GROUP_ROLE.OWNER } },
  })
  revalidatePath(`/grupos/${groupId}`)
  return { success: true }
}

/** Gera um novo código de convite, invalidando o anterior. Apenas o dono. */
export async function regenerateInviteCode(rawGroupId: unknown): Promise<RegenerateResult> {
  const user = await requireUser()
  if (!user) return { error: NOT_AUTHED }
  if (!isNonEmptyString(rawGroupId)) return { error: 'Grupo inválido' }
  const groupId = rawGroupId

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: { ownerId: true },
  })
  if (!group) return { error: 'Grupo não encontrado' }
  if (group.ownerId !== user.id) return { error: 'Sem permissão' }

  const MAX_ATTEMPTS = 5
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const inviteCode = generateInviteCode()
    try {
      // updateMany com guarda de ownerId: evita corrida de autorização.
      const res = await prisma.group.updateMany({
        where: { id: groupId, ownerId: user.id },
        data: { inviteCode },
      })
      if (res.count === 0) return { error: 'Sem permissão' }
      revalidatePath(`/grupos/${groupId}`)
      return { success: true, inviteCode }
    } catch (err) {
      if (isUniqueConstraintError(err) && attempt < MAX_ATTEMPTS - 1) continue
      return { error: 'Erro ao gerar novo código' }
    }
  }
  return { error: 'Erro ao gerar novo código' }
}

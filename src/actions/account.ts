'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// ─────────────────────────────────────────────────────────────────────────
// IMPORTANTE (segurança): server actions são POSTs que NÃO passam pelo redirect
// do proxy. O ator é SEMPRE derivado da sessão (auth()) — nunca de um id
// vindo do cliente. A limpeza do cookie de sessão é feita no client (signOut do
// next-auth/react) após o sucesso, seguindo a convenção do projeto.
// ─────────────────────────────────────────────────────────────────────────

export type DeleteAccountResult = { success: true } | { error: string }

/**
 * Exclui a conta do usuário autenticado e todos os seus dados pessoais.
 *
 * `onDelete: Cascade` no schema remove em cascata palpites, memberships, contas
 * OAuth e pagamentos. Donos de liga são BLOQUEADOS: precisam excluir suas ligas
 * antes, para que ligas com membros não desapareçam silenciosamente (decisão de
 * produto — a exclusão não é negada, apenas sequenciada).
 */
export async function deleteAccount(): Promise<DeleteAccountResult> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { error: 'Não autenticado' }

  const ownedGroups = await prisma.group.count({ where: { ownerId: userId } })
  if (ownedGroups > 0) {
    return {
      error:
        ownedGroups === 1
          ? 'Você é dono de 1 liga. Exclua-a em "Grupos" antes de apagar sua conta.'
          : `Você é dono de ${ownedGroups} ligas. Exclua-as em "Grupos" antes de apagar sua conta.`,
    }
  }

  try {
    await prisma.user.delete({ where: { id: userId } })
  } catch {
    return { error: 'Não foi possível excluir a conta. Tente novamente.' }
  }

  return { success: true }
}

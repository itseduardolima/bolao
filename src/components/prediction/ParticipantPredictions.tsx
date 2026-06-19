import { prisma } from '@/lib/prisma'
import Avatar from '@/components/ui/Avatar'

type ParticipantPredictionsProps = {
  gameId: string
  currentUserId?: string
  showStats?: boolean
}

export default async function ParticipantPredictions({
  gameId,
  currentUserId,
  showStats = true,
}: ParticipantPredictionsProps) {
  const predictions = await prisma.prediction.findMany({
    where: { gameId },
    include: {
      user: { select: { id: true, nickname: true, image: true } },
    },
    orderBy: [{ points: 'desc' }, { user: { nickname: 'asc' } }],
  })

  if (predictions.length === 0) return null

  const total = predictions.length
  const exact = predictions.filter((p) => p.points === 3).length
  const winner = predictions.filter((p) => p.points === 1).length
  const miss = predictions.filter((p) => p.points === 0).length

  const pct = (n: number) =>
    total > 0 ? Math.round((n / total) * 100) + '%' : '0%'

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h3 className="mb-4 font-barlow text-[13px] font-bold uppercase tracking-[2px] text-secondary">
          Palpites dos participantes
        </h3>
        <div className="flex flex-col gap-2">
          {predictions.map((p) => (
            <div
              key={p.id}
              className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                p.user.id === currentUserId ? 'bg-elevated' : 'bg-surface'
              }`}
            >
              <div className="flex items-center gap-3">
                <Avatar
                  src={p.user.image ?? null}
                  name={p.user.nickname ?? 'U'}
                  size={28}
                />
                <span className="font-inter text-sm font-semibold text-primary">
                  {p.user.nickname ?? 'Sem apelido'}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-barlow text-lg font-bold text-secondary">
                  {p.homeScore} × {p.awayScore}
                </span>
                {p.points !== null && (
                  <span
                    className={`rounded-full px-2 py-0.5 font-inter text-xs font-semibold ${
                      p.points === 3
                        ? 'border border-accent-border bg-accent-dim text-accent'
                        : p.points === 1
                        ? 'border border-warning-border bg-warning-dim text-warning'
                        : 'bg-elevated text-secondary'
                    }`}
                  >
                    {p.points === 3 ? '+3' : p.points === 1 ? '+1' : '0'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {showStats && (
        <div>
          <h3 className="mb-4 font-barlow text-[13px] font-bold uppercase tracking-[2px] text-secondary">
            Estatísticas
          </h3>
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5">
            <div className="flex justify-between font-inter text-sm">
              <span className="text-secondary">Placar exato</span>
              <span className="font-semibold text-accent">
                {exact} pessoa{exact !== 1 ? 's' : ''} ({pct(exact)})
              </span>
            </div>
            <div className="flex justify-between font-inter text-sm">
              <span className="text-secondary">Acertaram o vencedor</span>
              <span className="font-semibold text-warning">
                {winner} pessoa{winner !== 1 ? 's' : ''} ({pct(winner)})
              </span>
            </div>
            <div className="flex justify-between font-inter text-sm">
              <span className="text-secondary">Erraram</span>
              <span className="font-semibold text-secondary">
                {miss} pessoa{miss !== 1 ? 's' : ''} ({pct(miss)})
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import Container from '@/components/layout/Container'
import SectionTitle from '@/components/layout/SectionTitle'
import { CheckCircle, XCircle, Equals } from '@phosphor-icons/react/dist/ssr'

const examples = [
  {
    result: '2 × 1',
    prediction: '2 × 1',
    points: 3,
    reason: 'Placar exato',
  },
  {
    result: '2 × 1',
    prediction: '3 × 1',
    points: 1,
    reason: 'Acertou o vencedor',
  },
  {
    result: '2 × 1',
    prediction: '1 × 2',
    points: 0,
    reason: 'Errou',
  },
  {
    result: '1 × 1',
    prediction: '1 × 1',
    points: 3,
    reason: 'Placar exato',
  },
  {
    result: '1 × 1',
    prediction: '2 × 2',
    points: 1,
    reason: 'Acertou o empate',
  },
  {
    result: '1 × 1',
    prediction: '2 × 1',
    points: 0,
    reason: 'Errou',
  },
  {
    result: '1 × 1 (pên.)',
    prediction: '1 × 1',
    points: 3,
    reason: 'Placar do tempo normal conta',
  },
  {
    result: '1 × 1 (pên.)',
    prediction: '2 × 2',
    points: 1,
    reason: 'Acertou o empate no tempo normal',
  },
]

function PointsBadge({ points }: { points: number }) {
  if (points === 3) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-accent-border bg-accent-dim px-2.5 py-0.5 font-inter text-xs font-semibold text-accent">
        <CheckCircle size={13} weight="fill" />
        +3 pts
      </span>
    )
  }
  if (points === 1) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-warning-border bg-warning-dim px-2.5 py-0.5 font-inter text-xs font-semibold text-warning">
        <Equals size={13} weight="bold" />
        +1 pt
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-elevated px-2.5 py-0.5 font-inter text-xs font-semibold text-secondary">
      <XCircle size={13} weight="fill" />
      0 pts
    </span>
  )
}

export default function PontuacaoPage() {
  return (
    <Container>
      <SectionTitle className="mb-2">Como Pontuar</SectionTitle>
      <p className="mb-8 font-inter text-sm text-secondary">
        Entenda as regras do bolão e maximize seus pontos.
      </p>

      {/* Regras */}
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <CheckCircle size={22} weight="fill" className="text-accent" />
            <span className="font-barlow text-2xl font-black text-accent">3 pts</span>
          </div>
          <p className="font-inter text-sm font-semibold text-primary">Placar exato</p>
          <p className="font-inter text-xs text-secondary">
            Acertou o placar certinho: casa e visitante.
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <Equals size={22} weight="bold" className="text-warning" />
            <span className="font-barlow text-2xl font-black text-warning">1 pt</span>
          </div>
          <p className="font-inter text-sm font-semibold text-primary">Vencedor ou empate</p>
          <p className="font-inter text-xs text-secondary">
            Acertou quem ganhou ou que seria empate, mas errou o placar.
          </p>
        </div>

        <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <XCircle size={22} weight="fill" className="text-secondary" />
            <span className="font-barlow text-2xl font-black text-secondary">0 pts</span>
          </div>
          <p className="font-inter text-sm font-semibold text-primary">Errou</p>
          <p className="font-inter text-xs text-secondary">
            Chutou o vencedor errado ou errou o empate.
          </p>
        </div>
      </div>

      {/* Observação prorrogação */}
      <div className="mb-8 rounded-xl border border-border bg-elevated px-4 py-3">
        <p className="font-inter text-sm text-secondary">
          <span className="font-semibold text-primary">Prorrogação e pênaltis:</span>{' '}
          a pontuação usa sempre o placar do tempo normal (90 min). Se o jogo foi para a prorrogação, o que conta é o 0 × 0 ou 1 × 1 do tempo regulamentar.
        </p>
      </div>

      {/* Tabela de exemplos */}
      <h3 className="mb-3 font-barlow text-sm font-bold uppercase tracking-widest text-secondary">
        Exemplos
      </h3>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-border bg-elevated">
              <th className="px-4 py-3 text-left font-inter text-[11px] uppercase tracking-widest text-secondary">
                Resultado
              </th>
              <th className="px-4 py-3 text-left font-inter text-[11px] uppercase tracking-widest text-secondary">
                Seu palpite
              </th>
              <th className="px-4 py-3 text-left font-inter text-[11px] uppercase tracking-widest text-secondary">
                Pontos
              </th>
              <th className="hidden px-4 py-3 text-left font-inter text-[11px] uppercase tracking-widest text-secondary sm:table-cell">
                Por quê
              </th>
            </tr>
          </thead>
          <tbody>
            {examples.map((ex, i) => (
              <tr key={i} className="border-b border-border last:border-b-0">
                <td className="px-4 py-3">
                  <span className="font-barlow font-bold text-primary">{ex.result}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-barlow font-bold text-primary">{ex.prediction}</span>
                </td>
                <td className="px-4 py-3">
                  <PointsBadge points={ex.points} />
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <span className="font-inter text-sm text-secondary">{ex.reason}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dicas */}
      <div className="mt-8 space-y-2">
        <h3 className="font-barlow text-sm font-bold uppercase tracking-widest text-secondary">
          Dicas
        </h3>
        <ul className="space-y-2">
          {[
            'Palpites ficam travados assim que o jogo começa — envie antes do apito inicial.',
            'Você pode alterar seu palpite quantas vezes quiser até o jogo começar.',
            'Nos mata-matas, o placar do tempo normal é o que vale, não o resultado final com prorrogação.',
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-0.5 font-barlow text-sm font-bold text-accent">→</span>
              <span className="font-inter text-sm text-secondary">{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </Container>
  )
}

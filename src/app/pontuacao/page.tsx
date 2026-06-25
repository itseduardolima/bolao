import Container from '@/components/layout/Container'
import PointsBadge from '@/components/ui/PointsBadge'

export const metadata = {
  title: 'Como funciona a pontuação',
  description:
    'Entenda como os palpites viram pontos no Bolão Copa 2026: placar exato vale 3, acerto do vencedor vale 1.',
  alternates: { canonical: '/pontuacao' },
}

const EXAMPLES = [
  { result: '2 - 1', prediction: '2 - 1', points: 3, reason: 'Placar idêntico.' },
  { result: '2 - 1', prediction: '3 - 0', points: 1, reason: 'Acertou que o mandante venceu.' },
  { result: '1 - 1', prediction: '0 - 0', points: 1, reason: 'Acertou o empate, errou o placar.' },
  { result: '0 - 2', prediction: '1 - 0', points: 0, reason: 'Vencedor errado.' },
]

const TIPS = [
  'Em jogos de mata-mata decididos na prorrogação ou nos pênaltis, conta apenas o placar dos 90 minutos.',
  'Você pode editar o palpite quantas vezes quiser, até o apito inicial da partida.',
  'A mesma pontuação vale no ranking geral e em todas as suas ligas.',
]

export default function PontuacaoPage() {
  return (
    <Container>
      <div className="font-barlow text-[12px] font-semibold uppercase tracking-[.22em] text-white/[42%]">
        Como funciona
      </div>
      <h1 className="font-barlow text-[38px] font-extrabold text-primary mt-[6px]">
        Regras de pontuação
      </h1>
      <p className="font-inter text-[14px] leading-[1.6] text-white/[55%] max-w-[540px] mt-[8px]">
        Você ganha pontos por jogo de acordo com a precisão do seu palpite. Vale sempre o placar do tempo normal — prorrogação e pênaltis não contam.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-[14px] mt-[26px]">
        <div className="bg-surface border border-border rounded-[14px] p-[24px]">
          <div className="font-barlow text-[52px] font-black leading-none text-accent">3</div>
          <div className="font-inter text-[16px] font-bold text-primary mt-[10px]">Placar exato</div>
          <div className="font-inter text-[13px] leading-[1.55] text-white/[55%] mt-[5px]">
            Você acertou o número de gols dos dois times.
          </div>
        </div>
        <div className="bg-surface border border-border rounded-[14px] p-[24px]">
          <div className="font-barlow text-[52px] font-black leading-none text-warning">1</div>
          <div className="font-inter text-[16px] font-bold text-primary mt-[10px]">Vencedor ou empate</div>
          <div className="font-inter text-[13px] leading-[1.55] text-white/[55%] mt-[5px]">
            Você acertou quem venceu (ou o empate), mas não o placar.
          </div>
        </div>
        <div className="bg-surface border border-border rounded-[14px] p-[24px]">
          <div className="font-barlow text-[52px] font-black leading-none text-white/[35%]">0</div>
          <div className="font-inter text-[16px] font-bold text-primary mt-[10px]">Errou</div>
          <div className="font-inter text-[13px] leading-[1.55] text-white/[55%] mt-[5px]">
            O resultado foi diferente do que você palpitou.
          </div>
        </div>
      </div>

      <div className="font-barlow text-[11px] font-semibold tracking-[.2em] text-white/[42%] uppercase mt-[30px] mb-[12px]">
        Exemplos
      </div>
      <div className="bg-surface border border-border rounded-[14px] overflow-hidden">
        <div className="grid [grid-template-columns:1fr_1fr_60px] sm:[grid-template-columns:120px_120px_70px_1fr] gap-[10px] sm:gap-[12px] px-[16px] sm:px-[20px] py-[13px] font-barlow text-[10px] font-semibold tracking-[.14em] text-white/[42%] uppercase border-b border-border">
          <span>Resultado</span>
          <span>Palpite</span>
          <span className="text-center">Pts</span>
          <span className="hidden sm:block">Por quê</span>
        </div>
        {EXAMPLES.map((ex, i) => (
          <div key={i} className="grid [grid-template-columns:1fr_1fr_60px] sm:[grid-template-columns:120px_120px_70px_1fr] gap-[10px] sm:gap-[12px] px-[16px] sm:px-[20px] py-[14px] items-center border-b border-white/[5%] last:border-b-0">
            <span className="font-barlow text-[14px] sm:text-[15px] font-semibold text-primary">{ex.result}</span>
            <span className="font-barlow text-[14px] sm:text-[15px] font-semibold text-white/[70%]">{ex.prediction}</span>
            <span className="flex justify-center"><PointsBadge points={ex.points} /></span>
            <span className="hidden sm:block font-inter text-[13px] text-white/[55%]">{ex.reason}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-[10px] mt-[24px]">
        {TIPS.map((tip, i) => (
          <div key={i} className="flex gap-[11px] items-start">
            <span className="text-accent font-inter text-[13px] font-bold leading-[1.5]">→</span>
            <span className="font-inter text-[13.5px] leading-[1.5] text-white/[70%]">{tip}</span>
          </div>
        ))}
      </div>
    </Container>
  )
}

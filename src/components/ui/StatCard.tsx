import { cn } from '@/lib/utils'
import Card from '@/components/ui/Card'
import Eyebrow from '@/components/ui/Eyebrow'

type StatCardProps = {
  label: string
  value: React.ReactNode
  // Cor do número — accent no destaque, primary nos demais.
  tone?: 'accent' | 'primary'
}

export default function StatCard({ label, value, tone = 'primary' }: StatCardProps) {
  return (
    <Card className="rounded-[14px] p-[20px]">
      <Eyebrow className="text-[11px] tracking-[.14em]">{label}</Eyebrow>
      <div
        className={cn(
          'font-barlow text-[34px] font-extrabold mt-[10px] leading-none',
          tone === 'accent' ? 'text-accent' : 'text-primary'
        )}
      >
        {value}
      </div>
    </Card>
  )
}

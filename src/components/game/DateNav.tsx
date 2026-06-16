'use client'

import { useRouter } from 'next/navigation'
import { useRef, useEffect } from 'react'
import { CaretLeft, CaretRight } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

type DateNavProps = {
  dates: string[]
  selectedDate: string
  today: string
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00Z')
  const weekday = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    timeZone: 'UTC',
  })
    .format(d)
    .replace('.', '')
  const day = d.getUTCDate()
  const month = new Intl.DateTimeFormat('pt-BR', {
    month: 'short',
    timeZone: 'UTC',
  })
    .format(d)
    .replace('.', '')
  return { weekday, day, month }
}

export default function DateNav({ dates, selectedDate, today }: DateNavProps) {
  const router = useRouter()
  const selectedRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    selectedRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    })
  }, [selectedDate])

  const selectedIndex = dates.indexOf(selectedDate)
  const prevDate = selectedIndex > 0 ? dates[selectedIndex - 1] : null
  const nextDate = selectedIndex < dates.length - 1 ? dates[selectedIndex + 1] : null

  function navigate(date: string) {
    router.push(`/jogos?date=${date}`)
  }

  return (
    <div className="mb-6 flex items-center gap-1">
      <button
        onClick={() => prevDate && navigate(prevDate)}
        disabled={!prevDate}
        className="shrink-0 rounded-lg p-2 text-muted transition-colors hover:bg-elevated hover:text-primary disabled:opacity-20"
        aria-label="Dia anterior"
      >
        <CaretLeft size={18} weight="bold" />
      </button>

      <div className="scrollbar-hide flex flex-1 gap-1 overflow-x-auto">
        {dates.map((date) => {
          const { weekday, day, month } = formatDateLabel(date)
          const isSelected = date === selectedDate
          const isToday = date === today

          return (
            <button
              key={date}
              ref={isSelected ? selectedRef : undefined}
              onClick={() => navigate(date)}
              className={cn(
                'relative flex shrink-0 flex-col items-center rounded-xl px-3 py-2.5 transition-colors',
                isSelected
                  ? 'bg-accent text-base'
                  : 'text-secondary hover:bg-elevated hover:text-primary'
              )}
            >
              <span className="font-inter text-[10px] uppercase tracking-wide">
                {weekday}
              </span>
              <span className="font-barlow text-xl font-black leading-none">
                {day}
              </span>
              <span
                className={cn(
                  'font-inter text-[10px]',
                  isSelected ? 'opacity-70' : 'opacity-50'
                )}
              >
                {isToday ? 'hoje' : month}
              </span>
              {isToday && !isSelected && (
                <span className="absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-accent" />
              )}
            </button>
          )
        })}
      </div>

      <button
        onClick={() => nextDate && navigate(nextDate)}
        disabled={!nextDate}
        className="shrink-0 rounded-lg p-2 text-muted transition-colors hover:bg-elevated hover:text-primary disabled:opacity-20"
        aria-label="Próximo dia"
      >
        <CaretRight size={18} weight="bold" />
      </button>
    </div>
  )
}

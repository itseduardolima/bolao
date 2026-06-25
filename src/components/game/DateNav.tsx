'use client'

import { useRouter } from 'next/navigation'
import { useRef, useEffect } from 'react'
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
  return { weekday, day }
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

  function navigate(date: string) {
    router.push(`/jogos?date=${date}`)
  }

  return (
    <div className="mb-6 flex gap-[7px] overflow-x-auto scrollbar-hide">
      {dates.map((date) => {
        const { weekday, day } = formatDateLabel(date)
        const isSelected = date === selectedDate
        const isToday = date === today

        return (
          <button
            key={date}
            ref={isSelected ? selectedRef : undefined}
            onClick={() => navigate(date)}
            className={cn(
              'w-[62px] py-[10px] pb-[9px] rounded-[11px] flex-shrink-0 cursor-pointer text-center border',
              isSelected ? 'bg-accent border-accent' : 'bg-transparent border-white/10'
            )}
          >
            <div className={cn(
              'font-barlow text-[10px] font-semibold tracking-[.1em] uppercase',
              isSelected ? 'text-black/65' : 'text-white/[42%]'
            )}>
              {weekday}
            </div>
            <div className={cn(
              'font-barlow text-[19px] font-bold mt-[2px]',
              isSelected ? 'text-base' : 'text-white/90'
            )}>
              {day}
            </div>
            <div className="flex items-center justify-center h-[5px] mt-[4px]">
              <span className={cn(
                'w-[5px] h-[5px] rounded-full',
                isToday && !isSelected ? 'bg-accent' : 'bg-transparent'
              )} />
            </div>
          </button>
        )
      })}
    </div>
  )
}

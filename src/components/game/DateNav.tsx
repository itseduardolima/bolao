'use client'

import { useRouter } from 'next/navigation'
import { useRef, useEffect } from 'react'

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
    <div className="mb-6 flex gap-[7px] overflow-x-auto">
      {dates.map((date) => {
        const { weekday, day } = formatDateLabel(date)
        const isSelected = date === selectedDate
        const isToday = date === today

        const bg = isSelected ? '#00ff87' : 'transparent'
        const borderColor = isSelected ? '#00ff87' : 'rgba(255,255,255,.1)'
        const numColor = isSelected ? '#0f0f1a' : 'rgba(255,255,255,.9)'
        const wkColor = isSelected ? 'rgba(0,0,0,.65)' : 'rgba(255,255,255,.42)'
        const dotColor = isToday && !isSelected ? '#00ff87' : 'transparent'

        return (
          <button
            key={date}
            ref={isSelected ? selectedRef : undefined}
            onClick={() => navigate(date)}
            style={{ background: bg, borderColor }}
            className="w-[62px] py-[10px] pb-[9px] rounded-[11px] flex-shrink-0 cursor-pointer text-center border"
          >
            <div
              style={{ color: wkColor }}
              className="font-[Barlow_Condensed] text-[10px] font-semibold tracking-[.1em] uppercase"
            >
              {weekday}
            </div>
            <div
              style={{ color: numColor }}
              className="font-barlow text-[19px] font-bold mt-[2px]"
            >
              {day}
            </div>
            <div className="flex items-center justify-center h-[5px] mt-[4px]">
              <span
                style={{ background: dotColor }}
                className="w-[5px] h-[5px] rounded-full"
              />
            </div>
          </button>
        )
      })}
    </div>
  )
}

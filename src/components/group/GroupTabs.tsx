'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

type Tab = {
  id: string
  label: string
  content: React.ReactNode
}

export default function GroupTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id)

  return (
    <div>
      <div role="tablist" className="flex gap-[26px] border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={active === t.id}
            aria-controls={`panel-${t.id}`}
            onClick={() => setActive(t.id)}
            className={cn(
              'pb-[11px] font-inter text-[13px] font-semibold cursor-pointer bg-transparent border-none outline-none transition-colors',
              active === t.id
                ? 'text-primary shadow-[inset_0_-2px_0_#00ff87]'
                : 'text-white/[42%] hover:text-secondary'
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`panel-${t.id}`}
          aria-labelledby={`tab-${t.id}`}
          hidden={active !== t.id}
        >
          {t.content}
        </div>
      ))}
    </div>
  )
}

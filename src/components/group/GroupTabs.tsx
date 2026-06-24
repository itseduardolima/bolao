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
      <div role="tablist" className="mb-5 flex items-center gap-6 border-b border-border">
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
              '-mb-px border-b-2 pb-2.5 font-barlow text-sm font-bold uppercase tracking-widest transition-colors',
              active === t.id
                ? 'border-accent text-primary'
                : 'border-transparent text-secondary hover:text-primary'
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

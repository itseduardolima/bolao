'use client'

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

type ModalProps = {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  /** id do título, para aria-labelledby */
  labelledBy?: string
  /** id da descrição, para aria-describedby */
  describedBy?: string
  className?: string
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function Modal({
  open,
  onClose,
  children,
  labelledBy,
  describedBy,
  className,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  // Mantém o onClose mais recente sem re-disparar o efeito (estável em [open]).
  const onCloseRef = useRef(onClose)
  useEffect(() => {
    onCloseRef.current = onClose
  })

  useEffect(() => {
    if (!open) return

    const panel = panelRef.current
    const previouslyFocused = document.activeElement as HTMLElement | null

    // Foca o primeiro elemento focável (em diálogos de confirmação, o "Cancelar")
    const focusables = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
    focusables()[0]?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCloseRef.current()
        return
      }
      if (e.key === 'Tab') {
        const els = focusables()
        if (els.length === 0) return
        const first = els[0]
        const last = els[els.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
      previouslyFocused?.focus?.()
    }
  }, [open])

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 animate-overlay-show"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={cn(
          'relative z-10 w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)] outline-none animate-panel-show',
          className
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}

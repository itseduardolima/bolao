'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'

export type ConfirmOptions = {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'default' | 'danger'
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

/**
 * Substitui `window.confirm()`: `const confirm = useConfirm()` e
 * `if (await confirm({ title, description, variant: 'danger' })) { ... }`.
 */
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext)
  if (!ctx) throw new Error('useConfirm precisa estar dentro de <ConfirmProvider>')
  return ctx
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null)
  const resolverRef = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts)
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve
    })
  }, [])

  const settle = useCallback((result: boolean) => {
    resolverRef.current?.(result)
    resolverRef.current = null
    setOptions(null)
  }, [])

  const isDanger = options?.variant === 'danger'

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={options !== null}
        onClose={() => settle(false)}
        labelledBy="confirm-title"
        describedBy={options?.description ? 'confirm-desc' : undefined}
      >
        {options && (
          <>
            <h2
              id="confirm-title"
              className="font-barlow text-xl font-bold uppercase tracking-wide text-primary"
            >
              {options.title}
            </h2>
            {options.description && (
              <p id="confirm-desc" className="mt-2 font-inter text-sm text-secondary">
                {options.description}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="ghost" size="sm" onClick={() => settle(false)}>
                {options.cancelLabel ?? 'Cancelar'}
              </Button>
              <Button
                variant={isDanger ? 'danger' : 'primary'}
                size="sm"
                onClick={() => settle(true)}
              >
                {options.confirmLabel ?? 'Confirmar'}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </ConfirmContext.Provider>
  )
}

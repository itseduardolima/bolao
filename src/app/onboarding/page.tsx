'use client'

import { useOnboarding } from './useOnboarding'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Container from '@/components/layout/Container'
import SectionTitle from '@/components/layout/SectionTitle'

const statusMessage: Record<string, { text: string; color: string }> = {
  idle: { text: '', color: '' },
  checking: { text: 'Verificando...', color: 'text-muted' },
  available: { text: '✓ Disponível', color: 'text-accent' },
  unavailable: { text: '✗ Já está em uso', color: 'text-error' },
  invalid: {
    text: 'Entre 3 e 20 caracteres',
    color: 'text-muted',
  },
}

export default function OnboardingPage() {
  const { value, setValue, status, error, isSaving, canSubmit, handleSubmit } =
    useOnboarding()

  const hint = statusMessage[status]

  return (
    <main className="flex min-h-[calc(100vh-56px)] items-center justify-center">
      <Container className="max-w-md py-16">
        <SectionTitle className="mb-2 text-center">Escolha seu apelido</SectionTitle>
        <p className="mb-8 text-center text-sm text-secondary">
          Seu apelido aparece no ranking. Não é possível alterar depois.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="ex: Eduardo Lindo"
              maxLength={20}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck={false}
            />
            {hint.text && (
              <p className={`mt-1.5 text-xs ${hint.color}`}>{hint.text}</p>
            )}
          </div>

          {error && <p className="text-sm text-error">{error}</p>}

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!canSubmit}
            className="w-full"
          >
            {isSaving ? 'Salvando...' : 'Confirmar apelido'}
          </Button>
        </form>
      </Container>
    </main>
  )
}

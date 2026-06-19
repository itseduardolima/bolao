import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'
import Header from '@/components/layout/Header'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: 'Bolão Copa 2026',
  description: 'Palpites e ranking da Copa do Mundo 2026',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-base font-inter text-primary antialiased">
        <Providers>
          <Header />
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}

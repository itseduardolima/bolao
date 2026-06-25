import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import MobileNav from '@/components/layout/MobileNav'
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
          <div className="flex min-h-[calc(100vh-62px)] flex-col pb-[62px] sm:pb-0">
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
          <MobileNav />
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}

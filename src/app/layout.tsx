import type { Metadata } from 'next'
import './globals.css'
import Providers from './providers'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import MobileNav from '@/components/layout/MobileNav'
import { Analytics } from '@vercel/analytics/next'
import { SITE_URL, SITE_NAME, SITE_TITLE, SITE_DESCRIPTION } from '@/lib/site'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: '%s · Bolão Copa 2026',
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
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

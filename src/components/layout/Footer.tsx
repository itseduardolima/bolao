import Link from 'next/link'
import Container from './Container'

const CONTATO = 'eduardolima2417@gmail.com'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-base-dark mt-[40px]">
      <Container className="flex flex-col items-center gap-[14px] py-[24px] sm:flex-row sm:justify-between">
        <span className="font-inter text-[12px] text-white/[38%]">
          © 2026 Bolão Copa do Mundo · Sem apostas ou prêmios em dinheiro
        </span>
        <nav className="flex items-center gap-[20px]">
          <Link
            href="/privacidade"
            className="font-inter text-[12px] font-semibold text-white/[55%] transition-colors hover:text-primary"
          >
            Privacidade
          </Link>
          <Link
            href="/termos"
            className="font-inter text-[12px] font-semibold text-white/[55%] transition-colors hover:text-primary"
          >
            Termos
          </Link>
          <a
            href={`mailto:${CONTATO}`}
            className="font-inter text-[12px] font-semibold text-white/[55%] transition-colors hover:text-primary"
          >
            Contato
          </a>
        </nav>
      </Container>
    </footer>
  )
}

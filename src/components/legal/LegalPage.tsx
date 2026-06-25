import Container from '@/components/layout/Container'

type LegalPageProps = {
  eyebrow: string
  title: string
  updatedAt: string
  intro?: string
  children: React.ReactNode
}

// Casca de páginas de texto longo (Política de Privacidade, Termos). Centraliza
// a tipografia de prosa via variantes descendentes para que cada página escreva
// apenas HTML semântico (section/h2/p/ul/strong/a) sem repetir classes.
export default function LegalPage({ eyebrow, title, updatedAt, intro, children }: LegalPageProps) {
  return (
    <Container className="max-w-[760px]">
      <div className="font-barlow text-[12px] font-semibold uppercase tracking-[.22em] text-white/[42%]">
        {eyebrow}
      </div>
      <h1 className="font-barlow text-[38px] font-extrabold text-primary mt-[6px] leading-[1.05]">
        {title}
      </h1>
      {intro && (
        <p className="font-inter text-[14px] leading-[1.6] text-white/[55%] max-w-[600px] mt-[10px]">
          {intro}
        </p>
      )}
      <div className="font-inter text-[12px] text-white/[35%] mt-[12px]">
        Última atualização: {updatedAt}
      </div>

      <div
        className="
          mt-[30px] flex flex-col gap-[28px]
          [&_h2]:font-barlow [&_h2]:text-[19px] [&_h2]:font-bold [&_h2]:uppercase [&_h2]:tracking-[.04em] [&_h2]:text-primary [&_h2]:mb-[12px]
          [&_p]:font-inter [&_p]:text-[14px] [&_p]:leading-[1.7] [&_p]:text-white/[62%]
          [&_p+p]:mt-[12px]
          [&_a]:text-accent [&_a]:font-semibold hover:[&_a]:underline
          [&_strong]:font-semibold [&_strong]:text-primary
          [&_ul]:mt-[12px] [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-[9px] [&_ul]:list-disc [&_ul]:pl-[20px]
          [&_li]:font-inter [&_li]:text-[14px] [&_li]:leading-[1.6] [&_li]:text-white/[62%] [&_li]:marker:text-accent
        "
      >
        {children}
      </div>
    </Container>
  )
}

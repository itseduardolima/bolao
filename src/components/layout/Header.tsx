import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/lib/auth'
import LogoCopa from '@/assets/images/logo-copa.png'
import Avatar from '@/components/ui/Avatar'
import Container from './Container'
import NavLinks from './NavLinks'
import SignInButton from './SignInButton'
import SignOutButton from './SignOutButton'

export default async function Header() {
  const session = await auth()
  const user = session?.user

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-base-dark">
      <Container className="flex h-[62px] items-center justify-between py-0">
        <Link href="/" className="flex items-center gap-[9px]">
          <Image src={LogoCopa} alt="Bolão 2026" width={22} height={22} className="shrink-0" />
          <span className="font-barlow text-[17px] font-black text-primary leading-none">
            Bolão - <span className="hidden sm:inline">Copa do mundo </span><span className="text-accent">2026</span>
          </span>
        </Link>

        <nav className="flex items-center gap-4 sm:gap-6">
          <div className="hidden sm:flex items-center gap-6">
            <NavLinks />
          </div>

          {user ? (
            <>
              <Link
                href="/perfil"
                className="flex items-center gap-2 font-inter text-sm font-medium text-secondary transition-colors hover:text-primary"
              >
                <Avatar src={user.image ?? null} name={user.nickname ?? user.name ?? 'U'} size={30} />
                <span className="hidden sm:inline">{user.nickname ?? user.name}</span>
              </Link>
              <SignOutButton />
            </>
          ) : (
            <SignInButton />
          )}
        </nav>
      </Container>
    </header>
  )
}

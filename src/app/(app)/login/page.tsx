import type { Metadata } from 'next'

import { RenderParams } from '@/components/RenderParams'
import Link from 'next/link'

import { LoginForm } from '@/components/forms/LoginForm'
import configPromise from '@payload-config'
import { getLocale, type SupportedLocale } from '@/utilities/getLocale'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

const loginPageCopy: Record<
  SupportedLocale,
  {
    alreadyLoggedIn: string
    welcomeTitle: string
    terms: string
    privacy: string
    visitWebsite: string
    asideHeadingLine1: string
    asideHeadingLine2: string
    asideBody: string
  }
> = {
  de: {
    alreadyLoggedIn: 'Du bist bereits angemeldet.',
    welcomeTitle: 'Willkommen zurück',
    terms: 'AGB',
    privacy: 'Datenschutz',
    visitWebsite: 'Zur Website',
    asideHeadingLine1: 'Kreativität in',
    asideHeadingLine2: 'Glas & Küche',
    asideBody:
      'Wir glauben, dass Fermentation ein starkes Mittel für Genuss und Kreativität in der Küche ist. Unsere Angebote unterstützen dich dabei, deinen eigenen Stil und dein Wohlbefinden durch bewusste Ernährung auszudrücken.',
  },
  en: {
    alreadyLoggedIn: 'You are already logged in.',
    welcomeTitle: 'Welcome back',
    terms: 'Terms & Conditions',
    privacy: 'Privacy Policy',
    visitWebsite: 'Visit Website',
    asideHeadingLine1: 'Empowering self',
    asideHeadingLine2: 'expression',
    asideBody:
      'Cultures believes that fermentation is a powerful tool for self-expression. Its versatile collections are designed to empower individuals to showcase their personality and confidence through their style choices.',
  },
}

export default async function Login() {
  const locale = await getLocale()
  const copy = loginPageCopy[locale]

  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  const loginHeroImageUrl = `${process.env.R2_PUBLIC_URL}/media/image%2054.webp`

  if (user) {
    redirect(`/account?warning=${encodeURIComponent(copy.alreadyLoggedIn)}`)
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-[#575651] text-white font-sans">
      <div className="container px-5 py-8 md:py-14">
        <RenderParams className="[&>div]:bg-white/10 [&>div]:text-white/80 [&>div]:border [&>div]:border-white/20" />

        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:gap-12 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-start">
            <section className="flex flex-col space-y-6 md:space-y-8 px-2 md:px-0">
              <header className="text-center md:text-left">
                <h1 className="font-display text-[1.1rem] sm:text-[1.3rem] md:text-[1.8rem] tracking-[0.3em] md:tracking-[0.38em] uppercase text-[#F4F0E8]">
                  {copy.welcomeTitle}
                </h1>
              </header>

              <div className="space-y-5">
                <LoginForm locale={locale} />
              </div>

              <div className="md:hidden mt-4 space-y-3">
                <div className="border-t border-dashed border-neutral-400/50" />
                <div className="flex items-center justify-between text-[11px] tracking-[0.12em] text-neutral-300">
                  <Link href="/terms" className="underline underline-offset-4 hover:text-white">
                    {copy.terms}
                  </Link>
                  <Link href="/privacy" className="underline underline-offset-4 hover:text-white">
                    {copy.privacy}
                  </Link>
                  <Link href="/" className="underline underline-offset-4 hover:text-white">
                    {copy.visitWebsite}
                  </Link>
                </div>
              </div>
            </section>

            <aside className="hidden md:flex md:flex-col md:gap-5 text-neutral-50">
              <div className="mx-auto flex w-full max-w-md flex-col gap-px">
                <div
                  className="h-28 w-full rounded-[80px]"
                  style={{
                    backgroundImage: `url(${loginHeroImageUrl})`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center 25%',
                  }}
                />
                <div
                  className="h-28 w-full rounded-[80px]"
                  style={{
                    backgroundImage: `url(${loginHeroImageUrl})`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center 50%',
                  }}
                />
                <div
                  className="h-28 w-full rounded-[80px]"
                  style={{
                    backgroundImage: `url(${loginHeroImageUrl})`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center 75%',
                  }}
                />
              </div>

              <div className="flex items-start gap-6">
                <h2 className="font-display text-lg uppercase leading-[1.1] tracking-wide text-[#F5F2EC]">
                  <span className="block whitespace-nowrap">{copy.asideHeadingLine1}</span>
                  <span className="block whitespace-nowrap">{copy.asideHeadingLine2}</span>
                </h2>
                <p className="max-w-xs text-[11px] leading-relaxed text-[#D1CAC0]">
                  {copy.asideBody}
                </p>
              </div>
            </aside>
          </div>

          <div className="hidden md:grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-12 mt-6 text-[11px] tracking-[0.12em] text-neutral-300">
            <div className="space-y-3">
              <div className="border-t border-dashed border-neutral-400/50" />
              <div className="flex gap-8">
                <Link href="/terms" className="underline underline-offset-4 hover:text-white">
                  {copy.terms}
                </Link>
                <Link href="/privacy" className="underline underline-offset-4 hover:text-white">
                  {copy.privacy}
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              <div className="border-t border-dashed border-neutral-400/50" />
              <div className="flex justify-end">
                <Link href="/" className="underline underline-offset-4 hover:text-white">
                  {copy.visitWebsite}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale()
  if (locale === 'de') {
    return {
      description: 'Melde dich an oder erstelle ein Konto.',
      openGraph: { title: 'Anmelden', url: '/login' },
      title: 'Anmelden',
    }
  }
  return {
    description: 'Login or create an account to get started.',
    openGraph: { title: 'Login', url: '/login' },
    title: 'Login',
  }
}

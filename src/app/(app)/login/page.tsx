import type { Metadata } from 'next'

import { RenderParams } from '@/components/RenderParams'
import Link from 'next/link'

import { LoginForm } from '@/components/forms/LoginForm'
import configPromise from '@payload-config'
import { getLocale, type SupportedLocale } from '@/utilities/getLocale'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

function IconGoogleBrand({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#1877F2"
        d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z"
      />
    </svg>
  )
}

function IconTwitterBird({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#1DA1F2"
        d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.423-.015-.63a9.935 9.935 0 002.46-2.548z"
      />
    </svg>
  )
}

const socialPillClass =
  'flex flex-1 min-w-[4.5rem] items-center justify-center rounded-full border border-neutral-300/50 px-4 py-3 text-neutral-100/90 transition hover:border-white hover:bg-white/5 focus-visible:outline focus-visible:ring-2 focus-visible:ring-white/50'

const GOOGLE_MAPS_HREF =
  'https://www.google.com/maps/search/?api=1&query=Ginery%2C+Grabenstraße+15%2C+8010+Graz'

const loginPageCopy: Record<
  SupportedLocale,
  {
    alreadyLoggedIn: string
    welcomeTitle: string
    orContinueWith: string
    googleMapsAria: string
    facebookAria: string
    twitterAria: string
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
    orContinueWith: 'oder fortfahren mit',
    googleMapsAria: 'Standort von FermentFreude in Google Maps öffnen',
    facebookAria: 'FermentFreude auf Facebook',
    twitterAria: 'FermentFreude auf X (Twitter)',
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
    orContinueWith: 'or continue with',
    googleMapsAria: 'Open FermentFreude location in Google Maps',
    facebookAria: 'FermentFreude on Facebook',
    twitterAria: 'FermentFreude on X (Twitter)',
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

                <div className="mt-5 flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-neutral-300">
                  <span className="h-px flex-1 bg-neutral-500/70" />
                  <span>{copy.orContinueWith}</span>
                  <span className="h-px flex-1 bg-neutral-500/70" />
                </div>

                <div className="flex flex-wrap justify-center gap-3 pt-1">
                  <Link
                    href={GOOGLE_MAPS_HREF}
                    target="_blank"
                    rel="noreferrer"
                    className={socialPillClass}
                    aria-label={copy.googleMapsAria}
                  >
                    <IconGoogleBrand className="h-6 w-6" />
                  </Link>
                  <Link
                    href="https://www.facebook.com/people/Ferment-Freude/100087329564765/"
                    target="_blank"
                    rel="noreferrer"
                    className={socialPillClass}
                    aria-label={copy.facebookAria}
                  >
                    <IconFacebook className="h-6 w-6" />
                  </Link>
                  <Link
                    href="https://twitter.com/fermentfreude"
                    target="_blank"
                    rel="noreferrer"
                    className={socialPillClass}
                    aria-label={copy.twitterAria}
                  >
                    <IconTwitterBird className="h-5 w-5" />
                  </Link>
                </div>
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

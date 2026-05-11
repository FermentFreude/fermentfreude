import type { Metadata } from 'next'

import { RenderParams } from '@/components/RenderParams'
import Link from 'next/link'

import { CreateAccountForm } from '@/components/forms/CreateAccountForm'
import { getLocale, type SupportedLocale } from '@/utilities/getLocale'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers.js'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

const createAccountPageCopy: Record<
  SupportedLocale,
  {
    alreadyLoggedIn: string
    headingLine1: string
    headingLine2: string
    terms: string
    privacy: string
    visitWebsite: string
    welcomeLine1: string
    welcomeLine2: string
    intro: string
  }
> = {
  de: {
    alreadyLoggedIn: 'Du bist bereits angemeldet.',
    headingLine1: 'WERDE TEIL DER',
    headingLine2: 'FERMENT FREUDE COMMUNITY!',
    terms: 'AGB',
    privacy: 'Datenschutz',
    visitWebsite: 'Website besuchen',
    welcomeLine1: 'WILLKOMMEN BEI',
    welcomeLine2: 'FERMENT FREUDE',
    intro:
      'Werde Teil unserer Community, speichere deine Daten für einen schnelleren Checkout und behalte deine kommenden Workshops im Blick.',
  },
  en: {
    alreadyLoggedIn: 'You are already logged in.',
    headingLine1: 'JOIN FERMENT FREUDE',
    headingLine2: 'COMMUNITY!',
    terms: 'Terms & Conditions',
    privacy: 'Privacy Policy',
    visitWebsite: 'Visit Website',
    welcomeLine1: 'WELCOME TO',
    welcomeLine2: 'FERMENT FREUDE',
    intro:
      'Join our community of fermentation lovers, save your details for faster checkout, and keep track of your upcoming workshops.',
  },
}

export default async function CreateAccount() {
  const locale = await getLocale()
  const copy = createAccountPageCopy[locale]
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  const createAccountHeroImageUrl = `${process.env.R2_PUBLIC_URL}/media/image%2054.webp`

  if (user) {
    redirect(`/account?warning=${encodeURIComponent(copy.alreadyLoggedIn)}`)
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-[#575651] text-white font-sans">
      <div className="container px-5 py-8 md:py-14">
        <RenderParams />

        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:gap-12 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-start">
            <section className="flex flex-col space-y-6 md:space-y-8 px-2 md:px-0">
              <header className="text-center md:text-left">
                <h1 className="font-display text-[1.1rem] sm:text-[1.3rem] md:text-[1.8rem] tracking-[0.3em] md:tracking-[0.38em] uppercase text-[#F4F0E8]">
                  <span className="block">{copy.headingLine1}</span>
                  <span className="block">{copy.headingLine2}</span>
                </h1>
              </header>

              <div className="space-y-5">
                <div>
                  <CreateAccountForm locale={locale} />
                </div>
              </div>

              {/* Footer links — mobile */}
              <div className="md:hidden mt-4 space-y-3">
                <div className="border-t border-dashed border-neutral-400/50" />
                <div className="flex items-center justify-between text-[11px] tracking-[0.12em] text-neutral-300">
                  <Link href="/agb" className="underline underline-offset-4 hover:text-white">
                    {copy.terms}
                  </Link>
                  <Link href="/datenschutz" className="underline underline-offset-4 hover:text-white">
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
                    backgroundImage: `url(${createAccountHeroImageUrl})`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center 25%',
                  }}
                />
                <div
                  className="h-28 w-full rounded-[80px]"
                  style={{
                    backgroundImage: `url(${createAccountHeroImageUrl})`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center 50%',
                  }}
                />
                <div
                  className="h-28 w-full rounded-[80px]"
                  style={{
                    backgroundImage: `url(${createAccountHeroImageUrl})`,
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center 75%',
                  }}
                />
              </div>

              <div className="flex items-start gap-6">
                <h2 className="font-display text-lg leading-[1.1] text-[#F5F2EC]">
                  <span className="block whitespace-nowrap">{copy.welcomeLine1}</span>
                  <span className="block whitespace-nowrap">{copy.welcomeLine2}</span>
                </h2>
                <p className="max-w-xs text-xs leading-relaxed text-[#D1CAC0]">{copy.intro}</p>
              </div>
            </aside>
          </div>

          {/* Full-width footer — desktop */}
          <div className="hidden md:grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-12 mt-6 text-[11px] tracking-[0.12em] text-neutral-300">
            <div className="space-y-3">
              <div className="border-t border-dashed border-neutral-400/50" />
              <div className="flex gap-8">
                <Link href="/agb" className="underline underline-offset-4 hover:text-white">
                  {copy.terms}
                </Link>
                <Link href="/datenschutz" className="underline underline-offset-4 hover:text-white">
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

export const metadata: Metadata = {
  description: 'Create an account to manage your bookings and orders.',
  openGraph: {
    title: 'Create account',
    url: '/create-account',
  },
  title: 'Create account',
}

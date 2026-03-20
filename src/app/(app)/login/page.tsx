import type { Metadata } from 'next'

import { RenderParams } from '@/components/RenderParams'
import Link from 'next/link'

import { LoginForm } from '@/components/forms/LoginForm'
import configPromise from '@payload-config'
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

export default async function Login() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  const loginHeroImageUrl = `${process.env.R2_PUBLIC_URL}/media/image%2054.webp`

  if (user) {
    redirect(`/account?warning=${encodeURIComponent('You are already logged in.')}`)
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
                  WELCOME BACK
                </h1>
              </header>

              <div className="space-y-5">
                <LoginForm />

                <div className="mt-5 flex items-center gap-4 text-[10px] uppercase tracking-[0.2em] text-neutral-300">
                  <span className="h-px flex-1 bg-neutral-500/70" />
                  <span>or continue with</span>
                  <span className="h-px flex-1 bg-neutral-500/70" />
                </div>

                <div className="flex flex-wrap gap-3 pt-1 text-[10px] tracking-[0.18em]">
                  <Link
                    href="https://www.google.com/maps/search/?api=1&query=Ginery%2C+Grabenstraße+15%2C+8010+Graz"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 rounded-full border border-neutral-300/50 px-5 py-2.5 text-center uppercase text-neutral-100/90 transition hover:border-white hover:bg-white/5 hover:text-white"
                  >
                    Google
                  </Link>
                  <Link
                    href="https://www.facebook.com/people/Ferment-Freude/100087329564765/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 rounded-full border border-neutral-300/50 px-5 py-2.5 text-center uppercase text-neutral-100/90 transition hover:border-white hover:bg-white/5 hover:text-white"
                  >
                    Facebook
                  </Link>
                  <Link
                    href="https://twitter.com/fermentfreude"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 rounded-full border border-neutral-300/50 px-5 py-2.5 text-center uppercase text-neutral-100/90 transition hover:border-white hover:bg-white/5 hover:text-white"
                  >
                    Twitter
                  </Link>
                </div>
              </div>

              {/* Footer links — mobile */}
              <div className="md:hidden mt-4 space-y-3">
                <div className="border-t border-dashed border-neutral-400/50" />
                <div className="flex items-center justify-between text-[11px] tracking-[0.12em] text-neutral-300">
                  <Link href="/terms" className="underline underline-offset-4 hover:text-white">
                    Terms &amp; Conditions
                  </Link>
                  <Link href="/privacy" className="underline underline-offset-4 hover:text-white">
                    Privacy Policy
                  </Link>
                  <Link href="/" className="underline underline-offset-4 hover:text-white">
                    Visit Website
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
                <h2 className="font-display text-lg leading-[1.1] text-[#F5F2EC]">
                  <span className="block whitespace-nowrap">EMPOWERING SELF</span>
                  <span className="block whitespace-nowrap">EXPRESSION</span>
                </h2>
                <p className="max-w-xs text-[11px] leading-relaxed text-[#D1CAC0]">
                  Cultures believes that fermentation is a powerful tool for self-expression. Its
                  versatile collections are designed to empower individuals to showcase their
                  personality and confidence through their style choices.
                </p>
              </div>
            </aside>
          </div>

          {/* Full-width footer — desktop */}
          <div className="hidden md:grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-12 mt-6 text-[11px] tracking-[0.12em] text-neutral-300">
            <div className="space-y-3">
              <div className="border-t border-dashed border-neutral-400/50" />
              <div className="flex gap-8">
                <Link href="/terms" className="underline underline-offset-4 hover:text-white">
                  Terms &amp; Conditions
                </Link>
                <Link href="/privacy" className="underline underline-offset-4 hover:text-white">
                  Privacy Policy
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              <div className="border-t border-dashed border-neutral-400/50" />
              <div className="flex justify-end">
                <Link href="/" className="underline underline-offset-4 hover:text-white">
                  Visit Website
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
  description: 'Login or create an account to get started.',
  openGraph: {
    title: 'Login',
    url: '/login',
  },
  title: 'Login',
}

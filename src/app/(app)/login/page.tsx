import type { Metadata } from 'next'

import { RenderParams } from '@/components/RenderParams'
import Link from 'next/link'
import React from 'react'

import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { LoginForm } from '@/components/forms/LoginForm'
import { redirect } from 'next/navigation'
import { Media } from '@/components/Media'

export default async function Login() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  const loginHeroImageUrl = `${process.env.R2_PUBLIC_URL}/media/image%2054.webp`

  if (user) {
    redirect(`/account?warning=${encodeURIComponent('You are already logged in.')}`)
  }

  return (
    <div className="min-h-[calc(100vh-6rem)] bg-[#575651] text-white">
      <div className="container py-20">
        <RenderParams />

        <div className="mx-auto max-w-6xl">
          <div className="grid gap-16 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:items-start">
            <section className="flex flex-col space-y-10">
              <header>
                <h1 className="font-display text-[2.4rem] tracking-[0.38em] uppercase text-[#F4F0E8] md:text-[2.8rem]">
                  WELCOME BACK
                </h1>
              </header>

              <div className="space-y-7">
                <LoginForm />

                <div className="mt-7 flex items-center gap-4 text-[11px] uppercase tracking-[0.2em] text-neutral-300">
                  <span className="h-px flex-1 bg-neutral-500/70" />
                  <span>or continue with</span>
                  <span className="h-px flex-1 bg-neutral-500/70" />
                </div>

                <div className="flex flex-wrap gap-4 pt-1 text-[11px] tracking-[0.18em]">
                  <Link
                    href="https://www.google.com/maps/search/?api=1&query=Ginery%2C+Grabenstraße+15%2C+8010+Graz"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 rounded-full border border-neutral-300/50 px-6 py-3 text-center uppercase text-neutral-100/90 transition hover:border-white hover:bg-white/5 hover:text-white"
                  >
                    Google
                  </Link>
                  <Link
                    href="https://www.facebook.com/people/Ferment-Freude/100087329564765/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 rounded-full border border-neutral-300/50 px-6 py-3 text-center uppercase text-neutral-100/90 transition hover:border-white hover:bg-white/5 hover:text-white"
                  >
                    Facebook
                  </Link>
                  <Link
                    href="https://www.instagram.com/fermentfreude/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 rounded-full border border-neutral-300/50 px-6 py-3 text-center uppercase text-neutral-100/90 transition hover:border-white hover:bg-white/5 hover:text-white"
                  >
                    Instagram
                  </Link>
                </div>
              </div>
            </section>

            <aside className="space-y-7 text-neutral-50">
              <div className="mx-auto flex w-full max-w-130 flex-col gap-px">
                <div
                  className="h-42.5 w-full max-w-130 rounded-[120px]"
                  style={{
                    backgroundImage: `url(${loginHeroImageUrl})`,
                    backgroundSize: '520px 480px',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center 0px',
                  }}
                />
                <div
                  className="h-42.5 w-full max-w-130 rounded-[120px]"
                  style={{
                    backgroundImage: `url(${loginHeroImageUrl})`,
                    backgroundSize: '520px 480px',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center -160px',
                  }}
                />
                <div
                  className="h-42.5 w-full max-w-130 rounded-[120px]"
                  style={{
                    backgroundImage: `url(${loginHeroImageUrl})`,
                    backgroundSize: '520px 480px',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center -320px',
                  }}
                />
              </div>

              <div className="flex items-start gap-10">
                <h2 className="font-display text-2xl leading-[1.1] text-[#F5F2EC]">
                  <span className="block whitespace-nowrap">EMPOWERING SELF</span>
                  <span className="block whitespace-nowrap">EXPRESSION</span>
                </h2>
                <p className="max-w-md text-sm leading-relaxed text-[#D1CAC0]">
                  Cultures believes that fermentation is a powerful tool for self-expression. Its versatile
                  collections are designed to empower individuals to showcase their personality and
                  confidence through their style choices.
                </p>
              </div>

              <div className="flex items-center justify-end text-[12px] tracking-[0.18em] text-neutral-300">
                <Link href="/" className="underline underline-offset-4 hover:text-white">
                  Visit Website
                </Link>
              </div>
            </aside>
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

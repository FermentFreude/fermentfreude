import type { Metadata } from 'next'

import { RenderParams } from '@/components/RenderParams'
import React from 'react'

import { headers as getHeaders } from 'next/headers'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import { CreateAccountForm } from '@/components/forms/CreateAccountForm'
import { redirect } from 'next/navigation'

export default async function CreateAccount() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: configPromise })
  const { user } = await payload.auth({ headers })

  const createAccountHeroImageUrl = `${process.env.R2_PUBLIC_URL}/media/image%2054.webp`

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
                  <span className="block">JOIN <span className="whitespace-nowrap">FERMENT FREUDE</span></span>
                  <span className="block">COMMUNITY!</span>
                </h1>
              </header>

              <div className="space-y-7">
                <div>
                  <CreateAccountForm />
                </div>
              </div>
            </section>

            <aside className="space-y-7 text-neutral-50">
              <div className="mx-auto flex w-full max-w-[520px] flex-col gap-px">
                <div
                  className="h-[170px] w-full max-w-[520px] rounded-[120px]"
                  style={{
                    backgroundImage: `url(${createAccountHeroImageUrl})`,
                    backgroundSize: '520px 480px',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center 0px',
                  }}
                />
                <div
                  className="h-[170px] w-full max-w-[520px] rounded-[120px]"
                  style={{
                    backgroundImage: `url(${createAccountHeroImageUrl})`,
                    backgroundSize: '520px 480px',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center -160px',
                  }}
                />
                <div
                  className="h-[170px] w-full max-w-[520px] rounded-[120px]"
                  style={{
                    backgroundImage: `url(${createAccountHeroImageUrl})`,
                    backgroundSize: '520px 480px',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center -320px',
                  }}
                />
              </div>

              <div className="flex items-start gap-10">
                <h2 className="font-display text-2xl leading-[1.1] text-[#F5F2EC]">
                  <span className="block whitespace-nowrap">WELCOME TO</span>
                  <span className="block whitespace-nowrap">FERMENT FREUDE</span>
                </h2>
                <p className="max-w-md text-sm leading-relaxed text-[#D1CAC0]">
                  Join our community of fermentation lovers, save your details for faster checkout, and keep
                  track of your upcoming workshops.
                </p>
              </div>
            </aside>
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

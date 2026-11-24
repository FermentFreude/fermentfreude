'use client'

import { usePathname } from 'next/navigation'
import React, { useState } from 'react'

const inputBase =
  'w-full rounded-lg border border-black/10 bg-white px-4 py-3 font-sans text-base text-ff-charcoal placeholder:text-ff-gray-text transition-all duration-200 focus:border-ff-gold focus:outline-none focus:ring-1 focus:ring-ff-gold'

type Labels = {
  heading: string
  firstName: string
  company: string
  email: string
  phone: string
  businessType: string
  businessOptions: string[]
  interest: string
  interestOptions: string[]
  quantity: string
  message: string
  submit: string
  contactLine?: string | null
  successMessage: string
  errorMessage: string
  sending: string
  contactEmail: string
  locale: 'de' | 'en'
}

type Props = {
  labels: Labels
}

export function GastronomyInquiry({ labels }: Props) {
  const pathname = usePathname()
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (state === 'sending') return
    const fd = new FormData(e.currentTarget)
    const get = (k: string) => String(fd.get(k) ?? '').trim()
    const de = labels.locale === 'de'
    setState('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          source: 'gastronomy',
          name: get('name'),
          company: get('company'),
          email: get('email'),
          phone: get('phone'),
          subject: get('interest'),
          message: get('message'),
          details: {
            [de ? 'Betriebsart' : 'Business type']: get('business'),
            [de ? 'Menge' : 'Quantity']: get('quantity'),
          },
          website: get('website'),
          pagePath: pathname,
          locale: labels.locale,
        }),
      })
      setState(res.ok ? 'sent' : 'error')
    } catch {
      setState('error')
    }
  }

  return (
    <section id="contact" className="scroll-mt-24 bg-[#F6F0E8] section-padding-md">
      <div className="container mx-auto container-padding">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.06)] md:p-10">
          <h2 className="font-display text-section-heading font-bold tracking-tight text-ff-black">
            {labels.heading}
          </h2>
          {labels.contactLine ? (
            <p className="mt-2 text-body-sm text-ff-gray-text">{labels.contactLine}</p>
          ) : null}
          {state === 'sent' ? (
            <p
              role="status"
              className="mt-8 whitespace-pre-line rounded-lg bg-[#F6F0E8] p-6 text-body leading-relaxed text-ff-charcoal"
            >
              {labels.successMessage}
            </p>
          ) : (
            <form className="mt-8 flex flex-col gap-3" onSubmit={onSubmit}>
              {/* Honeypot — hidden from people, bots fill it. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="sr-only">{labels.firstName}</span>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder={labels.firstName}
                    autoComplete="name"
                    className={inputBase}
                  />
                </label>
                <label className="block">
                  <span className="sr-only">{labels.company}</span>
                  <input
                    type="text"
                    name="company"
                    required
                    placeholder={labels.company}
                    autoComplete="organization"
                    className={inputBase}
                  />
                </label>
              </div>
              <label className="block">
                <span className="sr-only">{labels.email}</span>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder={labels.email}
                  className={inputBase}
                  autoComplete="email"
                />
              </label>
              <label className="block">
                <span className="sr-only">{labels.phone}</span>
                <input
                  type="tel"
                  name="phone"
                  placeholder={labels.phone}
                  className={inputBase}
                  autoComplete="tel"
                />
              </label>
              <label className="block">
                <span className="sr-only">{labels.businessType}</span>
                <select
                  name="business"
                  className={`${inputBase} appearance-none`}
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    {labels.businessType}
                  </option>
                  {labels.businessOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="sr-only">{labels.interest}</span>
                <select
                  name="interest"
                  className={`${inputBase} appearance-none`}
                  defaultValue=""
                  required
                >
                  <option value="" disabled>
                    {labels.interest}
                  </option>
                  {labels.interestOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="sr-only">{labels.quantity}</span>
                <input
                  type="text"
                  name="quantity"
                  placeholder={labels.quantity}
                  className={inputBase}
                />
              </label>
              <label className="block">
                <span className="sr-only">{labels.message}</span>
                <textarea
                  name="message"
                  placeholder={labels.message}
                  rows={4}
                  className={`${inputBase} min-h-28 resize-y`}
                />
              </label>
              {state === 'error' ? (
                <p role="alert" className="text-body-sm text-ff-charcoal">
                  {labels.errorMessage}{' '}
                  <a href={`mailto:${labels.contactEmail}`} className="font-bold underline">
                    {labels.contactEmail}
                  </a>
                </p>
              ) : null}
              <button
                type="submit"
                disabled={state === 'sending'}
                className="mt-2 w-full rounded-full bg-ff-gold px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-[#1b1b1b] transition-transform hover:scale-[1.01] hover:bg-[#EDD195] active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
              >
                {state === 'sending' ? labels.sending : labels.submit}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}

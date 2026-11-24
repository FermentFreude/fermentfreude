'use client'

import { usePathname } from 'next/navigation'
import React, { useState } from 'react'

type Props = {
  locale: 'de' | 'en'
  inputBase: string
  useSingleName: boolean
  placeholders: {
    name: string | null
    firstName: string
    lastName: string
    email: string
    message: string
  }
  subjectDefault: string
  subjectOptions: string[]
  submitButton: string
  successMessage: string
  errorMessage: string
  contactEmail: string
}

const SENDING = { de: 'Wird gesendet …', en: 'Sending …' } as const
const SEND_ANOTHER = { de: 'Weitere Nachricht senden', en: 'Send another message' } as const

export function ContactForm(props: Props) {
  const pathname = usePathname()
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (state === 'sending') return
    const fd = new FormData(e.currentTarget)
    const get = (k: string) => String(fd.get(k) ?? '').trim()
    const name = props.useSingleName
      ? get('name')
      : [get('firstName'), get('lastName')].filter(Boolean).join(' ')

    setState('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          source: 'contact',
          name,
          email: get('email'),
          subject: get('subject'),
          message: get('message'),
          website: get('website'),
          pagePath: pathname,
          locale: props.locale,
        }),
      })
      setState(res.ok ? 'sent' : 'error')
    } catch {
      setState('error')
    }
  }

  if (state === 'sent') {
    return (
      <div role="status" className="flex flex-col gap-4 rounded-lg bg-[#F6F0E8] p-6">
        <p className="whitespace-pre-line text-body leading-relaxed text-ff-charcoal">
          {props.successMessage}
        </p>
        <button
          type="button"
          onClick={() => setState('idle')}
          className="self-start font-display text-sm font-bold text-ff-charcoal underline underline-offset-4"
        >
          {SEND_ANOTHER[props.locale]}
        </button>
      </div>
    )
  }

  const { inputBase, placeholders } = props

  return (
    <form className="flex flex-col gap-3" onSubmit={onSubmit}>
      {/* Honeypot — hidden from people, bots fill it. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />
      {props.useSingleName ? (
        <input
          type="text"
          name="name"
          required
          autoComplete="name"
          aria-label={placeholders.name ?? ''}
          placeholder={placeholders.name ?? ''}
          className={inputBase}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            name="firstName"
            required
            autoComplete="given-name"
            aria-label={placeholders.firstName}
            placeholder={placeholders.firstName}
            className={inputBase}
          />
          <input
            type="text"
            name="lastName"
            autoComplete="family-name"
            aria-label={placeholders.lastName}
            placeholder={placeholders.lastName}
            className={inputBase}
          />
        </div>
      )}
      <input
        type="email"
        name="email"
        required
        aria-label={placeholders.email}
        placeholder={placeholders.email}
        className={inputBase}
        autoComplete="email"
      />
      <div className="relative">
        <select
          name="subject"
          aria-label={props.subjectDefault}
          className={`${inputBase} appearance-none pr-10 [&::-ms-expand]:hidden`}
          defaultValue=""
        >
          <option value="" disabled>
            {props.subjectDefault}
          </option>
          {props.subjectOptions.map((opt, idx) => (
            <option key={idx} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ff-gray-text">
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden>
            <path
              d="M1 1.5L6 6.5L11 1.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      <textarea
        name="message"
        required
        aria-label={placeholders.message}
        placeholder={placeholders.message}
        rows={5}
        className={`${inputBase} min-h-32 resize-y`}
      />
      {state === 'error' ? (
        <p role="alert" className="text-body-sm text-ff-charcoal">
          {props.errorMessage}{' '}
          <a href={`mailto:${props.contactEmail}`} className="font-bold underline">
            {props.contactEmail}
          </a>
        </p>
      ) : null}
      <button
        type="submit"
        disabled={state === 'sending'}
        className="mt-2 w-full rounded-lg bg-ff-gold-accent px-6 py-3 font-display text-base font-bold text-black transition-all duration-300 hover:scale-[1.02] hover:bg-ff-gold-accent-dark active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
      >
        {state === 'sending' ? SENDING[props.locale] : props.submitButton}
      </button>
    </form>
  )
}

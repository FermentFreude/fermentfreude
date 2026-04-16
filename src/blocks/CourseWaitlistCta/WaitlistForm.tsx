'use client'

import { FadeIn } from '@/components/FadeIn'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/utilities/cn'
import { ArrowRight, CheckCircle2, Mail } from 'lucide-react'
import { motion } from 'motion/react'
import { useState } from 'react'

type Props = {
  emailPlaceholder: string
  submitLabel: string
  successMessage: string
  locale: 'de' | 'en'
}

/** Same pattern as `NotifyMeDialog`: opens the user’s mail app to hello@fermentfreude.com — no server / Brevo. */
function buildMailtoHref(email: string, locale: 'de' | 'en'): string {
  const to = 'hello@fermentfreude.com'
  const subject =
    locale === 'de'
      ? 'Warteliste: Online-Kurs – FermentFreude'
      : 'Waitlist: FermentFreude online course'
  const bodyLines =
    locale === 'de'
      ? [
          'Bitte trage mich auf die Warteliste für den Online-Kurs ein.',
          '',
          `Meine E-Mail: ${email}`,
        ]
      : [
          'Please add me to the waitlist for the online course.',
          '',
          `My email: ${email}`,
        ]
  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`
}

export function WaitlistForm({ emailPlaceholder, submitLabel, successMessage, locale }: Props) {
  const reduce = usePrefersReducedMotion()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success'>('idle')

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return

    const fd = new FormData(e.currentTarget)
    const honeypot = fd.get('website') as string | null
    if (honeypot) {
      setStatus('success')
      return
    }

    window.location.href = buildMailtoHref(trimmed, locale)
    setStatus('success')
    setEmail('')
  }

  if (status === 'success') {
    return (
      <FadeIn>
        <motion.div
          className="rounded-xl border border-ff-border-light bg-white px-6 py-8 text-center shadow-sm sm:px-8"
          role="status"
          aria-live="polite"
          initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            className="mx-auto mb-4 flex size-11 items-center justify-center rounded-full bg-ff-gold-accent/15 ring-1 ring-ff-gold-accent/35"
            initial={reduce ? false : { scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={
              reduce
                ? { duration: 0 }
                : { type: 'spring', stiffness: 420, damping: 22, delay: 0.08 }
            }
          >
            <CheckCircle2 className="size-6 text-ff-olive" strokeWidth={2} aria-hidden />
          </motion.div>
          <p className="mx-auto max-w-md font-display text-body-lg font-semibold leading-relaxed text-ff-near-black [text-wrap:pretty]">
            {successMessage}
          </p>
        </motion.div>
      </FadeIn>
    )
  }

  return (
    <FadeIn>
      <form onSubmit={onSubmit} className="mx-auto w-full max-w-2xl lg:mx-0 lg:max-w-none" noValidate>
        <label className="sr-only" htmlFor="course-waitlist-email">
          {emailPlaceholder}
        </label>
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
          aria-hidden
        />

        <motion.div
          className="flex flex-col gap-2 rounded-xl border border-ff-border-light bg-white p-1 shadow-sm sm:flex-row sm:items-stretch"
          whileHover={reduce ? undefined : { boxShadow: '0 12px 40px -20px rgba(26, 26, 26, 0.12)' }}
          transition={{ duration: 0.25 }}
        >
          <div className="relative min-h-12 flex-1 sm:min-h-[3rem]">
            <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-ff-gray-muted">
              <Mail className="size-5" strokeWidth={2} aria-hidden />
            </span>
            <input
              id="course-waitlist-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={emailPlaceholder}
              className={cn(
                'h-full min-h-12 w-full rounded-lg border-0 bg-ff-warm-gray/20 py-3 pl-12 pr-4 font-sans text-body text-ff-near-black sm:min-h-[3rem]',
                'placeholder:text-ff-gray-muted transition-[box-shadow] focus:outline-none focus:ring-2 focus:ring-ff-gold-accent/45 focus:ring-offset-0',
              )}
            />
          </div>
          <motion.button
            type="submit"
            className="group inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-ff-gold-accent px-6 font-display text-[0.9375rem] font-bold tracking-wide text-ff-near-black shadow-[0_1px_0_0_rgba(0,0,0,0.06)] transition-colors hover:bg-ff-gold-accent-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ff-gold-accent-dark sm:min-h-[3rem] sm:px-7"
            whileTap={reduce ? undefined : { scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <span>{submitLabel}</span>
            <ArrowRight
              className="size-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
              aria-hidden
            />
          </motion.button>
        </motion.div>
      </form>
    </FadeIn>
  )
}

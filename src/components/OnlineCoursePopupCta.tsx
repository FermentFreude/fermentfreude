'use client'

import { WaitlistForm } from '@/blocks/CourseWaitlistCta/WaitlistForm'
import { useLocale } from '@/providers/Locale'
import { X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const POPUP_DEFAULTS = {
  de: {
    eyebrow: 'ONLINE-KURS',
    heading: 'Lerne Fermentation ohne Unsicherheit',
    description:
      'Trag dich auf die Warteliste ein und sei die Erste, die erfährt, wann der Kurs startet.',
    emailPlaceholder: 'Deine E-Mail-Adresse',
    submitLabel: 'Eintragen',
    successMessage: 'Danke! Wir haben deine Anfrage erhalten.',
  },
  en: {
    eyebrow: 'ONLINE COURSE',
    heading: 'Learn fermentation without uncertainty',
    description: 'Join the waitlist and be the first to know when the course launches.',
    emailPlaceholder: 'Your email address',
    submitLabel: 'Join waitlist',
    successMessage: 'Thanks! We received your request.',
  },
}

type Props = {
  href: string
  label: string
  className: string
}

/**
 * Renders a Link that intercepts clicks to open the online-course waitlist popup
 * instead of navigating. The href is kept as a fallback for right-click / no-JS.
 */
export function OnlineCoursePopupCta({ href, label, className }: Props) {
  const [open, setOpen] = useState(false)
  const { locale } = useLocale()

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  const popup = POPUP_DEFAULTS[locale === 'de' ? 'de' : 'en']

  return (
    <>
      <Link
        href={href}
        onClick={(event) => {
          event.preventDefault()
          setOpen(true)
        }}
        className={className}
      >
        {label}
      </Link>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={popup.heading}
        >
          <div
            className="relative w-full max-w-3xl rounded-3xl border border-ff-border-light bg-[#F9F0DC] p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/80 text-ff-charcoal transition hover:bg-white"
              aria-label={locale === 'de' ? 'Popup schließen' : 'Close popup'}
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto max-w-2xl text-center">
              <p className="text-eyebrow font-semibold tracking-[0.16em] text-ff-gold-accent-dark">
                {popup.eyebrow}
              </p>
              <h3 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-tight text-ff-near-black">
                {popup.heading}
              </h3>
              <div className="mx-auto mt-4 h-0.5 w-16 rounded-full bg-ff-gold-accent/70" />
              <p className="mx-auto mt-4 max-w-xl text-body-lg leading-relaxed text-ff-gray-text">
                {popup.description}
              </p>

              <div className="mt-6 rounded-2xl border border-ff-border-light/80 bg-white/75 p-2 shadow-sm backdrop-blur-sm">
                <WaitlistForm
                  emailPlaceholder={popup.emailPlaceholder}
                  submitLabel={popup.submitLabel}
                  successMessage={popup.successMessage}
                  locale={locale === 'de' ? 'de' : 'en'}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

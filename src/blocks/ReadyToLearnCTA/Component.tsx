'use client'

import { WaitlistForm } from '@/blocks/CourseWaitlistCta/WaitlistForm'
import type { ReadyToLearnCtaBlock as ReadyToLearnCtaBlockType } from '@/payload-types'
import { useLocale } from '@/providers/Locale'
import { X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const DEFAULTS = {
  heading: 'Ready to learn?',
  description:
    'Join our workshops and online courses to learn hands-on fermentation techniques, ask questions, and connect with a community of learners.',
  primaryButton: { label: 'View workshops', href: '/workshops' },
  secondaryButton: { label: 'Browse online courses', href: '/courses' },
  popup: {
    eyebrow: 'ONLINE COURSE',
    heading: 'Learn fermentation without uncertainty',
    description: 'Join the waitlist and be the first to know when the course launches.',
    emailPlaceholder: 'Your email address',
    submitLabel: 'Join waitlist',
    successMessage: 'Thanks! We received your request.',
  },
}

type Props = ReadyToLearnCtaBlockType & { id?: string }

export const ReadyToLearnCTABlock: React.FC<Props> = ({
  visible,
  heading,
  description,
  primaryButton,
  secondaryButton,
  popup,
  id,
}) => {
  const [showPopup, setShowPopup] = useState(false)
  const { locale } = useLocale()

  useEffect(() => {
    if (!showPopup) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowPopup(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showPopup])

  if (visible === false) return null
  const resolvedHeading = heading ?? DEFAULTS.heading
  const resolvedDescription = description ?? DEFAULTS.description
  const resolvedPrimary = {
    label: primaryButton?.label ?? DEFAULTS.primaryButton.label,
    href: primaryButton?.href ?? DEFAULTS.primaryButton.href,
  }
  const resolvedSecondary = {
    label: secondaryButton?.label ?? DEFAULTS.secondaryButton.label,
    href: secondaryButton?.href ?? DEFAULTS.secondaryButton.href,
    openPopup: secondaryButton?.openPopup ?? true,
  }
  const resolvedPopup = {
    eyebrow: popup?.eyebrow ?? DEFAULTS.popup.eyebrow,
    heading: popup?.heading ?? DEFAULTS.popup.heading,
    description: popup?.description ?? DEFAULTS.popup.description,
    emailPlaceholder: popup?.emailPlaceholder ?? DEFAULTS.popup.emailPlaceholder,
    submitLabel: popup?.submitLabel ?? DEFAULTS.popup.submitLabel,
    successMessage: popup?.successMessage ?? DEFAULTS.popup.successMessage,
  }
  const shouldUsePopup = resolvedSecondary.openPopup || !resolvedSecondary.href

  return (
    <section
      id={id ?? undefined}
      className="block-ready-to-learn relative section-padding-md bg-ff-charcoal overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
        aria-hidden
      />
      <div className="container relative mx-auto container-padding">
        <div className="flex flex-col items-center gap-(--space-content-lg) content-narrow mx-auto text-center">
          <h2 className="text-section-heading font-display font-bold text-white">
            {resolvedHeading}
          </h2>
          <p className="text-body-lg text-white/90 leading-relaxed">
            {resolvedDescription}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              href={resolvedPrimary.href}
              className="inline-flex items-center justify-center rounded-(--radius-pill) bg-ff-gold-accent hover:bg-ff-gold-accent-dark text-ff-near-black font-display font-bold text-base px-8 py-3 transition-all hover:scale-[1.03] active:scale-[0.97]"
            >
              {resolvedPrimary.label}
            </Link>
            {shouldUsePopup ? (
              <button
                type="button"
                onClick={() => setShowPopup(true)}
                className="inline-flex items-center justify-center rounded-(--radius-pill) border-2 border-white/80 bg-transparent text-white font-display font-bold text-base px-8 py-3 transition-all hover:bg-white hover:text-ff-charcoal hover:scale-[1.03] active:scale-[0.97]"
              >
                {resolvedSecondary.label}
              </button>
            ) : (
              <Link
                href={resolvedSecondary.href}
                className="inline-flex items-center justify-center rounded-(--radius-pill) border-2 border-white/80 bg-transparent text-white font-display font-bold text-base px-8 py-3 transition-all hover:bg-white hover:text-ff-charcoal hover:scale-[1.03] active:scale-[0.97]"
              >
                {resolvedSecondary.label}
              </Link>
            )}
          </div>
        </div>
      </div>

      {showPopup && (
        <div
          className="fixed inset-0 z-10000 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="relative w-full max-w-3xl rounded-3xl border border-ff-border-light bg-[#F9F0DC] p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowPopup(false)}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/80 text-ff-charcoal transition hover:bg-white"
              aria-label="Close popup"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mx-auto max-w-2xl text-center">
              <p className="text-eyebrow font-semibold tracking-[0.16em] text-ff-gold-accent-dark">
                {resolvedPopup.eyebrow}
              </p>
              <h3 className="font-display text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold leading-tight text-ff-near-black">
                {resolvedPopup.heading}
              </h3>
              <div className="mx-auto mt-4 h-0.5 w-16 rounded-full bg-ff-gold-accent/70" />
              <p className="mx-auto mt-4 max-w-xl text-body-lg leading-relaxed text-ff-gray-text">
                {resolvedPopup.description}
              </p>

              <div className="mt-6 rounded-2xl border border-ff-border-light/80 bg-white/75 p-2 shadow-sm backdrop-blur-sm">
                <WaitlistForm
                  emailPlaceholder={resolvedPopup.emailPlaceholder}
                  submitLabel={resolvedPopup.submitLabel}
                  successMessage={resolvedPopup.successMessage}
                  locale={locale === 'de' ? 'de' : 'en'}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

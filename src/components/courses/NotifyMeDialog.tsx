'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { cn } from '@/utilities/cn'

type Props = {
  courseTitle: string
  courseSlug?: string | null
  locale: 'de' | 'en' | string
  buttonLabel: string
  triggerClassName?: string
}

export function NotifyMeDialog({ courseTitle, courseSlug, locale, buttonLabel, triggerClassName }: Props) {
  const [open, setOpen] = useState(false)

  const heading =
    locale === 'de'
      ? 'Benachrichtige mich, wenn der Kurs verfügbar ist'
      : 'Notify me when this course is available'

  const description =
    locale === 'de'
      ? 'Hinterlasse deine E-Mail-Adresse und wir melden uns, sobald dieser Kurs buchbar ist.'
      : 'Leave your email and we will let you know as soon as this course is available to purchase.'

  const emailLabel = locale === 'de' ? 'E-Mail-Adresse' : 'Email address'
  const placeholder = locale === 'de' ? 'dein.name@example.com' : 'your.name@example.com'
  const submitLabel = locale === 'de' ? 'Benachrichtigen' : 'Notify me'

  const mailtoHref = (() => {
    const subject =
      locale === 'de'
        ? `Benachrichtigung für Kurs: ${courseTitle}`
        : `Notify me about course: ${courseTitle}`
    const bodyLines = [
      locale === 'de'
        ? 'Bitte benachrichtigt mich, sobald dieser Kurs online buchbar ist.'
        : 'Please notify me as soon as this course is available to purchase online.',
      '',
      `Kurs: ${courseTitle}`,
      courseSlug ? `Slug / Link: ${courseSlug}` : '',
      '',
      locale === 'de' ? 'Meine E-Mail:' : 'My email:',
    ]
    const body = encodeURIComponent(bodyLines.filter(Boolean).join('\n'))
    return `mailto:hello@fermentfreude.com?subject=${encodeURIComponent(subject)}&body=${body}`
  })()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex w-full items-center justify-center gap-2 rounded-lg border border-ff-border-light bg-ff-cream/50 py-3 text-[0.875rem] font-semibold text-ff-gray-text transition-colors hover:bg-ff-cream',
            triggerClassName,
          )}
        >
          {buttonLabel}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-[1.15rem] font-bold text-ff-near-black">
            {heading}
          </DialogTitle>
          <DialogDescription className="mt-2 text-body-sm text-ff-gray-text">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 space-y-3">
          <label className="block text-left text-[0.8125rem] font-medium text-ff-gray-text">
            {emailLabel}
          </label>
          <input
            type="email"
            placeholder={placeholder}
            className="w-full rounded-md border border-ff-border-light bg-white px-3 py-2 text-[0.875rem] text-ff-near-black shadow-sm focus:outline-none focus:ring-2 focus:ring-ff-gold-accent"
          />
          <a
            href={mailtoHref}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-ff-near-black px-4 py-2.5 text-[0.875rem] font-semibold text-white shadow-sm transition hover:bg-ff-charcoal"
            onClick={() => setOpen(false)}
          >
            {submitLabel}
          </a>
        </div>
      </DialogContent>
    </Dialog>
  )
}


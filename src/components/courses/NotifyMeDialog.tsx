'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Bell, CheckCircle2, Mail } from 'lucide-react'

type NotifyMeDialogProps = {
  courseTitle: string
  courseSlug?: string
  locale: string
  buttonLabel: string
  triggerClassName?: string
}

export function NotifyMeDialog({
  courseTitle,
  courseSlug,
  locale,
  buttonLabel,
  triggerClassName,
}: NotifyMeDialogProps) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const resolvedSlug =
    courseSlug ??
    courseTitle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

  const handleOpenChange = (next: boolean) => {
    setOpen(next)
    if (!next) {
      setTimeout(() => {
        setEmail('')
        setError(null)
        setSuccess(false)
        setIsSubmitting(false)
      }, 200)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmed = email.trim()
    if (!trimmed) {
      setError(locale === 'de' ? 'Bitte E-Mail eingeben.' : 'Please enter your email.')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) {
      setError(locale === 'de' ? 'Bitte eine gültige E-Mail eingeben.' : 'Please enter a valid email.')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmed,
          courseSlug: resolvedSlug,
          courseTitle,
          locale,
        }),
      })

      if (!res.ok) {
        throw new Error('Request failed')
      }

      setSuccess(true)
    } catch {
      setError(locale === 'de' ? 'Etwas ist schiefgelaufen. Bitte später erneut versuchen.' : 'Something went wrong. Please try again later.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const descriptionText =
    locale === 'de'
      ? 'Gib deine E-Mail ein und wir informieren dich, sobald dieser Kurs verfügbar ist.'
      : "Enter your email and we'll let you know when this course is available."

  const successText =
    locale === 'de'
      ? 'Du stehst jetzt auf der Warteliste. Wir melden uns, sobald der Kurs startet.'
      : 'You are now on the waitlist. We will email you as soon as the course is available.'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className={triggerClassName}
        >
          <Bell className="size-4 shrink-0" />
          {buttonLabel}
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-lg">
            {locale === 'de' ? 'Benachrichtige mich' : 'Notify Me When Available'}
          </DialogTitle>
          <DialogDescription>{descriptionText}</DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="mt-4 flex items-start gap-3 rounded-lg bg-ff-cream/80 p-4 text-left">
            <CheckCircle2 className="mt-0.5 size-5 text-ff-olive" />
            <p className="text-sm text-ff-near-black">{successText}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div className="space-y-1 text-left">
              <label className="text-sm font-medium text-ff-near-black">
                {locale === 'de' ? 'E-Mail-Adresse' : 'Email address'}
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-md border border-ff-border-light bg-white px-3 py-2 text-sm text-ff-near-black outline-none ring-ff-gold-accent focus:ring-2"
                  placeholder={locale === 'de' ? 'du@example.com' : 'you@example.com'}
                />
              </div>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <DialogFooter className="mt-4">
              <Button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-ff-gold-accent px-6 py-2 text-sm font-semibold text-ff-near-black hover:bg-ff-gold-accent-dark"
                disabled={isSubmitting}
              >
                <Mail className="size-4" />
                {isSubmitting
                  ? locale === 'de'
                    ? 'Wird gesendet...'
                    : 'Sending...'
                  : locale === 'de'
                    ? 'Auf Warteliste setzen'
                    : 'Join waitlist'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}


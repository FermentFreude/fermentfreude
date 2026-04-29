'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const COOKIE_BANNER_KEY = 'ff-cookie-banner-dismissed-v1'
const NEWSLETTER_SUBSCRIBED_KEY = 'ff-newsletter-popup-subscribed-v1'

type Props = {
  locale: string
}

export function OpeningPopups({ locale }: Props) {
  const isDe = locale === 'de'
  const [cookieBannerOpen, setCookieBannerOpen] = useState(false)
  const [newsletterOpen, setNewsletterOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    setInitialized(true)

    if (!localStorage.getItem(COOKIE_BANNER_KEY)) {
      setCookieBannerOpen(true)
    }

    // Show newsletter after 15s if the user hasn't subscribed yet.
    const newsletterTimer = setTimeout(() => {
      if (!localStorage.getItem(NEWSLETTER_SUBSCRIBED_KEY)) {
        setNewsletterOpen(true)
      }
    }, 15000)

    return () => clearTimeout(newsletterTimer)
  }, [])

  const closeNewsletter = () => {
    // Keep this popup recurring on future visits unless the user subscribes.
    setNewsletterOpen(false)
  }

  const acceptCookies = () => {
    localStorage.setItem(COOKIE_BANNER_KEY, '1')
    setCookieBannerOpen(false)
  }

  const submitNewsletter = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.trim() || status === 'loading') return

    setStatus('loading')
    setErrorMsg('')
    setErrorCode(null)

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), locale }),
      })

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          error?: string
          code?: string
        } | null
        const code = payload?.code || null
        setErrorCode(code)

        if (code === 'NEWSLETTER_NOT_CONFIGURED') {
          throw new Error(
            isDe
              ? 'Unser Newsletter startet in Kuerze. Trage dich gern per E-Mail ein.'
              : 'Our newsletter is launching soon. You can join via email.',
          )
        }

        throw new Error(
          payload?.error ||
            (isDe
              ? 'Bitte erneut versuchen. Etwas ist schiefgelaufen.'
              : 'Please try again. Something went wrong.'),
        )
      }

      setStatus('success')
      setEmail('')
      localStorage.setItem(NEWSLETTER_SUBSCRIBED_KEY, '1')
      setTimeout(() => setNewsletterOpen(false), 1200)
    } catch (error) {
      setStatus('error')
      const message =
        error instanceof Error && error.message
          ? error.message
          : isDe
            ? 'Leider hat die Anmeldung gerade nicht funktioniert. Bitte versuche es in einem Moment erneut.'
            : 'We could not complete your signup right now. Please try again in a moment.'
      setErrorMsg(message)
    }
  }

  if (!initialized) return null

  return (
    <>
      {cookieBannerOpen ? (
        <div className="fixed inset-x-4 bottom-4 z-90 sm:left-6 sm:right-6 sm:bottom-6 lg:left-auto lg:right-8 lg:max-w-md">
          <div className="rounded-2xl border border-[#1d1d1d]/12 bg-[#fdfbf8]/95 p-4 shadow-[0_16px_40px_rgba(0,0,0,0.12)] backdrop-blur">
            <p className="font-display text-sm font-bold text-[#1d1d1d] sm:text-base">
              {isDe ? 'Cookies' : 'Cookies'}
            </p>
            <p className="mt-2 font-sans text-xs leading-relaxed text-[#1d1d1d]/75 sm:text-sm">
              {isDe
                ? 'Wir verwenden notwendige Cookies, damit die Website funktioniert. Mehr dazu findest du in unserer Datenschutzerklaerung.'
                : 'We use essential cookies to keep the website working. You can find more details in our privacy policy.'}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={acceptCookies}
                className="rounded-full bg-[#4B4F4A] px-4 py-2 font-display text-xs font-bold text-white transition-colors hover:bg-[#3A3E39] sm:text-sm"
              >
                {isDe ? 'Verstanden' : 'Got it'}
              </button>
              <Link
                href={isDe ? '/datenschutz' : '/datenschutz'}
                className="rounded-full border border-[#1d1d1d]/15 px-4 py-2 font-display text-xs font-bold text-[#1d1d1d] transition-colors hover:bg-[#1d1d1d]/5 sm:text-sm"
              >
                {isDe ? 'Datenschutz' : 'Privacy Policy'}
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <Dialog
        open={newsletterOpen}
        onOpenChange={(open) => {
          setNewsletterOpen(open)
          if (!open) closeNewsletter()
        }}
      >
        <DialogContent className="max-w-sm sm:max-w-md border-[#1d1d1d]/15 bg-[#fdfbf8] p-4 sm:p-6">
          <DialogHeader>
            <p className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1d1d1d]/60">
              {isDe ? 'FermentFreude News' : 'FermentFreude News'}
            </p>
            <DialogTitle className="font-display text-lg sm:text-xl text-[#1d1d1d]">
              {isDe ? 'Newsletter abonnieren' : 'Join our Newsletter'}
            </DialogTitle>
            <DialogDescription className="font-sans text-xs sm:text-sm leading-relaxed text-[#1d1d1d]/80">
              {isDe
                ? 'Erhalte neue Workshops, Rezepte und Termine direkt per E-Mail.'
                : 'Get new workshops, recipes, and dates directly in your inbox.'}
            </DialogDescription>
          </DialogHeader>

          {status === 'success' ? (
            <p className="font-sans text-xs sm:text-sm text-green-700">
              {isDe ? 'Danke! Du bist erfolgreich angemeldet.' : 'Thanks! You are now subscribed.'}
            </p>
          ) : (
            <form className="mt-3 flex flex-col gap-2 sm:gap-3" onSubmit={submitNewsletter}>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={isDe ? 'dein.name@example.com' : 'your.name@example.com'}
                className="w-full rounded-lg border border-[#1d1d1d]/25 bg-white px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm text-[#1d1d1d] focus:border-[#1d1d1d] focus:outline-none"
              />

              <button
                type="submit"
                disabled={status === 'loading'}
                className="rounded-full bg-[#4B4F4A] px-4 sm:px-6 py-2 sm:py-2.5 font-display text-xs sm:text-sm font-bold text-white transition-colors hover:bg-[#3A3E39] disabled:opacity-60"
              >
                {status === 'loading'
                  ? isDe
                    ? 'Wird gesendet...'
                    : 'Submitting...'
                  : isDe
                    ? 'Anmelden'
                    : 'Subscribe'}
              </button>

              {status === 'error' && errorMsg ? (
                <div className="space-y-1 sm:space-y-2">
                  <p className="font-sans text-[11px] sm:text-xs text-red-600">{errorMsg}</p>
                  {errorCode === 'NEWSLETTER_NOT_CONFIGURED' ? (
                    <a
                      href={`mailto:hello@fermentfreude.com?subject=${
                        isDe ? 'Newsletter Anmeldung' : 'Newsletter Signup'
                      }&body=${encodeURIComponent(email || '')}`}
                      className="inline-block font-sans text-[11px] sm:text-xs font-semibold text-[#1d1d1d] underline underline-offset-1"
                    >
                      {isDe ? 'Per E-Mail anmelden' : 'Join via email'}
                    </a>
                  ) : null}
                </div>
              ) : null}
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

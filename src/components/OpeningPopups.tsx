'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const COOKIE_CONSENT_KEY = 'ff-cookie-consent-v1'
const NEWSLETTER_SUBSCRIBED_KEY = 'ff-newsletter-popup-subscribed-v1'

type Props = {
  locale: string
}

export function OpeningPopups({ locale }: Props) {
  const isDe = locale === 'de'
  const [cookieOpen, setCookieOpen] = useState(false)
  const [newsletterOpen, setNewsletterOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Product request: always show cookie popup on site open, then newsletter.
    setCookieOpen(true)
    setInitialized(true)
  }, [])

  const saveCookieConsent = (value: 'accepted' | 'essential') => {
    localStorage.setItem(COOKIE_CONSENT_KEY, value)
    document.cookie = `ff-cookie-consent=${value};path=/;max-age=31536000;SameSite=Lax`
    setCookieOpen(false)

    if (!localStorage.getItem(NEWSLETTER_SUBSCRIBED_KEY)) {
      setNewsletterOpen(true)
    }
  }

  const closeNewsletter = () => {
    // Keep this popup recurring on future visits unless the user subscribes.
    setNewsletterOpen(false)
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
        const payload = (await response.json().catch(() => null)) as
          | { error?: string; code?: string }
          | null
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
      <Dialog open={cookieOpen} onOpenChange={setCookieOpen}>
        <DialogContent
          className="max-w-3xl border-[#1d1d1d]/10 bg-[#F6F3EF] p-8 sm:p-10 shadow-2xl"
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle className="font-display text-3xl font-bold text-[#1d1d1d] sm:text-4xl">
              {isDe ? 'Informationen zu Cookies' : 'About cookies on this site'}
            </DialogTitle>
            <DialogDescription className="mt-3 max-w-2xl font-sans text-[1.05rem] leading-relaxed text-[#3b3b3b]">
              {isDe
                ? 'Wir verwenden Cookies, um Inhalte zu personalisieren, Zugriffe zu analysieren und unsere Website kontinuierlich zu verbessern. Mit deiner Auswahl entscheidest du, welche Cookies wir setzen duerfen.'
                : 'We use cookies to personalize content, analyze traffic, and continuously improve your website experience. With your selection, you decide which cookies we are allowed to set.'}
            </DialogDescription>
          </DialogHeader>

          <Link
            href="/datenschutz"
            className="mt-4 inline-flex w-fit font-sans text-base font-medium text-[#1d1d1d] underline underline-offset-4 transition hover:text-[#3a3e39]"
          >
            {isDe ? 'Mehr erfahren' : 'Learn more'}
          </Link>

          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
            <button
              type="button"
              onClick={() => saveCookieConsent('essential')}
              className="w-full whitespace-nowrap rounded-xl border border-[#cda25a] bg-[#E5B765] px-8 py-3 font-display text-sm font-bold uppercase tracking-[0.04em] text-[#1d1d1d] shadow-[0_3px_10px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#D4A654] hover:shadow-[0_6px_16px_rgba(0,0,0,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d1d1d]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F6F3EF] active:translate-y-0"
            >
              {isDe ? 'Nur notwendige' : 'Essential only'}
            </button>
            <button
              type="button"
              onClick={() => saveCookieConsent('accepted')}
              className="w-full whitespace-nowrap rounded-xl border border-[#cda25a] bg-[#E5B765] px-8 py-3 font-display text-sm font-bold uppercase tracking-[0.04em] text-[#1d1d1d] shadow-[0_3px_10px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#D4A654] hover:shadow-[0_6px_16px_rgba(0,0,0,0.14)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1d1d1d]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F6F3EF] active:translate-y-0"
            >
              {isDe ? 'Alle akzeptieren' : 'Allow all'}
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/datenschutz#cookies"
              className="font-sans text-base font-semibold text-[#1d1d1d] underline underline-offset-4 transition hover:text-[#3a3e39]"
            >
              {isDe ? 'Cookie-Einstellungen' : 'Cookie settings'}
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={newsletterOpen}
        onOpenChange={(open) => {
          setNewsletterOpen(open)
          if (!open) closeNewsletter()
        }}
      >
        <DialogContent className="max-w-xl border-[#1d1d1d]/15 bg-[#fdfbf8] p-7 sm:p-8">
          <DialogHeader>
            <p className="font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1d1d1d]/60">
              {isDe ? 'FermentFreude News' : 'FermentFreude News'}
            </p>
            <DialogTitle className="font-display text-2xl text-[#1d1d1d]">
              {isDe ? 'Newsletter abonnieren' : 'Join our Newsletter'}
            </DialogTitle>
            <DialogDescription className="font-sans text-sm leading-relaxed text-[#1d1d1d]/80">
              {isDe
                ? 'Erhalte neue Workshops, Rezepte und Termine direkt per E-Mail.'
                : 'Get new workshops, recipes, and dates directly in your inbox.'}
            </DialogDescription>
          </DialogHeader>

          {status === 'success' ? (
            <p className="font-sans text-sm text-green-700">
              {isDe ? 'Danke! Du bist erfolgreich angemeldet.' : 'Thanks! You are now subscribed.'}
            </p>
          ) : (
            <form className="mt-4 flex flex-col gap-3" onSubmit={submitNewsletter}>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={isDe ? 'dein.name@example.com' : 'your.name@example.com'}
                className="w-full rounded-xl border border-[#1d1d1d]/25 bg-white px-4 py-3 text-sm text-[#1d1d1d] focus:border-[#1d1d1d] focus:outline-none"
              />

              <button
                type="submit"
                disabled={status === 'loading'}
                className="rounded-full bg-[#4B4F4A] px-6 py-2.5 font-display text-sm font-bold text-white transition-colors hover:bg-[#3A3E39] disabled:opacity-60"
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
                <div className="space-y-2">
                  <p className="font-sans text-xs text-red-600">{errorMsg}</p>
                  {errorCode === 'NEWSLETTER_NOT_CONFIGURED' ? (
                    <a
                      href={`mailto:hello@fermentfreude.com?subject=${
                        isDe ? 'Newsletter Anmeldung' : 'Newsletter Signup'
                      }&body=${encodeURIComponent(email || '')}`}
                      className="inline-block font-sans text-xs font-semibold text-[#1d1d1d] underline underline-offset-2"
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

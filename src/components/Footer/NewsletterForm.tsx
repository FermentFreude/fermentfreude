'use client'

import { CheckCircle2, X } from 'lucide-react'
import { useEffect, useState } from 'react'

type Props = {
  locale?: string
}

export default function NewsletterForm({ locale = 'de' }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  const isDe = locale === 'de'

  useEffect(() => {
    if (!showSuccess) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSuccess(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [showSuccess])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || status === 'loading') return

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), locale }),
      })

      if (res.ok) {
        setStatus('success')
        setEmail('')
        setShowSuccess(true)
      } else {
        setStatus('error')
        setErrorMsg(
          isDe
            ? 'Etwas ist schiefgelaufen. Bitte versuche es erneut.'
            : 'Something went wrong. Please try again.',
        )
      }
    } catch {
      setStatus('error')
      setErrorMsg(
        isDe ? 'Netzwerkfehler. Bitte versuche es erneut.' : 'Network error. Please try again.',
      )
    }
  }

  const successTitle = isDe ? 'Danke für dein Vertrauen!' : 'Thank you!'
  const successBody = isDe
    ? 'Du bist jetzt Teil der FermentFreude-Community. Wir haben dir eine Bestätigung per E-Mail geschickt.'
    : "You're now part of the FermentFreude community. We just sent a confirmation to your inbox."
  const closeLabel = isDe ? 'Schließen' : 'Close'

  return (
    <>
      {status === 'success' ? (
        <p className="font-sans text-sm tracking-wider py-2">
          {isDe
            ? 'Danke! Wir halten dich auf dem Laufenden.'
            : "Thanks! We'll keep you updated."}
        </p>
      ) : (
        <form className="flex items-center border-b border-[#1d1d1d] pb-1" onSubmit={handleSubmit}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="EMAIL"
            className="flex-1 bg-transparent font-sans text-sm tracking-wider placeholder:text-[#1d1d1d]/40 focus:outline-none py-2"
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="font-sans text-sm font-semibold tracking-wider hover:text-(--footer-accent) transition-colors py-2 pl-4 disabled:opacity-50"
          >
            {status === 'loading' ? '...' : 'OK'}
          </button>
          {status === 'error' && errorMsg && (
            <p className="absolute mt-12 font-sans text-xs text-red-600">{errorMsg}</p>
          )}
        </form>
      )}

      {showSuccess && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label={successTitle}
          onClick={() => setShowSuccess(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-ff-border-light bg-[#F9F0DC] p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowSuccess(false)}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/80 text-ff-charcoal transition hover:bg-white"
              aria-label={closeLabel}
            >
              <X className="h-4 w-4" />
            </button>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-ff-gold-accent/20">
              <CheckCircle2 className="h-9 w-9 text-ff-gold-accent-dark" />
            </div>
            <h3 className="font-display text-2xl font-bold leading-tight text-ff-near-black">
              {successTitle}
            </h3>
            <div className="mx-auto my-4 h-0.5 w-12 rounded-full bg-ff-gold-accent/70" />
            <p className="text-body leading-relaxed text-ff-gray-text">{successBody}</p>
            <button
              type="button"
              onClick={() => setShowSuccess(false)}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-ff-near-black px-6 py-2.5 font-display text-sm font-bold text-white transition hover:bg-ff-charcoal"
            >
              {closeLabel}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

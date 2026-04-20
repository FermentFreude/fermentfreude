'use client'

import { useState } from 'react'

type Props = {
  locale?: string
}

export function NewsletterForm({ locale = 'de' }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const isDe = locale === 'de'

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

  if (status === 'success') {
    return (
      <p className="font-sans text-sm tracking-wider py-2">
        {isDe
          ? 'Danke! Wir halten dich auf dem Laufenden. 🎉'
          : "Thanks! We'll keep you updated. 🎉"}
      </p>
    )
  }

  return (
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
        className="font-sans text-sm font-semibold tracking-wider hover:text-[#e6be68] transition-colors py-2 pl-4 disabled:opacity-50"
      >
        {status === 'loading' ? '...' : 'OK'}
      </button>
      {status === 'error' && errorMsg && (
        <p className="absolute mt-12 font-sans text-xs text-red-600">{errorMsg}</p>
      )}
    </form>
  )
}

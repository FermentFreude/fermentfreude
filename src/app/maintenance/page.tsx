'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function MaintenancePage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/preview-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.refresh()
      router.push('/')
    } else {
      setError('Falsches Passwort / Wrong password')
      setLoading(false)
    }
  }

  return (
    <html lang="de" suppressHydrationWarning>
      <head>
        <title>FermentFreude — Wartung / Maintenance</title>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          background: '#faf9f6',
          color: '#1a1a1a',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: 440, padding: '2rem' }}>
          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              marginBottom: '0.5rem',
            }}
          >
            FermentFreude
          </div>

          <p
            style={{
              fontSize: '1.1rem',
              color: '#666',
              marginBottom: '0.75rem',
              lineHeight: 1.6,
            }}
          >
            Der Shop ist kurz geschlossen — wir sind gleich zurück.
          </p>
          <p
            style={{
              fontSize: '0.95rem',
              color: '#888',
              marginBottom: '2rem',
              lineHeight: 1.6,
            }}
          >
            The shop is temporarily closed for maintenance. We&apos;ll be back
            shortly.
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="Admin-Passwort / Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                border: '1px solid #ddd',
                borderRadius: 8,
                outline: 'none',
                marginBottom: '0.75rem',
                boxSizing: 'border-box' as const,
                background: '#fff',
              }}
              autoFocus
            />
            <button
              type="submit"
              disabled={loading || !password}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                fontWeight: 600,
                border: 'none',
                borderRadius: 8,
                background: '#1a1a1a',
                color: '#fff',
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading || !password ? 0.6 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              {loading ? '...' : 'Eintreten / Enter'}
            </button>
          </form>

          {error && (
            <p style={{ color: '#c00', marginTop: '0.75rem', fontSize: '0.9rem' }}>
              {error}
            </p>
          )}

          <p
            style={{
              marginTop: '3rem',
              fontSize: '0.8rem',
              color: '#aaa',
            }}
          >
            © {new Date().getFullYear()} FermentFreude
          </p>
        </div>
      </body>
    </html>
  )
}

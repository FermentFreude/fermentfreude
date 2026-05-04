'use client'

import { SecondaryLogo } from '@/components/icons'
import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

const INPUT_STYLE: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  fontSize: '1rem',
  border: '1px solid #ddd',
  borderRadius: 8,
  outline: 'none',
  marginBottom: '0.75rem',
  boxSizing: 'border-box',
  background: '#fff',
  color: '#1a1a1a',
}

const BTN_PRIMARY: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  fontSize: '1rem',
  fontWeight: 600,
  border: 'none',
  borderRadius: 8,
  background: '#1a1a1a',
  color: '#fff',
  cursor: 'pointer',
  transition: 'opacity 0.2s',
}

export default function MaintenancePage() {
  // — Waitlist form —
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [interest, setInterest] = useState('')
  const [notifyLoading, setNotifyLoading] = useState(false)
  const [notifyDone, setNotifyDone] = useState(false)
  const [notifyError, setNotifyError] = useState('')

  // — Admin access —
  const [showAdmin, setShowAdmin] = useState(false)
  const [password, setPassword] = useState('')
  const [adminError, setAdminError] = useState('')
  const [adminLoading, setAdminLoading] = useState(false)
  const router = useRouter()

  const handleNotify = async (e: FormEvent) => {
    e.preventDefault()
    setNotifyLoading(true)
    setNotifyError('')
    try {
      const res = await fetch('/api/maintenance-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, interest }),
      })
      if (res.ok) {
        setNotifyDone(true)
      } else {
        setNotifyError('Etwas ist schiefgelaufen — bitte versuche es erneut.')
      }
    } catch {
      setNotifyError('Etwas ist schiefgelaufen — bitte versuche es erneut.')
    } finally {
      setNotifyLoading(false)
    }
  }

  const handleAdmin = async (e: FormEvent) => {
    e.preventDefault()
    setAdminLoading(true)
    setAdminError('')
    const res = await fetch('/api/preview-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })
    if (res.ok) {
      router.refresh()
      router.push('/')
    } else {
      setAdminError('Falsches Passwort / Wrong password')
      setAdminLoading(false)
    }
  }

  return (
    <div style={{ textAlign: 'center', maxWidth: 440, padding: '2rem', width: '100%' }}>
      {/* Logo */}
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
        <SecondaryLogo width={200} height={86} priority />
      </div>

      {/* Headline */}
      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          letterSpacing: '-0.02em',
          marginBottom: '0.5rem',
          color: '#1a1a1a',
        }}
      >
        Wir öffnen bald.
      </h1>
      <p style={{ fontSize: '0.95rem', color: '#555', marginBottom: '0.5rem', lineHeight: 1.6 }}>
        Der Shop ist kurz in der Vorbereitung.
      </p>
      <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '2rem', lineHeight: 1.6 }}>
        We&apos;re getting ready to open. Leave your email and we&apos;ll let you know the moment
        we launch — so you can secure your workshop spot first.
      </p>

      {/* Waitlist form */}
      {notifyDone ? (
        <div
          style={{
            padding: '1.25rem',
            background: '#f0f7f0',
            border: '1px solid #c3e0c3',
            borderRadius: 10,
            marginBottom: '2rem',
            color: '#2a6a2a',
            lineHeight: 1.6,
          }}
        >
          <strong>Danke! 🌱</strong>
          <br />
          Wir schreiben dir, sobald der Shop öffnet.
          <br />
          <span style={{ fontSize: '0.85rem', color: '#4a8a4a' }}>
            Thanks! We&apos;ll send you an email when we launch.
          </span>
        </div>
      ) : (
        <form onSubmit={handleNotify} style={{ marginBottom: '2rem' }}>
          <input
            type="text"
            placeholder="Vorname / First name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={INPUT_STYLE}
            required
          />
          <input
            type="email"
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={INPUT_STYLE}
            required
          />
          <select
            value={interest}
            onChange={(e) => setInterest(e.target.value)}
            style={{ ...INPUT_STYLE, color: interest ? '#1a1a1a' : '#888' }}
          >
            <option value="">Workshop-Interesse (optional)</option>
            <option value="basics">Fermentation Basics</option>
            <option value="kombucha">Kombucha</option>
            <option value="lakto">Laktofermentation</option>
            <option value="tempeh">Tempeh</option>
            <option value="produkte">Produkte / Shop</option>
            <option value="alles">Alles / Everything</option>
          </select>
          <button
            type="submit"
            disabled={notifyLoading || !email || !name}
            style={{
              ...BTN_PRIMARY,
              opacity: notifyLoading || !email || !name ? 0.5 : 1,
              cursor: notifyLoading || !email || !name ? 'not-allowed' : 'pointer',
            }}
          >
            {notifyLoading ? '...' : 'Benachrichtige mich / Notify me'}
          </button>
          {notifyError && (
            <p style={{ color: '#c00', marginTop: '0.5rem', fontSize: '0.85rem' }}>
              {notifyError}
            </p>
          )}
        </form>
      )}

      {/* Admin access — subtle toggle */}
      <div style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
        <button
          onClick={() => setShowAdmin((v) => !v)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '0.8rem',
            color: '#bbb',
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline',
          }}
        >
          {showAdmin ? 'Schließen' : 'Admin-Zugang / Admin access'}
        </button>

        {showAdmin && (
          <form onSubmit={handleAdmin} style={{ marginTop: '1rem' }}>
            <input
              type="password"
              placeholder="Admin-Passwort"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={INPUT_STYLE}
              autoFocus
            />
            <button
              type="submit"
              disabled={adminLoading || !password}
              style={{
                ...BTN_PRIMARY,
                opacity: adminLoading || !password ? 0.5 : 1,
                cursor: adminLoading || !password ? 'not-allowed' : 'pointer',
              }}
            >
              {adminLoading ? '...' : 'Eintreten / Enter'}
            </button>
            {adminError && (
              <p style={{ color: '#c00', marginTop: '0.5rem', fontSize: '0.85rem' }}>
                {adminError}
              </p>
            )}
          </form>
        )}
      </div>

      <p style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#ccc' }}>
        © {new Date().getFullYear()} FermentFreude
      </p>
    </div>
  )
}

'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

export default function ComingSoonPage() {
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
    } else {
      setError('Wrong password')
      setLoading(false)
    }
  }

  return (
    <div style={{ textAlign: 'center', maxWidth: 420, padding: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-v2.svg"
          alt="FermentFreude"
          width={280}
          height={120}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
      <p
        style={{
          fontSize: '1.1rem',
          color: '#1a1a1a',
          marginBottom: '2rem',
          lineHeight: 1.6,
        }}
      >
        We&apos;re working on something special.
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Password"
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
            boxSizing: 'border-box',
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
          {loading ? '...' : 'Enter'}
        </button>
      </form>

      {error && <p style={{ color: '#c00', marginTop: '0.75rem', fontSize: '0.9rem' }}>{error}</p>}

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
  )
}

'use client'

import Link from 'next/link'
import { useCallback, useState } from 'react'

type ValidatedVoucher = {
  code: string
  value: number
}

export function RedeemVoucherClient() {
  const [code, setCode] = useState('')
  const [voucher, setVoucher] = useState<ValidatedVoucher | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleValidate = useCallback(async () => {
    setError(null)
    const trimmed = code.trim()
    if (!trimmed) {
      setError('Bitte gib deinen Gutschein-Code ein.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/voucher/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Ung\u00FCltiger Gutschein-Code.')
        return
      }

      setVoucher(data.voucher)
    } catch (_err) {
      setError('Verbindungsfehler. Bitte versuche es erneut.')
    } finally {
      setLoading(false)
    }
  }, [code])

  return (
    <div className="min-h-screen bg-white py-16 px-6">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-ff-gold-accent/15 flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-ff-gold-accent">
              <path
                d="M20 6H17.82C17.93 5.69 18 5.35 18 5C18 3.34 16.66 2 15 2C13.95 2 13.04 2.54 12.5 3.35L12 4.02L11.5 3.34C10.96 2.54 10.05 2 9 2C7.34 2 6 3.34 6 5C6 5.35 6.07 5.69 6.18 6H4C2.89 6 2.01 6.89 2.01 8L2 19C2 20.11 2.89 21 4 21H20C21.11 21 22 20.11 22 19V8C22 6.89 21.11 6 20 6ZM15 4C15.55 4 16 4.45 16 5C16 5.55 15.55 6 15 6C14.45 6 14 5.55 14 5C14 4.45 14.45 4 15 4ZM9 4C9.55 4 10 4.45 10 5C10 5.55 9.55 6 9 6C8.45 6 8 5.55 8 5C8 4.45 8.45 4 9 4ZM20 19H4V17H20V19ZM20 15H4V8H7.08C7.03 8.16 7 8.33 7 8.5C7 9.33 7.67 10 8.5 10C9.33 10 10 9.33 10 8.5C10 8.33 9.97 8.16 9.92 8H14.08C14.03 8.16 14 8.33 14 8.5C14 9.33 14.67 10 15.5 10C16.33 10 17 9.33 17 8.5C17 8.33 16.97 8.16 16.92 8H20V15Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h1 className="font-display text-h1 font-bold text-ff-near-black">
            Gutschein pr\u00FCfen
          </h1>
          <p className="font-sans text-body-lg text-ff-gray-text mt-2">
            Gib deinen Gutschein-Code ein, um den Wert zu pr\u00FCfen.
          </p>
        </div>

        {!voucher ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-ff-border-light bg-ff-cream p-6 md:p-8">
              <label
                htmlFor="voucher-code"
                className="font-display text-body font-bold text-ff-near-black block mb-3"
              >
                Gutschein-Code
              </label>
              <input
                id="voucher-code"
                type="text"
                placeholder="z.B. FF-GIFT-A7K3M2X9"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
                maxLength={30}
                autoFocus
                className="w-full rounded-xl border border-ff-border-light bg-white px-5 py-4 font-mono text-body-lg text-ff-near-black tracking-widest placeholder:text-ff-gray-text-light placeholder:tracking-normal placeholder:font-sans focus:border-ff-gold-accent focus:outline-none focus:ring-2 focus:ring-ff-gold-accent/20 transition-colors"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-3">
                <p className="font-sans text-body-sm text-red-700">{error}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleValidate}
              disabled={loading || !code.trim()}
              className="w-full rounded-full bg-ff-gold-accent px-8 py-4 font-display text-body-lg font-bold text-ff-near-black shadow-md transition-all duration-200 hover:bg-ff-gold-accent-dark hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Wird gepr\u00FCft\u2026' : 'Code pr\u00FCfen'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border-2 border-ff-gold-accent bg-[radial-gradient(circle_at_top,_#F8F2E6,_#FFFFFF)] p-8 text-center">
              <p className="font-sans text-body-sm font-medium text-ff-gray-text uppercase tracking-wider mb-1">
                G\u00FCltiger Gutschein
              </p>
              <p className="font-display text-h3 font-bold text-ff-near-black tracking-widest mb-4">
                {voucher.code}
              </p>
              <div className="border-t border-ff-border-light pt-4">
                <p className="font-display text-body-lg font-bold text-ff-near-black">
                  Workshop-Erlebnis Gutschein
                </p>
                <p className="font-display text-[2rem] font-bold text-ff-gold-accent mt-1">
                  \u20AC{voucher.value},00
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-ff-ivory-mist border border-ff-border-light/50 p-5">
              <p className="font-sans text-body text-ff-gray-text">
                Dein Gutschein ist g\u00FCltig! W\u00E4hle einen Workshop aus, lege ihn in den
                Warenkorb und gib den Code beim Checkout ein.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="/workshops"
                className="w-full text-center rounded-full bg-ff-gold-accent px-8 py-4 font-display text-body-lg font-bold text-ff-near-black shadow-md transition-all duration-200 hover:bg-ff-gold-accent-dark hover:shadow-lg"
              >
                Workshops ansehen
              </Link>
              <button
                type="button"
                onClick={() => {
                  setVoucher(null)
                  setCode('')
                  setError(null)
                }}
                className="w-full rounded-full border-2 border-ff-border-light px-8 py-3 font-display text-body font-bold text-ff-near-black transition-all hover:border-ff-gold-accent/50"
              >
                Anderen Code pr\u00FCfen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

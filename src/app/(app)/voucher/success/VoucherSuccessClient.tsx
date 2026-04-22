'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

type VoucherResult = {
  code: string
  value: number
  deliveryMethod: string
  recipientEmail: string | null
}

export function VoucherSuccessClient() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [voucher, setVoucher] = useState<VoucherResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const confirming = useRef(false)

  const confirmVoucher = useCallback(async (sid: string) => {
    try {
      const res = await fetch(`/api/voucher/confirm?session_id=${encodeURIComponent(sid)}`)
      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'Fehler bei der Bestätigung.')
        return
      }

      setVoucher(data.voucher)
    } catch (_err) {
      setError('Verbindungsfehler. Bitte lade die Seite neu.')
    } finally {
      setLoading(false)
    }
  }, [])

  const handleDownloadPDF = useCallback(async () => {
    if (!voucher?.code) return

    setPdfLoading(true)
    try {
      const response = await fetch(`/api/voucher/generate-pdf?code=${encodeURIComponent(voucher.code)}`)
      if (!response.ok) {
        toast.error('PDF konnte nicht heruntergeladen werden.')
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `gutschein-${voucher.code}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('PDF heruntergeladen!')
    } catch (_err) {
      toast.error('Fehler beim Download.')
    } finally {
      setPdfLoading(false)
    }
  }, [voucher?.code])

  const handleCopyCode = useCallback(() => {
    if (!voucher?.code) return
    navigator.clipboard.writeText(voucher.code)
    setCodeCopied(true)
    toast.success('Code kopiert!')
    setTimeout(() => setCodeCopied(false), 2000)
  }, [voucher?.code])

  useEffect(() => {
    if (!sessionId) {
      setError('Keine Sitzungs-ID gefunden.')
      setLoading(false)
      return
    }

    if (!confirming.current) {
      confirming.current = true
      confirmVoucher(sessionId)
    }
  }, [sessionId, confirmVoucher])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-ff-gold-accent border-t-transparent rounded-full mx-auto mb-4" />
          <p className="font-sans text-body text-ff-gray-text">Gutschein wird erstellt…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-red-500">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"
                fill="currentColor"
              />
            </svg>
          </div>
          <h1 className="font-display text-h2 font-bold text-ff-near-black mb-3">
            Fehler
          </h1>
          <p className="font-sans text-body text-ff-gray-text mb-6">{error}</p>
          <Link
            href="/workshops/voucher"
            className="inline-block rounded-full bg-ff-gold-accent px-8 py-3 font-display text-body font-bold text-ff-near-black transition-all hover:bg-ff-gold-accent-dark"
          >
            Zurück zum Gutschein
          </Link>
        </div>
      </div>
    )
  }

  if (!voucher) return null

  return (
    <div className="min-h-screen bg-white py-16 px-6">
      <div className="max-w-lg mx-auto text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-8">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="text-green-600">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
              fill="currentColor"
            />
          </svg>
        </div>

        <h1 className="font-display text-h1 font-bold text-ff-near-black mb-3">
          Gutschein erstellt!
        </h1>
        <p className="font-sans text-body-lg text-ff-gray-text mb-10">
          Dein Geschenkgutschein f\u00FCr ein <strong>Workshop-Erlebnis</strong> wurde erfolgreich
          erstellt.
        </p>

        {/* Voucher Code Card with Copy */}
        <div className="rounded-2xl border-2 border-ff-gold-accent bg-[radial-gradient(circle_at_top,#F8F2E6,#FFFFFF)] p-8 mb-8 shadow-md">
          <p className="font-sans text-body-sm font-medium text-ff-gray-text uppercase tracking-wider mb-2">
            Gutschein-Code
          </p>
          <p className="font-display text-[clamp(1.5rem,3vw,2rem)] font-bold text-ff-near-black tracking-widest select-all mb-4">
            {voucher.code}
          </p>
          <button
            onClick={handleCopyCode}
            className="mx-auto block rounded-lg bg-ff-gold-accent/10 hover:bg-ff-gold-accent/20 px-4 py-2 font-sans text-body-sm font-medium text-ff-gold-accent transition-colors mb-4"
          >
            {codeCopied ? '✓ Kopiert!' : 'Code kopieren'}
          </button>
          <div className="pt-4 border-t border-ff-border-light">
            <p className="font-sans text-body text-ff-gray-text">
              <strong>Workshop-Erlebnis Gutschein</strong> — €{voucher.value},00
            </p>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="rounded-xl bg-ff-cream border border-ff-border-light p-5 mb-8 text-left">
          {voucher.deliveryMethod === 'email' ? (
            <div className="flex items-start gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-ff-gold-accent mt-0.5 shrink-0">
                <path
                  d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
                  fill="currentColor"
                />
              </svg>
              <div>
                <p className="font-sans text-body font-medium text-ff-near-black">
                  Per E-Mail zugestellt
                </p>
                {voucher.recipientEmail && (
                  <p className="font-sans text-body-sm text-ff-gray-text mt-1">
                    An: {voucher.recipientEmail}
                  </p>
                )}
                <p className="font-sans text-body-sm text-ff-gray-text mt-1">
                  Eine Bestätigung wurde auch an deine E-Mail-Adresse gesendet.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-ff-gold-accent mt-0.5 shrink-0">
                <path
                  d="M19 7V4H5V7H2V20H8V14H16V20H22V7H19ZM6 18H4V9H6V18ZM20 18H18V14H20V18ZM18 12V9H16V12H18Z"
                  fill="currentColor"
                />
              </svg>
              <div>
                <p className="font-sans text-body font-medium text-ff-near-black">
                  Zur Abholung bereit
                </p>
                <p className="font-sans text-body-sm text-ff-gray-text mt-1">
                  Grabenstraße 15, 8010 Graz
                </p>
                <p className="font-sans text-body-sm text-ff-gray-text mt-1">
                  Wir informieren dich per E-Mail, sobald der Gutschein abholbereit ist.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Redemption Instructions */}
        <div className="rounded-xl bg-ff-ivory-mist border border-ff-border-light/50 p-6 mb-8 text-left">
          <h3 className="font-display text-body font-bold text-ff-near-black mb-4">
            So nutzt du deinen Gutschein:
          </h3>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="inline-block w-6 h-6 rounded-full bg-ff-gold-accent text-white text-center text-body-sm font-bold shrink-0">
                1
              </span>
              <span className="font-sans text-body text-ff-gray-text pt-0.5">
                Besuche <strong>fermentfreude.at/redeem-voucher</strong>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="inline-block w-6 h-6 rounded-full bg-ff-gold-accent text-white text-center text-body-sm font-bold shrink-0">
                2
              </span>
              <span className="font-sans text-body text-ff-gray-text pt-0.5">
                Gib deinen Gutschein-Code ein
              </span>
            </li>
            <li className="flex gap-3">
              <span className="inline-block w-6 h-6 rounded-full bg-ff-gold-accent text-white text-center text-body-sm font-bold shrink-0">
                3
              </span>
              <span className="font-sans text-body text-ff-gray-text pt-0.5">
                Wähle einen Workshop und lege ihn in deinen Warenkorb
              </span>
            </li>
            <li className="flex gap-3">
              <span className="inline-block w-6 h-6 rounded-full bg-ff-gold-accent text-white text-center text-body-sm font-bold shrink-0">
                4
              </span>
              <span className="font-sans text-body text-ff-gray-text pt-0.5">
                Beim Checkout: Gib deinen Code ein – die Gebühr wird direkt abgezogen
              </span>
            </li>
          </ol>
        </div>

        {/* PDF Download */}
        <button
          onClick={handleDownloadPDF}
          disabled={pdfLoading}
          className="w-full rounded-full bg-ff-gold-accent px-8 py-4 font-display text-body-lg font-bold text-ff-near-black shadow-md transition-all duration-200 hover:bg-ff-gold-accent-dark hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed mb-3 flex items-center justify-center gap-2"
        >
          {pdfLoading ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-ff-near-black border-t-transparent rounded-full" />
              Wird heruntergeladen...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="inline-block">
                <path
                  d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"
                  fill="currentColor"
                />
              </svg>
              Gutschein als PDF herunterladen
            </>
          )}
        </button>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-block rounded-full bg-ff-gold-accent px-8 py-3 font-display text-body font-bold text-ff-near-black transition-all hover:bg-ff-gold-accent-dark"
          >
            Zur Startseite
          </Link>
          <Link
            href="/workshops/voucher"
            className="inline-block rounded-full border-2 border-ff-border-light px-8 py-3 font-display text-body font-bold text-ff-near-black transition-all hover:border-ff-gold-accent/50"
          >
            Weiteren Gutschein kaufen
          </Link>
        </div>
      </div>
    </div>
  )
}

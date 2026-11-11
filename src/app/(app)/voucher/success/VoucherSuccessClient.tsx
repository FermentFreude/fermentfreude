'use client'

import { CalendarCheck, Download, Gift, Mail, ShoppingBag, Store } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { useLocale } from '@/providers/Locale'

/* ═══════════════════════════════════════════════════════════════
 *  VOUCHER CONFIRMATION — shown right after a voucher was paid.
 *  Editorial copy (short sentences, no hyphens or dashes), one black
 *  card with the code and the three downloads, type scales with the screen.
 * ═══════════════════════════════════════════════════════════════ */

const SUCCESS_DE = {
  loading: 'Dein Gutschein wird erstellt',
  errorTitle: 'Das hat nicht geklappt',
  eyebrow: 'Zahlung erfolgreich',
  headline: 'Dein Gutschein ist da.',
  subline: 'Vielen Dank. Ein Workshop voller Geschmack wartet auf die beschenkte Person.',
  codeLabel: 'Dein Gutscheincode',
  valueWorkshop: 'Ein Workshop nach Wahl für eine Person',
  valueAmount: (value: number) => `Wertgutschein über ${value} €`,
  copyCode: 'Code kopieren',
  codeCopied: 'Code kopiert',
  copyToast: 'Code kopiert',
  downloading: 'Wird geladen',
  downloadPDF: 'Gutschein als PDF herunterladen',
  cardButton: 'Grußkarte herunterladen',
  mailTitle: 'Dein Gutschein liegt in deinem Postfach',
  mailText:
    'Wir haben ihn dir mit dem PDF per Mail geschickt. Schau bei Bedarf auch im Spamordner nach.',
  mailTo: (email: string) => `Gesendet an ${email}.`,
  mailFailed:
    'Deine Zahlung war erfolgreich und dein Gutschein ist gültig. Beim Versand der Mail gab es ein kurzes Problem. Unser Team wurde informiert und meldet sich bei dir. Deinen Code kannst du oben schon kopieren oder als PDF laden.',
  pickupTitle: 'Zur Abholung bereit',
  pickupText:
    'Grabenstraße 15, 8010 Graz. Wir schreiben dir, sobald der Gutschein abholbereit ist.',
  stepsTitle: 'So löst du ihn ein',
  stepA: 'Workshop und Termin wählen',
  stepAText: 'Alle Termine findest du auf fermentfreude.at/workshops.',
  stepB: 'In den Warenkorb legen',
  stepBText: 'Der Workshop kommt ganz normal in den Warenkorb.',
  stepC: 'Beim Bezahlen den Code eingeben',
  stepCText: 'Der Betrag wird sofort abgezogen.',
  bookWorkshop: 'Workshop buchen',
  buyAnother: 'Weiteren Gutschein kaufen',
  backHome: 'Zur Startseite',
  backVoucher: 'Zurück zum Gutschein',
  pdfSuccess: 'PDF heruntergeladen',
  pdfDownloadError: 'Der Download hat nicht geklappt.',
  confirmError: 'Die Bestätigung hat nicht geklappt.',
  connectionError: 'Keine Verbindung. Bitte lade die Seite neu.',
  noSessionId: 'Es wurde keine Zahlung gefunden.',
}

const SUCCESS_EN: typeof SUCCESS_DE = {
  loading: 'Creating your voucher',
  errorTitle: 'Something went wrong',
  eyebrow: 'Payment successful',
  headline: 'Your voucher is here.',
  subline: 'Thank you. A workshop full of flavour is waiting for whoever receives it.',
  codeLabel: 'Your voucher code',
  valueWorkshop: 'One workshop of your choice for one person',
  valueAmount: (value: number) => `Gift voucher worth €${value}`,
  copyCode: 'Copy code',
  codeCopied: 'Code copied',
  copyToast: 'Code copied',
  downloading: 'Loading',
  downloadPDF: 'Download voucher as PDF',
  cardButton: 'Download greeting card',
  mailTitle: 'Your voucher is in your inbox',
  mailText:
    'We emailed it to you with the PDF. If you cannot see it, please check your spam folder.',
  mailTo: (email: string) => `Sent to ${email}.`,
  mailFailed:
    'Your payment was successful and your voucher is valid. We had a short problem sending the email. Our team has been told and will get in touch. You can already copy your code above or download it as a PDF.',
  pickupTitle: 'Ready for pickup',
  pickupText: 'Grabenstraße 15, 8010 Graz. We will write to you as soon as the voucher is ready.',
  stepsTitle: 'How to redeem it',
  stepA: 'Choose a workshop and date',
  stepAText: 'You can find all dates at fermentfreude.at/workshops.',
  stepB: 'Add it to the cart',
  stepBText: 'The workshop goes into the cart like any other.',
  stepC: 'Enter the code at checkout',
  stepCText: 'The amount is deducted straight away.',
  bookWorkshop: 'Book a workshop',
  buyAnother: 'Buy another voucher',
  backHome: 'Back to home',
  backVoucher: 'Back to the voucher',
  pdfSuccess: 'PDF downloaded',
  pdfDownloadError: 'The download did not work.',
  confirmError: 'We could not confirm the voucher.',
  connectionError: 'No connection. Please reload the page.',
  noSessionId: 'No payment was found.',
}

type VoucherResult = {
  code: string
  value: number
  deliveryMethod: string
  recipientEmail: string | null
  emailWarning?: boolean
}

const LABEL = 'font-display text-[11px] font-bold uppercase tracking-[0.2em]'
const BTN_BASE =
  'inline-flex min-h-14 w-full items-center justify-center gap-2.5 rounded-full px-7 py-4 text-center font-display text-[15px] font-bold transition-colors sm:text-base'
const BTN_LIGHT = `${BTN_BASE} border-2 border-white/35 text-white hover:bg-white hover:text-ff-near-black`
const BTN_GOLD = `${BTN_BASE} bg-ff-gold text-ff-near-black hover:bg-ff-gold-accent-dark disabled:cursor-not-allowed disabled:opacity-60`
const BTN_OUTLINE = `${BTN_BASE} border-2 border-ff-near-black text-ff-near-black hover:bg-ff-near-black hover:text-white sm:w-auto`

export function VoucherSuccessClient() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const paymentIntent = searchParams.get('payment_intent')

  const { locale } = useLocale()
  const t = locale === 'de' ? SUCCESS_DE : SUCCESS_EN

  const [voucher, setVoucher] = useState<VoucherResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const confirming = useRef(false)

  const confirmVoucher = useCallback(
    async (sid: string | null, pi: string | null) => {
      try {
        const params = new URLSearchParams()
        if (sid) params.set('session_id', sid)
        if (pi) params.set('payment_intent', pi)

        const res = await fetch(`/api/voucher/confirm?${params.toString()}`)
        const data = await res.json()

        if (!res.ok || !data.success) {
          setError(data.error || t.confirmError)
          return
        }

        setVoucher(data.voucher)
      } catch (_err) {
        setError(t.connectionError)
      } finally {
        setLoading(false)
      }
    },
    [t.confirmError, t.connectionError],
  )

  const handleDownloadPDF = useCallback(async () => {
    if (!voucher?.code) return

    setPdfLoading(true)
    try {
      const res = await fetch(`/api/voucher/generate-pdf?code=${encodeURIComponent(voucher.code)}`)
      if (!res.ok) throw new Error('PDF request failed')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `gutschein-${voucher.code}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success(t.pdfSuccess)
    } catch (_err) {
      toast.error(t.pdfDownloadError)
    } finally {
      setPdfLoading(false)
    }
  }, [voucher?.code, t.pdfSuccess, t.pdfDownloadError])

  const handleCopyCode = useCallback(() => {
    if (!voucher?.code) return
    navigator.clipboard.writeText(voucher.code)
    setCodeCopied(true)
    toast.success(t.copyToast)
    setTimeout(() => setCodeCopied(false), 2000)
  }, [voucher?.code, t.copyToast])

  useEffect(() => {
    if (!sessionId && !paymentIntent) {
      setError(t.noSessionId)
      setLoading(false)
      return
    }

    if (!confirming.current) {
      confirming.current = true
      confirmVoucher(sessionId, paymentIntent)
    }
  }, [sessionId, paymentIntent, confirmVoucher, t.noSessionId])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 size-8 animate-spin rounded-full border-4 border-ff-gold-accent border-t-transparent" />
          <p className="font-sans text-base text-ff-gray-text">{t.loading}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white px-6">
        <div className="max-w-md text-center">
          <h1 className="mb-3 font-display text-[clamp(1.75rem,5vw,2.5rem)] font-bold tracking-tight text-ff-near-black">
            {t.errorTitle}
          </h1>
          <p className="mb-8 font-sans text-base text-ff-gray-text sm:text-lg">{error}</p>
          <Link href="/workshops/voucher" className={BTN_OUTLINE}>
            {t.backVoucher}
          </Link>
        </div>
      </div>
    )
  }

  if (!voucher) return null

  const isPickup = voucher.deliveryMethod === 'pickup'
  const valueLine = voucher.value === 99 ? t.valueWorkshop : t.valueAmount(voucher.value)
  const cardFile = locale === 'de' ? '/gutschein-karte.pdf' : '/greeting-card.pdf'
  const steps = [
    { icon: CalendarCheck, title: t.stepA, text: t.stepAText },
    { icon: ShoppingBag, title: t.stepB, text: t.stepBText },
    { icon: Gift, title: t.stepC, text: t.stepCText },
  ]

  return (
    <div className="bg-white px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-4xl space-y-16 sm:space-y-24 [&_h1]:mb-0 [&_h2]:mb-0 [&_h3]:mb-0 [&_p]:mb-0">
        {/* Headline */}
        <header className="text-center">
          <p className={`${LABEL} text-ff-near-black`}>{t.eyebrow}</p>
          <h1 className="mx-auto mt-5 max-w-3xl text-balance font-display text-[clamp(2.25rem,6.5vw,4.75rem)] font-bold leading-[0.97] tracking-[-0.04em] text-ff-near-black">
            {t.headline}
          </h1>
          <p className="mx-auto mt-5 max-w-lg text-pretty text-[clamp(1rem,1.7vw,1.25rem)] leading-relaxed text-ff-gray-text">
            {t.subline}
          </p>
        </header>

        {/* The code: one black card, the three downloads stacked */}
        <div className="mx-auto w-full max-w-2xl rounded-[32px] bg-ff-near-black px-6 py-12 text-center text-white ring-1 ring-white/10 sm:px-14 sm:py-16">
          <p className={`${LABEL} text-white/55`}>{t.codeLabel}</p>
          <span className="mx-auto mt-6 block h-px w-12 bg-ff-gold" aria-hidden="true" />
          <p className="mt-8 select-all whitespace-nowrap font-display text-[clamp(1.1rem,5.4vw,2.75rem)] font-bold leading-none tracking-[0.04em]">
            {voucher.code}
          </p>
          <p className="mx-auto mt-5 max-w-sm text-pretty text-[clamp(0.95rem,1.6vw,1.125rem)] leading-snug text-white/65">
            {valueLine}
          </p>

          <div className="mx-auto mt-12 flex w-full max-w-sm flex-col gap-3">
            <button type="button" onClick={handleCopyCode} className={BTN_LIGHT}>
              {codeCopied ? t.codeCopied : t.copyCode}
            </button>
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className={BTN_GOLD}
            >
              {pdfLoading ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-ff-near-black border-t-transparent" />
                  {t.downloading}
                </>
              ) : (
                <>
                  <Download className="size-5" aria-hidden="true" />
                  {t.downloadPDF}
                </>
              )}
            </button>
            <a href={cardFile} download className={BTN_LIGHT}>
              <Download className="size-5" aria-hidden="true" />
              {t.cardButton}
            </a>
          </div>
        </div>

        {/* Mail failed to send: only then */}
        {voucher.emailWarning && (
          <div className="mx-auto max-w-2xl rounded-[22px] border border-amber-200 bg-amber-50 p-6 sm:p-8">
            <p className="text-base leading-relaxed text-amber-900">{t.mailFailed}</p>
          </div>
        )}

        {/* Delivery */}
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 text-center">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-ff-near-black">
            {isPickup ? (
              <Store className="size-6 text-white" aria-hidden="true" />
            ) : (
              <Mail className="size-6 text-white" aria-hidden="true" />
            )}
          </span>
          <div>
            <p className="font-display text-[clamp(1.25rem,2.4vw,1.625rem)] font-bold leading-tight tracking-tight text-ff-near-black">
              {isPickup ? t.pickupTitle : t.mailTitle}
            </p>
            <p className="mt-2 text-[clamp(0.95rem,1.5vw,1.0625rem)] leading-relaxed text-ff-gray-text">
              {isPickup
                ? t.pickupText
                : `${voucher.recipientEmail ? `${t.mailTo(voucher.recipientEmail)} ` : ''}${t.mailText}`}
            </p>
          </div>
        </div>

        {/* How to redeem */}
        <section>
          <h2 className="text-center font-display text-[clamp(1.75rem,4vw,2.75rem)] font-bold leading-none tracking-[-0.03em] text-ff-near-black">
            {t.stepsTitle}
          </h2>
          <ol className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {steps.map((step) => (
              <li key={step.title} className="flex flex-col items-center text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-ff-near-black">
                  <step.icon className="size-6 text-white" aria-hidden="true" />
                </span>
                <h3 className="mt-5 font-display text-[clamp(1.125rem,2vw,1.375rem)] font-bold leading-snug tracking-tight text-ff-near-black">
                  {step.title}
                </h3>
                <p className="mt-2 text-[clamp(0.95rem,1.4vw,1.0625rem)] leading-relaxed text-ff-gray-text">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Next */}
        <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row">
          <Link href="/workshops" className={BTN_OUTLINE}>
            {t.bookWorkshop}
          </Link>
          <Link href="/workshops/voucher" className={BTN_OUTLINE}>
            {t.buyAnother}
          </Link>
          <Link href="/" className={BTN_OUTLINE}>
            {t.backHome}
          </Link>
        </div>
      </div>
    </div>
  )
}

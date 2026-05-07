'use client'

import { useLocale } from '@/providers/Locale'
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useCallback, useEffect, useState } from 'react'

const stripePromise = loadStripe(`${process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}`)

const CHECKOUT_DE = {
  title: 'Zahlung',
  subtitle: 'Bezahle deinen Geschenkgutschein sicher mit Karte.',
  summary: 'Zusammenfassung',
  voucherLabel: 'Workshop-Erlebnis Gutschein',
  delivery: 'Zustellung',
  deliveryEmail: 'Per E-Mail',
  deliveryPickup: 'Abholung',
  deliveryEmailRecipient: 'Direkt an Empfänger:in',
  deliveryEmailSelf: 'An mich (zum Weiterleiten)',
  deliveryPdf: 'PDF zum Ausdrucken',
  to: 'An',
  recipientLabel: 'Empfänger:in',
  personalNoteLabel: 'Persönliche Notiz',
  payNow: 'Jetzt bezahlen',
  processing: 'Wird verarbeitet…',
  backToVoucher: 'Zurück zum Gutschein',
  sessionExpired: 'Sitzung abgelaufen. Bitte beginne von vorne.',
  paymentError: 'Zahlung fehlgeschlagen. Bitte versuche es erneut.',
  securedByStripe: 'Sicher bezahlen mit Stripe',
  loading: 'Wird geladen…',
}

const CHECKOUT_EN = {
  title: 'Payment',
  subtitle: 'Pay for your gift voucher securely by card.',
  summary: 'Summary',
  voucherLabel: 'Workshop Experience Voucher',
  delivery: 'Delivery',
  deliveryEmail: 'By Email',
  deliveryPickup: 'Pickup',
  deliveryEmailRecipient: 'Direct to recipient',
  deliveryEmailSelf: 'To me (forward later)',
  deliveryPdf: 'PDF to print',
  to: 'To',
  recipientLabel: 'Recipient',
  personalNoteLabel: 'Personal note',
  payNow: 'Pay now',
  processing: 'Processing…',
  backToVoucher: 'Back to voucher',
  sessionExpired: 'Session expired. Please start over.',
  paymentError: 'Payment failed. Please try again.',
  securedByStripe: 'Secured by Stripe',
  loading: 'Loading…',
}

interface VoucherSession {
  clientSecret: string
  amount: number
  deliveryMethod: 'email-recipient' | 'email-self' | 'pdf' | 'email' | 'pickup'
  purchaserEmail: string
  recipientName?: string
  recipientEmail?: string
  personalNote?: string
}

function deliveryLabel(method: VoucherSession['deliveryMethod'], t: typeof CHECKOUT_DE) {
  switch (method) {
    case 'email-recipient':
      return t.deliveryEmailRecipient
    case 'email-self':
      return t.deliveryEmailSelf
    case 'pdf':
      return t.deliveryPdf
    case 'pickup':
      return t.deliveryPickup
    case 'email':
    default:
      return t.deliveryEmail
  }
}

// ─── Inner form (rendered inside <Elements>) ─────────────────────────────────

function CheckoutForm({ session, t }: { session: VoucherSession; t: typeof CHECKOUT_DE }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      if (!stripe || !elements) return
      setIsSubmitting(true)
      setErrorMessage(null)

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
        confirmParams: { return_url: `${window.location.origin}/voucher/success` },
      })

      if (error) {
        setErrorMessage(error.message ?? t.paymentError)
        setIsSubmitting(false)
        return
      }

      if (paymentIntent?.status === 'succeeded') {
        sessionStorage.removeItem('voucherCheckout')
        router.push(`/voucher/success?payment_intent=${paymentIntent.id}`)
      } else {
        setErrorMessage(t.paymentError)
        setIsSubmitting(false)
      }
    },
    [stripe, elements, router, t.paymentError],
  )

  const showsRecipient =
    session.deliveryMethod === 'email-recipient' || session.deliveryMethod === 'email'
  const recipientDisplay =
    showsRecipient && session.recipientEmail ? session.recipientEmail : session.purchaserEmail
  const recipientNameDisplay = session.recipientName?.trim() || ''

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Order summary */}
      <div className="rounded-2xl border border-ff-border-light bg-ff-cream p-4 md:p-5">
        <p className="font-display text-caption font-bold uppercase tracking-widest text-ff-near-black mb-3">
          {t.summary}
        </p>
        <div className="flex justify-between items-baseline">
          <span className="font-sans text-body text-ff-near-black">{t.voucherLabel}</span>
          <span className="font-display text-body-lg font-bold text-ff-near-black">
            €{session.amount},00
          </span>
        </div>
        <div className="mt-2 flex flex-col gap-0.5">
          <span className="font-sans text-body-sm text-ff-gray-text">
            {t.delivery}: {deliveryLabel(session.deliveryMethod, t)}
          </span>
          {recipientNameDisplay && (
            <span className="font-sans text-body-sm text-ff-gray-text">
              {t.recipientLabel}: {recipientNameDisplay}
            </span>
          )}
          {showsRecipient && (
            <span className="font-sans text-body-sm text-ff-gray-text">
              {t.to}: {recipientDisplay}
            </span>
          )}
          {session.personalNote && (
            <span className="font-sans text-body-sm text-ff-gray-text italic">
              “{session.personalNote.length > 80 ? session.personalNote.slice(0, 77) + '…' : session.personalNote}”
            </span>
          )}
        </div>
      </div>

      {/* Stripe PaymentElement */}
      <div className="rounded-2xl border border-ff-border-light bg-white p-4 md:p-5">
        <PaymentElement />
      </div>

      {errorMessage && (
        <p className="font-sans text-body-sm text-red-600 text-center">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={!stripe || isSubmitting}
        className="w-full rounded-full bg-ff-gold-accent px-6 py-3 md:py-4 font-display text-base md:text-body-lg font-bold text-ff-near-black shadow-md transition-all duration-200 hover:bg-ff-gold-accent-dark hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? t.processing : `${t.payNow} €${session.amount},00`}
      </button>

      <div className="flex items-center justify-center gap-1.5 mt-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-3.5 h-3.5 text-ff-gray-text opacity-60"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
            clipRule="evenodd"
          />
        </svg>
        <span className="font-sans text-body-sm text-ff-gray-text opacity-70">
          {t.securedByStripe}
        </span>
      </div>
    </form>
  )
}

// ─── Outer wrapper (reads sessionStorage, mounts Elements) ───────────────────

export function VoucherCheckoutClient() {
  const { locale } = useLocale()
  const t = locale === 'de' ? CHECKOUT_DE : CHECKOUT_EN
  const router = useRouter()

  const [session, setSession] = useState<VoucherSession | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('voucherCheckout')
      if (!raw) {
        router.replace('/workshops/voucher')
        return
      }
      const parsed: VoucherSession = JSON.parse(raw)
      if (!parsed.clientSecret) {
        router.replace('/workshops/voucher')
        return
      }
      setSession(parsed)
    } catch {
      router.replace('/workshops/voucher')
    } finally {
      setReady(true)
    }
  }, [router])

  if (!ready) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-ff-gold-accent border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!session) return null

  return (
    <section className="w-full bg-white min-h-screen py-10 md:py-16">
      <div className="mx-auto max-w-lg px-(--space-container-x)">
        <div className="mb-8">
          <h1 className="font-display text-[clamp(1.75rem,5vw,2.25rem)] font-bold text-ff-near-black leading-tight tracking-tight">
            {t.title}
          </h1>
          <p className="mt-2 font-sans text-body text-ff-gray-text">{t.subtitle}</p>
        </div>

        <Elements
          stripe={stripePromise}
          options={{
            clientSecret: session.clientSecret,
            appearance: {
              theme: 'stripe',
              variables: {
                colorPrimary: '#E5B765',
                fontFamily: 'var(--font-sans)',
                borderRadius: '8px',
              },
            },
          }}
        >
          <CheckoutForm session={session} t={t} />
        </Elements>

        <div className="mt-6 text-center">
          <Link
            href="/workshops/voucher"
            className="font-sans text-body-sm text-ff-gray-text underline underline-offset-2 hover:text-ff-near-black transition-colors"
          >
            {t.backToVoucher}
          </Link>
        </div>
      </div>
    </section>
  )
}

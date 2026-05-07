'use client'

import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import { useLocale } from '@/providers/Locale'
import { useRouter } from 'next/navigation'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'

const HERO_DE = {
  nameRequired: 'Bitte gib deinen Namen ein.',
  emailRequired: 'Bitte gib deine E-Mail-Adresse ein.',
  invalidEmail: 'Ungültiges E-Mail-Format.',
  invalidRecipientEmail: 'Ungültiges E-Mail-Format für Empfänger.',
  recipientEmailRequired: 'Bitte gib die E-Mail des Empfängers ein.',
  checkoutError: 'Fehler beim Checkout.',
  checkoutErrorLater: 'Fehler beim Checkout. Bitte versuche es später.',
  yourName: 'Dein Name *',
  yourNamePlaceholder: 'Vor- und Nachname',
  yourEmail: 'Deine E-Mail-Adresse *',
  recipientNameLabel: 'Name des Empfängers',
  recipientNamePlaceholder: 'Vor- und Nachname',
  recipientEmailLabel: 'E-Mail des Empfängers *',
  recipientEmailHint: 'Wir senden den Gutschein direkt an diese Adresse.',
  personalNoteLabel: 'Persönliche Notiz (optional)',
  personalNotePlaceholder: 'Eine persönliche Botschaft für den Empfänger…',
  personalNoteCounter: (n: number) => `${n}/500 Zeichen`,
  cardForLabel: 'Für',
  processing: 'Wird bearbeitet…',
}

const HERO_EN = {
  nameRequired: 'Please enter your name.',
  emailRequired: 'Please enter your email address.',
  invalidEmail: 'Invalid email format.',
  invalidRecipientEmail: 'Invalid email format for recipient.',
  recipientEmailRequired: "Please enter the recipient's email.",
  checkoutError: 'Checkout error.',
  checkoutErrorLater: 'Checkout error. Please try again later.',
  yourName: 'Your name *',
  yourNamePlaceholder: 'First and last name',
  yourEmail: 'Your email address *',
  recipientNameLabel: "Recipient's name",
  recipientNamePlaceholder: 'First and last name',
  recipientEmailLabel: "Recipient's email *",
  recipientEmailHint: 'We will send the voucher directly to this address.',
  personalNoteLabel: 'Personal note (optional)',
  personalNotePlaceholder: 'A personal message for the recipient…',
  personalNoteCounter: (n: number) => `${n}/500 characters`,
  cardForLabel: 'For',
  processing: 'Processing…',
}

interface VoucherHeroProps {
  heading: string
  description: string
  amounts: string[]
  deliveryOptions: Array<{ type: string; title: string; icon: string }>
  deliveryDisclaimer?: string | null
  pickupAddress?: string | null
  cardLogo?: MediaType | string | null
  cardLabel: string
  valueLabel: string
  cardDisclaimer: string
  amountSectionLabel: string
  deliverySectionLabel: string
  addToCartButton: string
  showAmounts?: boolean
  showDeliveryOptions?: boolean
  showCTA?: boolean
}

export function VoucherHero({
  heading,
  description,
  amounts,
  deliveryOptions,
  deliveryDisclaimer,
  pickupAddress,
  cardLogo,
  cardLabel,
  valueLabel,
  cardDisclaimer,
  amountSectionLabel,
  deliverySectionLabel,
  addToCartButton,
  showAmounts = true,
  showDeliveryOptions = true,
  showCTA = true,
}: VoucherHeroProps) {
  const router = useRouter()

  const { locale } = useLocale()
  const t = locale === 'de' ? HERO_DE : HERO_EN

  // Show only the new tri-option set; legacy values (email/pickup) hidden but supported.
  const visibleDeliveryOptions = deliveryOptions.filter(
    (o) => o.type === 'email-recipient' || o.type === 'email-self' || o.type === 'pdf',
  )
  const [selectedAmount, setSelectedAmount] = useState(amounts[0] ?? '50€')
  const [selectedDelivery, setSelectedDelivery] = useState(
    visibleDeliveryOptions[0]?.type ?? 'email-self',
  )
  const [purchaserName, setPurchaserName] = useState('')
  const [purchaserEmail, setPurchaserEmail] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [recipientEmail, setRecipientEmail] = useState('')
  const [personalNote, setPersonalNote] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Format amount for display (e.g., "50€" -> "€50,00")
  const formatAmount = (amount: string) => {
    const num = amount.replace('€', '')
    return `€${num},00`
  }

  // Parse amount from string (e.g., "99€" -> 99)
  const parseAmount = (amountStr: string): number => {
    const num = parseInt(amountStr.replace('€', ''))
    return isNaN(num) ? 0 : num
  }

  // Handle checkout
  const handleCheckout = useCallback(async () => {
    // Validate name + emails
    if (!purchaserName.trim()) {
      toast.error(t.nameRequired)
      return
    }

    if (!purchaserEmail.trim()) {
      toast.error(t.emailRequired)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(purchaserEmail)) {
      toast.error(t.invalidEmail)
      return
    }

    if (selectedDelivery === 'email-recipient') {
      if (!recipientEmail.trim()) {
        toast.error(t.recipientEmailRequired)
        return
      }
      if (!emailRegex.test(recipientEmail)) {
        toast.error(t.invalidRecipientEmail)
        return
      }
    } else if (recipientEmail && !emailRegex.test(recipientEmail)) {
      toast.error(t.invalidRecipientEmail)
      return
    }

    setIsLoading(true)

    const sendRecipientEmail =
      selectedDelivery === 'email-recipient' && recipientEmail.trim()
        ? recipientEmail.trim()
        : undefined
    const sendRecipientName = recipientName.trim() || undefined
    const sendPersonalNote = personalNote.trim() || undefined

    try {
      const response = await fetch('/api/voucher/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseAmount(selectedAmount),
          deliveryMethod: selectedDelivery,
          purchaserName: purchaserName.trim(),
          purchaserEmail: purchaserEmail.trim(),
          recipientName: sendRecipientName,
          recipientEmail: sendRecipientEmail,
          personalNote: sendPersonalNote,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        toast.error(data.error || t.checkoutError)
        return
      }

      if (data.clientSecret) {
        sessionStorage.setItem(
          'voucherCheckout',
          JSON.stringify({
            clientSecret: data.clientSecret,
            amount: parseAmount(selectedAmount),
            deliveryMethod: selectedDelivery,
            purchaserName: purchaserName.trim(),
            purchaserEmail: purchaserEmail.trim(),
            recipientName: sendRecipientName,
            recipientEmail: sendRecipientEmail,
            personalNote: sendPersonalNote,
          }),
        )
        router.push('/voucher/checkout')
      } else if (data.sessionUrl) {
        router.push(data.sessionUrl)
      }
    } catch (err) {
      console.error('Checkout error:', err)
      toast.error(t.checkoutErrorLater)
    } finally {
      setIsLoading(false)
    }
  }, [
    purchaserName,
    purchaserEmail,
    recipientName,
    recipientEmail,
    personalNote,
    selectedAmount,
    selectedDelivery,
    router,
    t.checkoutError,
    t.checkoutErrorLater,
    t.emailRequired,
    t.invalidEmail,
    t.invalidRecipientEmail,
    t.nameRequired,
    t.recipientEmailRequired,
  ])

  const iconColor = (opt: (typeof visibleDeliveryOptions)[0]) =>
    selectedDelivery === opt.type ? '#FFFFFF' : undefined

  return (
    <section className="w-full bg-white py-6 md:py-8">
      <div className="mx-auto max-w-(--content-full) px-(--space-container-x)">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-start">
          {/* Left Column - Voucher Preview Card */}
          <div className="order-1 lg:order-1">
            <div className="sticky top-4 rounded-2xl border border-ff-border-light/80 bg-[radial-gradient(circle_at_top,#F8F2E6,#FFFFFF)] p-5 md:p-7 shadow-[0_18px_45px_rgba(0,0,0,0.07)] transition-shadow duration-300 hover:shadow-[0_30px_80px_rgba(229,183,101,0.22)]">
              {/* Gift Icon */}
              <div className="absolute top-7 right-7">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ff-gold-accent/12 shadow-[0_6px_18px_rgba(229,183,101,0.35)] backdrop-blur-[2px]">
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                    className="text-ff-gold-accent"
                  >
                    <path
                      d="M20 6H17.82C17.93 5.69 18 5.35 18 5C18 3.34 16.66 2 15 2C13.95 2 13.04 2.54 12.5 3.35L12 4.02L11.5 3.34C10.96 2.54 10.05 2 9 2C7.34 2 6 3.34 6 5C6 5.35 6.07 5.69 6.18 6H4C2.89 6 2.01 6.89 2.01 8L2 19C2 20.11 2.89 21 4 21H20C21.11 21 22 20.11 22 19V8C22 6.89 21.11 6 20 6ZM15 4C15.55 4 16 4.45 16 5C16 5.55 15.55 6 15 6C14.45 6 14 5.55 14 5C14 4.45 14.45 4 15 4ZM9 4C9.55 4 10 4.45 10 5C10 5.55 9.55 6 9 6C8.45 6 8 5.55 8 5C8 4.45 8.45 4 9 4ZM20 19H4V17H20V19ZM20 15H4V8H7.08C7.03 8.16 7 8.33 7 8.5C7 9.33 7.67 10 8.5 10C9.33 10 10 9.33 10 8.5C10 8.33 9.97 8.16 9.92 8H14.08C14.03 8.16 14 8.33 14 8.5C14 9.33 14.67 10 15.5 10C16.33 10 17 9.33 17 8.5C17 8.33 16.97 8.16 16.92 8H20V15Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>

              <p className="font-display text-caption font-semibold uppercase tracking-[0.14em] text-ff-gray-text mb-5">
                {cardLabel}
              </p>

              <div className="flex justify-center mb-6">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center p-2.5 bg-[radial-gradient(circle_at_top,#3B342A,#121212)] shadow-[0_16px_40px_rgba(0,0,0,0.45)] ring-1 ring-ff-gold-accent/55">
                  {cardLogo ? (
                    <Media
                      resource={cardLogo}
                      width={64}
                      height={64}
                      imgClassName="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-ff-warm-gray rounded-lg" />
                  )}
                </div>
              </div>

              <div className="text-center">
                <p className="font-sans text-body-sm font-medium text-ff-gray-text mb-2">
                  {valueLabel}
                </p>
                <p className="font-display text-[clamp(2.5rem,4vw,3.2rem)] font-bold text-ff-near-black tracking-tight">
                  {formatAmount(selectedAmount)}
                </p>
              </div>

              <p className="font-sans text-body-sm text-ff-gray-text/90 text-center mt-5 leading-relaxed">
                {cardDisclaimer}
              </p>

              {(recipientName.trim() || personalNote.trim()) && (
                <div className="mt-5 pt-5 border-t border-ff-border-light/60">
                  {recipientName.trim() && (
                    <p className="font-display text-body-sm font-semibold text-ff-near-black text-center">
                      {t.cardForLabel}{' '}
                      <span className="text-ff-gold-accent">{recipientName.trim()}</span>
                    </p>
                  )}
                  {personalNote.trim() && (
                    <p className="font-sans text-body-sm italic text-ff-gray-text text-center mt-2 leading-snug">
                      “
                      {personalNote.trim().length > 140
                        ? personalNote.trim().slice(0, 137) + '…'
                        : personalNote.trim()}
                      ”
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Voucher Configuration */}
          <div className="order-2 lg:order-2">
            <div className="flex flex-col gap-4 md:gap-5">
              <div className="pb-4 md:pb-6 border-b border-ff-border-light min-w-0 max-w-full">
                <h1 className="font-display text-[clamp(1.75rem,5vw,2.25rem)] font-bold text-ff-near-black leading-tight tracking-tight max-w-full wrap-break-word hyphens-auto">
                  {heading}
                </h1>
                <p className="font-sans text-body-sm md:text-body-lg text-ff-gray-text leading-relaxed mt-2 md:mt-3">
                  {description.includes('\n')
                    ? description.split('\n').map((line, i) => (
                        <span key={i}>
                          {line}
                          {i < description.split('\n').length - 1 && <br />}
                        </span>
                      ))
                    : description.includes('. ')
                      ? (() => {
                          const i = description.indexOf('. ')
                          return (
                            <>
                              {description.slice(0, i + 1)}
                              <br />
                              {description.slice(i + 2)}
                            </>
                          )
                        })()
                      : description}
                </p>
              </div>

              {/* Amount Selection */}
              {showAmounts && (
                <div className="rounded-2xl border border-ff-border-light bg-ff-cream p-4 md:p-5">
                  <label className="font-display text-caption font-bold uppercase tracking-widest text-ff-near-black block mb-3">
                    {amountSectionLabel}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {amounts.map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setSelectedAmount(amount)}
                        className={`px-5 py-2.5 rounded-full font-display text-body font-semibold transition-all duration-200 ${
                          selectedAmount === amount
                            ? 'bg-ff-gold-accent text-ff-near-black shadow-sm'
                            : 'bg-white border border-ff-border-light text-ff-near-black hover:border-ff-gold-accent/50 hover:bg-ff-ivory-mist/50'
                        }`}
                      >
                        {amount}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery Options */}
              {showDeliveryOptions && (
                <div className="rounded-2xl border border-ff-border-light bg-ff-cream p-4 md:p-5">
                  <label className="font-display text-caption font-bold uppercase tracking-widest text-ff-near-black block mb-3">
                    {deliverySectionLabel}
                  </label>
                  <div className="flex flex-col gap-3">
                    {visibleDeliveryOptions.map((option) => (
                      <button
                        key={option.type}
                        onClick={() => setSelectedDelivery(option.type)}
                        className={`flex items-start gap-4 w-full text-left rounded-xl px-5 py-4 transition-all duration-200 border-2 ${
                          selectedDelivery === option.type
                            ? 'bg-ff-ivory-mist border-ff-gold-accent shadow-sm'
                            : 'bg-white border-ff-border-light hover:bg-ff-ivory-mist/40 hover:border-ff-border-light'
                        }`}
                      >
                        <div
                          className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200 ${
                            selectedDelivery === option.type
                              ? 'bg-ff-gold-accent'
                              : 'bg-ff-warm-gray'
                          }`}
                        >
                          {option.icon === 'email' ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path
                                d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
                                fill={selectedDelivery === option.type ? '#fff' : '#6b6b6b'}
                              />
                            </svg>
                          ) : option.icon === 'pickup' ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path
                                d="M19 7V4H5V7H2V20H8V14H16V20H22V7H19ZM6 18H4V9H6V18ZM20 18H18V14H20V18ZM18 12V9H16V12H18Z"
                                fill={selectedDelivery === option.type ? '#fff' : '#6b6b6b'}
                              />
                            </svg>
                          ) : option.icon === 'pdf' ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path
                                d="M14 2H6C4.9 2 4.01 2.9 4.01 4L4 20C4 21.1 4.89 22 5.99 22H18C19.1 22 20 21.1 20 20V8L14 2ZM6 20V4H13V9H18V20H6ZM8 13H16V15H8V13ZM8 17H13V19H8V17Z"
                                fill={selectedDelivery === option.type ? '#fff' : '#6b6b6b'}
                              />
                            </svg>
                          ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                              <path
                                d="M20 2H4C2.9 2 2 2.9 2 4V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V4C22 2.9 21.1 2 20 2ZM20 20H4V4H20V20Z"
                                fill={iconColor(option) ?? '#6b6b6b'}
                              />
                              <path
                                d="M6 6H18V8H6V6ZM6 10H18V12H6V10ZM6 14H16V16H6V14Z"
                                fill={iconColor(option) ?? '#6b6b6b'}
                              />
                            </svg>
                          )}
                        </div>
                        <span className="flex flex-1 min-w-0 flex-col items-start gap-1 pt-0.5">
                          <span
                            className={`font-sans text-body font-medium ${
                              selectedDelivery === option.type
                                ? 'text-ff-near-black'
                                : 'text-ff-gray-text'
                            }`}
                          >
                            {option.title}
                          </span>
                          {option.icon === 'pickup' && pickupAddress?.trim() && (
                            <span className="flex items-start gap-2 font-sans text-body-sm text-ff-gray-text leading-snug">
                              <svg
                                className="mt-0.5 shrink-0 text-ff-gray-text/80"
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden
                              >
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                              <span>{pickupAddress.trim().replace(/\s*\n\s*/g, ', ')}</span>
                            </span>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                  {deliveryDisclaimer && (
                    <p className="mt-4 pl-1 font-sans text-body-sm font-bold leading-relaxed text-ff-charcoal">
                      {deliveryDisclaimer}
                    </p>
                  )}
                </div>
              )}

              {/* Email Inputs */}
              {showCTA && (
                <div className="flex flex-col gap-3 md:gap-4 rounded-2xl border border-ff-border-light bg-ff-cream p-4 md:p-5">
                  <div>
                    <label className="font-sans text-caption font-bold text-ff-near-black block mb-1.5">
                      {t.yourName}
                    </label>
                    <input
                      type="text"
                      value={purchaserName}
                      onChange={(e) => setPurchaserName(e.target.value)}
                      placeholder={t.yourNamePlaceholder}
                      autoComplete="name"
                      className="w-full rounded-lg border border-ff-border-light bg-white px-3 py-2 md:py-3 font-sans text-sm md:text-body text-ff-near-black placeholder-ff-gray-text/50 focus:border-ff-gold-accent focus:outline-none transition-colors"
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <label className="font-sans text-caption font-bold text-ff-near-black block mb-1.5">
                      {t.yourEmail}
                    </label>
                    <input
                      type="email"
                      value={purchaserEmail}
                      onChange={(e) => setPurchaserEmail(e.target.value)}
                      placeholder="deine@email.de"
                      className="w-full rounded-lg border border-ff-border-light bg-white px-3 py-2 md:py-3 font-sans text-sm md:text-body text-ff-near-black placeholder-ff-gray-text/50 focus:border-ff-gold-accent focus:outline-none transition-colors"
                      disabled={isLoading}
                    />
                  </div>

                  {selectedDelivery === 'email-recipient' && (
                    <>
                      <div>
                        <label className="font-sans text-caption font-bold text-ff-near-black block mb-1.5">
                          {t.recipientNameLabel}
                        </label>
                        <input
                          type="text"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value.slice(0, 250))}
                          placeholder={t.recipientNamePlaceholder}
                          className="w-full rounded-lg border border-ff-border-light bg-white px-3 py-2 md:py-3 font-sans text-sm md:text-body text-ff-near-black placeholder-ff-gray-text/50 focus:border-ff-gold-accent focus:outline-none transition-colors"
                          disabled={isLoading}
                        />
                      </div>
                      <div>
                        <label className="font-sans text-caption font-bold text-ff-near-black block mb-1.5">
                          {t.recipientEmailLabel}
                        </label>
                        <input
                          type="email"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          placeholder="empfänger@email.de"
                          className="w-full rounded-lg border border-ff-border-light bg-white px-3 py-2 md:py-3 font-sans text-sm md:text-body text-ff-near-black placeholder-ff-gray-text/50 focus:border-ff-gold-accent focus:outline-none transition-colors"
                          disabled={isLoading}
                        />
                        <p className="mt-1.5 font-sans text-caption text-ff-gray-text">
                          {t.recipientEmailHint}
                        </p>
                      </div>
                    </>
                  )}

                  {selectedDelivery === 'pdf' && (
                    <div>
                      <label className="font-sans text-caption font-bold text-ff-near-black block mb-1.5">
                        {t.recipientNameLabel}
                      </label>
                      <input
                        type="text"
                        value={recipientName}
                        onChange={(e) => setRecipientName(e.target.value.slice(0, 250))}
                        placeholder={t.recipientNamePlaceholder}
                        className="w-full rounded-lg border border-ff-border-light bg-white px-3 py-2 md:py-3 font-sans text-sm md:text-body text-ff-near-black placeholder-ff-gray-text/50 focus:border-ff-gold-accent focus:outline-none transition-colors"
                        disabled={isLoading}
                      />
                    </div>
                  )}

                  <div>
                    <label className="font-sans text-caption font-bold text-ff-near-black block mb-1.5">
                      {t.personalNoteLabel}
                    </label>
                    <textarea
                      value={personalNote}
                      onChange={(e) => setPersonalNote(e.target.value.slice(0, 500))}
                      placeholder={t.personalNotePlaceholder}
                      rows={3}
                      maxLength={500}
                      className="w-full rounded-lg border border-ff-border-light bg-white px-3 py-2 md:py-3 font-sans text-sm md:text-body text-ff-near-black placeholder-ff-gray-text/50 focus:border-ff-gold-accent focus:outline-none transition-colors resize-none"
                      disabled={isLoading}
                    />
                    <p className="mt-1 text-right font-sans text-caption text-ff-gray-text">
                      {t.personalNoteCounter(personalNote.length)}
                    </p>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              {showCTA && (
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full rounded-full bg-ff-gold-accent px-6 py-3 md:py-4 font-display text-base md:text-body-lg font-bold text-ff-near-black shadow-md transition-all duration-200 hover:bg-ff-gold-accent-dark hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? t.processing : addToCartButton}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

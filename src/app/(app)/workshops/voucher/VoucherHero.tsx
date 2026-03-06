'use client'

import { useState } from 'react'
import type { Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'

interface VoucherHeroProps {
  heading: string
  description: string
  amounts: string[]
  deliveryOptions: Array<{ type: string; title: string; icon: string }>
  deliveryDisclaimer?: string | null
  cardLogo?: MediaType | string | null
  cardLabel: string
  valueLabel: string
  cardDisclaimer: string
  amountSectionLabel: string
  deliverySectionLabel: string
  greetingLabel: string
  greetingPlaceholder: string
  addToCartButton: string
}

export function VoucherHero({
  heading,
  description,
  amounts,
  deliveryOptions,
  deliveryDisclaimer,
  cardLogo,
  cardLabel,
  valueLabel,
  cardDisclaimer,
  amountSectionLabel,
  deliverySectionLabel,
  greetingLabel,
  greetingPlaceholder,
  addToCartButton,
}: VoucherHeroProps) {
  // Show email and pickup only — post/card removed for freshness
  const visibleDeliveryOptions = deliveryOptions.filter(
    (o) => o.type === 'email' || o.type === 'pickup',
  )
  const [selectedAmount, setSelectedAmount] = useState(amounts[0] ?? '50€')
  const [selectedDelivery, setSelectedDelivery] = useState(
    visibleDeliveryOptions[0]?.type ?? 'email',
  )

  // Format amount for display (e.g., "50€" -> "€50,00")
  const formatAmount = (amount: string) => {
    const num = amount.replace('€', '')
    return `€${num},00`
  }

  const iconColor = (opt: (typeof visibleDeliveryOptions)[0]) =>
    selectedDelivery === opt.type ? '#FFFFFF' : undefined

  return (
    <section
      className="w-full bg-ff-cream section-padding-lg"
    >
      <div className="mx-auto max-w-[var(--content-full)] px-[var(--space-container-x)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left Column - Voucher Preview Card */}
          <div className="order-2 lg:order-1">
            <div className="rounded-2xl border border-ff-border-light bg-ff-ivory-mist p-8 md:p-10 relative sticky top-8 shadow-sm">
              {/* Gift Icon */}
              <div className="absolute top-6 right-6">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M20 6H17.82C17.93 5.69 18 5.35 18 5C18 3.34 16.66 2 15 2C13.95 2 13.04 2.54 12.5 3.35L12 4.02L11.5 3.34C10.96 2.54 10.05 2 9 2C7.34 2 6 3.34 6 5C6 5.35 6.07 5.69 6.18 6H4C2.89 6 2.01 6.89 2.01 8L2 19C2 20.11 2.89 21 4 21H20C21.11 21 22 20.11 22 19V8C22 6.89 21.11 6 20 6ZM15 4C15.55 4 16 4.45 16 5C16 5.55 15.55 6 15 6C14.45 6 14 5.55 14 5C14 4.45 14.45 4 15 4ZM9 4C9.55 4 10 4.45 10 5C10 5.55 9.55 6 9 6C8.45 6 8 5.55 8 5C8 4.45 8.45 4 9 4ZM20 19H4V17H20V19ZM20 15H4V8H7.08C7.03 8.16 7 8.33 7 8.5C7 9.33 7.67 10 8.5 10C9.33 10 10 9.33 10 8.5C10 8.33 9.97 8.16 9.92 8H14.08C14.03 8.16 14 8.33 14 8.5C14 9.33 14.67 10 15.5 10C16.33 10 17 9.33 17 8.5C17 8.33 16.97 8.16 16.92 8H20V15Z"
                      fill="#DC2626"
                    />
                  </svg>
                </div>
              </div>

              <p className="font-display text-caption font-bold uppercase tracking-[0.12em] text-ff-near-black mb-6">
                {cardLabel}
              </p>

              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-ff-near-black rounded-xl flex items-center justify-center p-2">
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
                <p className="font-sans text-body-sm font-medium text-ff-gray-text mb-1">
                  {valueLabel}
                </p>
                <p className="font-display text-display font-bold text-ff-near-black tracking-tight">
                  {formatAmount(selectedAmount)}
                </p>
              </div>

              <p className="font-sans text-body-sm text-ff-gray-text text-center mt-6 leading-relaxed">
                {cardDisclaimer}
              </p>
            </div>
          </div>

          {/* Right Column - Voucher Configuration */}
          <div className="order-1 lg:order-2">
            <div className="flex flex-col gap-6 md:gap-8">
              <div className="pb-6 border-b border-ff-border-light min-w-[min(100%,38rem)] max-w-full">
                <h1 className="font-display text-display font-bold text-ff-near-black leading-tight tracking-tight whitespace-nowrap">
                  {heading}
                </h1>
                <p className="font-sans text-body-lg text-ff-gray-text leading-relaxed mt-3">
                  {description.includes('. ')
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
              <div className="rounded-2xl border border-ff-border-light bg-ff-cream p-6 md:p-7">
                <label className="font-display text-body-sm font-bold uppercase tracking-[0.1em] text-ff-near-black block mb-3">
                  {amountSectionLabel}
                </label>
                <div className="flex flex-wrap gap-2">
                  {amounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setSelectedAmount(amount)}
                      className={`px-5 py-2.5 rounded-full font-display text-body font-semibold transition-colors ${
                        selectedAmount === amount
                          ? 'bg-ff-near-black text-ff-ivory'
                          : 'bg-white border border-ff-border-light text-ff-near-black hover:border-ff-charcoal'
                      }`}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Options */}
              <div className="rounded-2xl border border-ff-border-light bg-ff-cream p-6 md:p-7">
                <label className="font-display text-body-sm font-bold uppercase tracking-[0.1em] text-ff-near-black block mb-3">
                  {deliverySectionLabel}
                </label>
                <div className="flex flex-col gap-2">
                  {visibleDeliveryOptions.map((option) => (
                    <button
                      key={option.type}
                      onClick={() => setSelectedDelivery(option.type)}
                      className={`flex items-center gap-4 w-full text-left rounded-xl px-5 py-3.5 transition-colors border-2 ${
                        selectedDelivery === option.type
                          ? 'bg-ff-ivory-mist border-ff-gold-accent'
                          : 'bg-white border-ff-border-light hover:bg-ff-ivory-mist/50'
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
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
                      <span
                        className={`font-sans text-body font-medium ${
                          selectedDelivery === option.type ? 'text-ff-near-black' : 'text-ff-gray-text'
                        }`}
                      >
                        {option.title}
                      </span>
                    </button>
                  ))}
                </div>
                {deliveryDisclaimer && (
                  <p className="font-sans text-body-sm font-medium text-red-600 leading-relaxed mt-3">
                    {deliveryDisclaimer}
                  </p>
                )}
              </div>

              {/* Greeting Message */}
              <div className="rounded-2xl border border-ff-border-light bg-ff-cream p-6 md:p-7">
                <label className="font-display text-body font-bold text-ff-near-black block mb-3">
                  {greetingLabel}
                </label>
                <textarea
                  placeholder={greetingPlaceholder}
                  rows={4}
                  maxLength={250}
                  className="w-full rounded-xl border border-ff-border-light bg-white px-5 py-4 font-sans text-body text-ff-near-black placeholder:text-ff-gray-text-light focus:border-ff-gold-accent focus:outline-none focus:ring-2 focus:ring-ff-gold-accent/20 resize-none transition-colors"
                />
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                className="w-full rounded-full bg-ff-near-black px-8 py-4 font-display text-body-lg font-bold text-ff-ivory transition-colors hover:bg-ff-charcoal active:scale-[0.99]"
              >
                {addToCartButton}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

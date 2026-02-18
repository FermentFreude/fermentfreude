'use client'

import { useState } from 'react'
import type { Media as MediaType } from '@/payload-types'
import { Media } from '@/components/Media'

interface VoucherHeroProps {
  heading: string
  description: string
  amounts: string[]
  deliveryOptions: Array<{ type: string; title: string; icon: string }>
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
  const [selectedAmount, setSelectedAmount] = useState(amounts[0] ?? '50€')
  const [selectedDelivery, setSelectedDelivery] = useState(deliveryOptions[0]?.type ?? 'email')

  // Format amount for display (e.g., "50€" -> "€50,00")
  const formatAmount = (amount: string) => {
    const num = amount.replace('€', '')
    return `€${num},00`
  }

  return (
    <section className="w-full py-12 md:py-24">
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Column - Voucher Preview Card */}
          <div className="order-2 lg:order-1">
            <div className="bg-[#FAF2E0] rounded-3xl p-8 md:p-12 shadow-lg relative sticky top-8">
              {/* Gift Icon - Red gift box */}
              <div className="absolute top-6 right-6">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 6H17.82C17.93 5.69 18 5.35 18 5C18 3.34 16.66 2 15 2C13.95 2 13.04 2.54 12.5 3.35L12 4.02L11.5 3.34C10.96 2.54 10.05 2 9 2C7.34 2 6 3.34 6 5C6 5.35 6.07 5.69 6.18 6H4C2.89 6 2.01 6.89 2.01 8L2 19C2 20.11 2.89 21 4 21H20C21.11 21 22 20.11 22 19V8C22 6.89 21.11 6 20 6ZM15 4C15.55 4 16 4.45 16 5C16 5.55 15.55 6 15 6C14.45 6 14 5.55 14 5C14 4.45 14.45 4 15 4ZM9 4C9.55 4 10 4.45 10 5C10 5.55 9.55 6 9 6C8.45 6 8 5.55 8 5C8 4.45 8.45 4 9 4ZM20 19H4V17H20V19ZM20 15H4V8H7.08C7.03 8.16 7 8.33 7 8.5C7 9.33 7.67 10 8.5 10C9.33 10 10 9.33 10 8.5C10 8.33 9.97 8.16 9.92 8H14.08C14.03 8.16 14 8.33 14 8.5C14 9.33 14.67 10 15.5 10C16.33 10 17 9.33 17 8.5C17 8.33 16.97 8.16 16.92 8H20V15Z"
                    fill="#DC2626"
                  />
                </svg>
              </div>

              {/* Label */}
              <div className="mb-6">
                <p className="font-display text-sm font-bold uppercase tracking-wider text-[#1D1D1D]">
                  {cardLabel}
                </p>
              </div>

              {/* Logo */}
              <div className="flex justify-center mb-8">
                <div className="w-[70px] h-[71px] bg-[#1D1D1D] rounded-lg flex items-center justify-center p-2">
                  {cardLogo ? (
                    <Media
                      resource={cardLogo}
                      width={70}
                      height={71}
                      imgClassName="object-contain"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#ECE5DE] rounded" />
                  )}
                </div>
              </div>

              {/* Value Text */}
              <div className="text-center mb-4">
                <h3 className="font-display text-2xl md:text-3xl font-bold text-[#1D1D1D] mb-2">
                  {valueLabel}
                </h3>
                <p className="font-display text-4xl md:text-5xl font-bold text-[#1D1D1D]">
                  {formatAmount(selectedAmount)}
                </p>
              </div>

              {/* Disclaimer */}
              <div className="text-center mt-6">
                <p className="font-sans text-sm text-[#4B4F4A]">{cardDisclaimer}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Voucher Configuration */}
          <div className="order-1 lg:order-2">
            <div className="flex flex-col gap-6 md:gap-8">
              {/* Heading */}
              <h1 className="font-display text-4xl md:text-5xl font-bold text-[#1D1D1D]">
                {heading}
              </h1>

              {/* Description */}
              <p className="font-sans text-lg md:text-xl text-[#4B4F4A] leading-relaxed">
                {description}
              </p>

              {/* Amount Selection */}
              <div className="flex flex-col gap-4">
                <label className="font-display text-base md:text-lg font-bold text-[#1D1D1D] uppercase tracking-wide">
                  {amountSectionLabel}
                </label>
                <div className="flex flex-wrap gap-3">
                  {amounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setSelectedAmount(amount)}
                      className={`px-5 py-2.5 md:px-6 md:py-3 rounded-full font-display text-sm md:text-base font-semibold transition-all ${
                        selectedAmount === amount
                          ? 'bg-[#6B6B6B] text-white shadow-md'
                          : 'bg-white border-2 border-[#E8E4D9] text-[#1D1D1D] hover:bg-[#FAF2E0] hover:border-[#6B6B6B]'
                      }`}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Options */}
              <div className="flex flex-col gap-4">
                <label className="font-display text-base md:text-lg font-bold text-[#1D1D1D] uppercase tracking-wide">
                  {deliverySectionLabel}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {deliveryOptions.map((option) => (
                    <button
                      key={option.type}
                      onClick={() => setSelectedDelivery(option.type)}
                      className={`py-2 px-4 md:py-2 md:px-4 rounded-2xl border-2 transition-all text-left ${
                        selectedDelivery === option.type
                          ? 'border-[#6B6B6B] bg-[#FAF2E0] shadow-sm'
                          : 'border-[#E8E4D9] bg-white hover:bg-[#FAF2E0] hover:border-[#6B6B6B]'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-0.5">
                          {option.icon === 'email' ? (
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
                                fill={selectedDelivery === option.type ? '#6B6B6B' : '#4B4F4A'}
                              />
                            </svg>
                          ) : (
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M20 2H4C2.9 2 2 2.9 2 4V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V4C22 2.9 21.1 2 20 2ZM20 20H4V4H20V20Z"
                                fill={selectedDelivery === option.type ? '#6B6B6B' : '#4B4F4A'}
                              />
                              <path
                                d="M6 6H18V8H6V6ZM6 10H18V12H6V10ZM6 14H16V16H6V14Z"
                                fill={selectedDelivery === option.type ? '#6B6B6B' : '#4B4F4A'}
                              />
                            </svg>
                          )}
                        </div>
                        <span
                          className={`font-sans text-sm md:text-base font-semibold leading-relaxed ${
                            selectedDelivery === option.type ? 'text-[#1D1D1D]' : 'text-[#4B4F4A]'
                          }`}
                        >
                          {option.title}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Greeting Message */}
              <div className="flex flex-col gap-4">
                <label className="font-display text-base md:text-lg font-bold text-[#1D1D1D]">
                  {greetingLabel}
                </label>
                <textarea
                  placeholder={greetingPlaceholder}
                  rows={4}
                  maxLength={250}
                  className="w-full rounded-2xl border-2 border-[#E8E4D9] px-5 md:px-6 py-4 font-sans text-sm md:text-base text-[#1D1D1D] placeholder:text-[#B8B8B8] focus:border-[#6B6B6B] focus:outline-none resize-none transition-colors"
                />
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                className="w-full rounded-full bg-[#6B6B6B] px-6 md:px-8 py-2.5 md:py-3 font-display text-lg md:text-xl font-bold text-white transition-colors hover:bg-[#595959] shadow-md hover:shadow-lg"
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

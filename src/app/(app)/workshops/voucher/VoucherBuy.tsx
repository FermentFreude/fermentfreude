'use client'

import { ArrowUpRight, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { createContext, useCallback, useContext, useState } from 'react'
import { toast } from 'sonner'

import { Sheet, SheetContent, SheetDescription, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/utilities/cn'

import { ALL_AMOUNTS, type VoucherAmount, type VoucherContent } from './content'
import { VoucherTicket } from './VoucherTicket'

/* ═══════════════════════════════════════════════════════════════
 *  VOUCHER BUY — the panel every buy button on the page opens,
 *  preset to its amount. Only the buyer's name and email: a voucher
 *  is a code anyone can redeem, and the personal part is the
 *  printable card.
 *
 *  The voucher always goes to the buyer by email, with the PDF to
 *  print, who then forwards or hands it over. Same payment flow as
 *  the old voucher hero (/api/voucher/checkout → /voucher/checkout);
 *  Phase 2 swaps only the submit: the voucher goes into the cart.
 * ═══════════════════════════════════════════════════════════════ */

type BuyContextValue = { open: (amount: VoucherAmount) => void }

const BuyContext = createContext<BuyContextValue>({ open: () => {} })

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const inputClass =
  'mt-1.5 w-full rounded-xl border border-[#E8E4D9] bg-white px-3.5 py-3 font-sans text-[15px] text-[#1A1A1A] outline-none transition placeholder:text-[#9A968F] focus:border-[#1A1A1A] focus:ring-2 focus:ring-[#E6BE68]/40'
const labelClass = 'block font-sans text-[13px] font-semibold text-[#1A1A1A]'

export function VoucherBuyProvider({ c, children }: { c: VoucherContent; children: React.ReactNode }) {
  const router = useRouter()
  const t = c.buy

  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState<VoucherAmount>(99)
  const [purchaserName, setPurchaserName] = useState('')
  const [purchaserEmail, setPurchaserEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const open = useCallback((value: VoucherAmount) => {
    setAmount(value)
    setIsOpen(true)
  }, [])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!purchaserName.trim()) return toast.error(t.nameRequired)
    if (!purchaserEmail.trim()) return toast.error(t.emailRequired)
    if (!EMAIL_RE.test(purchaserEmail)) return toast.error(t.invalidEmail)

    const payload = {
      amount,
      // Always to the buyer, who forwards or prints it (founders' rule, 2026-11-05)
      deliveryMethod: 'email-self' as const,
      purchaserName: purchaserName.trim(),
      purchaserEmail: purchaserEmail.trim(),
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/voucher/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        toast.error(data.error || t.checkoutError)
        return
      }
      if (data.clientSecret) {
        sessionStorage.setItem('voucherCheckout', JSON.stringify({ clientSecret: data.clientSecret, ...payload }))
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
  }

  const isWorkshop = amount === 99

  return (
    <BuyContext.Provider value={{ open }}>
      {children}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="right"
          className="top-0 w-full gap-0 overflow-y-auto border-l-0 bg-[#FFFEF9] p-0 sm:max-w-120"
        >
          <form onSubmit={submit} className="flex min-h-full flex-col">
            <div className="px-6 pb-6 pt-8 sm:px-8">
              <SheetTitle className="font-display text-2xl font-bold tracking-[-0.02em] text-[#1A1A1A]">
                {t.title}
              </SheetTitle>
              <SheetDescription className="sr-only">{c.hero.text}</SheetDescription>

              <div className="mt-6 drop-shadow-[0_18px_30px_rgba(26,26,26,0.18)]">
                <VoucherTicket
                  amount={amount}
                  variant={isWorkshop ? 'workshop' : 'value'}
                  text={{ ...(isWorkshop ? c.ticket.workshop : c.ticket.value), footer: c.ticket.footer, stub: c.ticket.stub }}
                />
              </div>

              <fieldset className="mt-7">
                <legend className={labelClass}>{t.amountLabel}</legend>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {ALL_AMOUNTS.map((value) => (
                    <label
                      key={value}
                      className={cn(
                        'flex min-h-14 cursor-pointer flex-col items-center justify-center rounded-xl border px-2 py-2 text-center transition',
                        amount === value
                          ? 'border-[#1A1A1A] bg-[#1A1A1A] text-[#FAF2E0]'
                          : 'border-[#E8E4D9] bg-white text-[#1A1A1A] hover:border-[#1A1A1A]',
                      )}
                    >
                      <input
                        type="radio"
                        name="amount"
                        value={value}
                        checked={amount === value}
                        onChange={() => setAmount(value)}
                        className="sr-only"
                      />
                      <span className="font-display text-lg font-bold leading-none">€{value}</span>
                      {value === 99 && (
                        <span className="mt-1 font-sans text-[11px] leading-none opacity-75">{t.workshopChip}</span>
                      )}
                    </label>
                  ))}
                </div>
              </fieldset>

              <p className="mb-0 mt-6 rounded-xl bg-[#F9F2E0] px-4 py-3 font-sans text-[14px] leading-snug text-[#4B4B4B]">
                {t.deliveryNote}
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label htmlFor="vb-name" className={labelClass}>
                    {t.yourName}
                  </label>
                  <input
                    id="vb-name"
                    autoComplete="name"
                    value={purchaserName}
                    onChange={(e) => setPurchaserName(e.target.value)}
                    placeholder={t.yourNamePlaceholder}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="vb-email" className={labelClass}>
                    {t.yourEmail}
                  </label>
                  <input
                    id="vb-email"
                    type="email"
                    autoComplete="email"
                    value={purchaserEmail}
                    onChange={(e) => setPurchaserEmail(e.target.value)}
                    placeholder="deine@email.at"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 mt-auto border-t border-[#E8E4D9] bg-[#FFFEF9] px-6 py-4 sm:px-8">
              <button
                type="submit"
                disabled={isLoading}
                className="flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#E6BE68] px-6 py-3.5 font-display text-base font-bold text-[#1A1A1A] transition hover:bg-[#D4A654] disabled:opacity-60"
              >
                {isLoading ? t.processing : `${t.submit} · €${amount}`}
                {!isLoading && <ArrowUpRight className="size-4" aria-hidden="true" />}
              </button>
              <p className="mt-2 flex items-center justify-center gap-1.5 font-sans text-[12px] text-[#6B6B6B]">
                <Lock className="size-3" aria-hidden="true" />
                {t.secure}
              </p>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </BuyContext.Provider>
  )
}

/** Any "Gutschein verschenken" button on the page */
export function BuyButton({
  amount,
  children,
  className,
}: {
  amount: VoucherAmount
  children: React.ReactNode
  className?: string
}) {
  const { open } = useContext(BuyContext)
  return (
    <button type="button" onClick={() => open(amount)} className={className}>
      {children}
    </button>
  )
}

'use client'

import { ArrowUpRight, Check, Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Media } from '@/components/Media'
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

/** A Rabattcode the server accepted for this amount (src/lib/discountCodes.ts) */
type AppliedCode = { code: string; amountOff: number; finalAmount: number; forAmount: number }

type CodeProblem = 'unknown' | 'inactive' | 'notYet' | 'expired' | 'notForAmount' | 'error'

function codeProblemText(problem: string | undefined, t: VoucherContent['buy']): string {
  switch (problem as CodeProblem) {
    case 'inactive':
      return t.codeInactive
    case 'notYet':
      return t.codeNotYet
    case 'expired':
      return t.codeExpired
    case 'notForAmount':
      return t.codeNotForAmount
    case 'unknown':
      return t.codeUnknown
    default:
      return t.codeError
  }
}

const inputClass =
  'mt-1.5 w-full rounded-xl border border-[#E8E4D9] bg-white px-3.5 py-3 font-sans text-[15px] text-[#1A1A1A] outline-none transition placeholder:text-[#9A968F] focus:border-[#1A1A1A] focus:ring-2 focus:ring-[#E6BE68]/40'
const labelClass = 'block font-sans text-[13px] font-semibold text-[#1A1A1A]'

export function VoucherBuyProvider({
  c,
  children,
}: {
  c: VoucherContent
  children: React.ReactNode
}) {
  const router = useRouter()
  const t = c.buy

  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState<VoucherAmount>(99)
  const [purchaserName, setPurchaserName] = useState('')
  const [purchaserEmail, setPurchaserEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [codeInput, setCodeInput] = useState('')
  const [applied, setApplied] = useState<AppliedCode | null>(null)
  const [codeError, setCodeError] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkCode = useCallback(
    async (code: string, forAmount: number) => {
      setIsChecking(true)
      setCodeError(null)
      try {
        const res = await fetch('/api/voucher/discount-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, amount: forAmount }),
        })
        const data = await res.json()
        if (data.success) {
          setApplied({
            code: data.code,
            amountOff: data.amountOff,
            finalAmount: data.finalAmount,
            forAmount,
          })
          setCodeInput(data.code)
        } else {
          setApplied(null)
          setCodeError(codeProblemText(data.problem, t))
        }
      } catch {
        setApplied(null)
        setCodeError(t.codeError)
      } finally {
        setIsChecking(false)
      }
    },
    [t],
  )

  const applyCode = () => {
    if (codeInput.trim()) void checkCode(codeInput, amount)
  }

  const removeCode = () => {
    setApplied(null)
    setCodeInput('')
    setCodeError(null)
  }

  // Another amount picked: the code may not apply (or cost differently) — check again
  useEffect(() => {
    if (applied && applied.forAmount !== amount) void checkCode(applied.code, amount)
  }, [amount, applied, checkCode])

  const payAmount = applied && applied.forAmount === amount ? applied.finalAmount : amount

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
      // Typed but not applied yet? The server checks it either way.
      discountCode: applied?.code || codeInput.trim() || undefined,
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/voucher/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (data.discountProblem) {
        setApplied(null)
        setCodeError(codeProblemText(data.discountProblem, t))
        return
      }
      if (!response.ok || !data.success) {
        toast.error(data.error || t.checkoutError)
        return
      }
      if (data.clientSecret) {
        sessionStorage.setItem(
          'voucherCheckout',
          JSON.stringify({
            clientSecret: data.clientSecret,
            ...payload,
            chargeAmount: data.chargeAmount,
            discountCode: data.discountCode,
            discountAmount: data.discountAmount,
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

              {isWorkshop && t.voucherImage ? (
                <div className="mt-6 overflow-hidden rounded-lg shadow-[0_18px_30px_rgba(26,26,26,0.18)]">
                  <Media
                    resource={t.voucherImage}
                    size="(min-width: 640px) 416px, 100vw"
                    imgClassName="block h-auto w-full"
                  />
                </div>
              ) : (
                <div className="mt-6 drop-shadow-[0_18px_30px_rgba(26,26,26,0.18)]">
                  <VoucherTicket
                    amount={amount}
                    variant={isWorkshop ? 'workshop' : 'value'}
                    simple={!isWorkshop}
                    text={{
                      ...(isWorkshop ? c.ticket.workshop : c.ticket.value),
                      footer: c.ticket.footer,
                      stub: c.ticket.stub,
                    }}
                  />
                </div>
              )}

              {/* €50/€30/€20 only while the value-voucher section is switched on */}
              {c.sections.values && (
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
                        <span className="font-display text-lg font-bold leading-none">
                          €{value}
                        </span>
                        {value === 99 && (
                          <span className="mt-1 font-sans text-[11px] leading-none opacity-75">
                            {t.workshopChip}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}

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
                <div>
                  <label htmlFor="vb-code" className={labelClass}>
                    {t.codeLabel}
                  </label>
                  {applied ? (
                    <div className="mt-1.5 flex items-center justify-between rounded-xl border border-[#1A1A1A] bg-white px-3.5 py-3">
                      <span className="flex items-center gap-2 font-sans text-[15px] font-semibold tracking-wide text-[#1A1A1A]">
                        <Check className="size-4 text-[#B08A3E]" aria-hidden="true" />
                        {applied.code}
                      </span>
                      <button
                        type="button"
                        onClick={removeCode}
                        className="font-sans text-[13px] text-[#6B6B6B] underline underline-offset-2 transition hover:text-[#1A1A1A]"
                      >
                        {t.codeRemove}
                      </button>
                    </div>
                  ) : (
                    <div className="mt-1.5 flex gap-2">
                      <input
                        id="vb-code"
                        value={codeInput}
                        onChange={(e) => {
                          setCodeInput(e.target.value)
                          setCodeError(null)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            applyCode()
                          }
                        }}
                        autoComplete="off"
                        autoCapitalize="characters"
                        spellCheck={false}
                        placeholder={t.codePlaceholder}
                        aria-invalid={Boolean(codeError)}
                        aria-describedby={codeError ? 'vb-code-error' : undefined}
                        className={cn(inputClass, 'mt-0 uppercase placeholder:normal-case')}
                      />
                      <button
                        type="button"
                        onClick={applyCode}
                        disabled={!codeInput.trim() || isChecking}
                        className="shrink-0 rounded-xl border border-[#1A1A1A] px-4 font-display text-[14px] font-bold text-[#1A1A1A] transition hover:bg-[#1A1A1A] hover:text-[#FAF2E0] disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#1A1A1A]"
                      >
                        {isChecking ? '…' : t.codeApply}
                      </button>
                    </div>
                  )}
                  {codeError && (
                    <p
                      id="vb-code-error"
                      role="alert"
                      className="mb-0 mt-1.5 font-sans text-[13px] text-red-700"
                    >
                      {codeError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 mt-auto border-t border-[#E8E4D9] bg-[#FFFEF9] px-6 py-4 sm:px-8">
              {applied && applied.forAmount === amount && (
                <dl className="mb-3 space-y-1 font-sans text-[14px]">
                  <div className="flex justify-between text-[#4B4B4B]">
                    <dt>
                      {t.codeDiscount} {applied.code}
                    </dt>
                    <dd>−€{applied.amountOff}</dd>
                  </div>
                  <div className="flex justify-between font-semibold text-[#1A1A1A]">
                    <dt>{t.codeToPay}</dt>
                    <dd>
                      <s className="mr-2 font-normal text-[#9A968F]">€{amount}</s>€
                      {applied.finalAmount}
                    </dd>
                  </div>
                </dl>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="flex min-h-13 w-full items-center justify-center gap-2 rounded-full bg-[#E6BE68] px-6 py-3.5 font-display text-base font-bold text-[#1A1A1A] transition hover:bg-[#D4A654] disabled:opacity-60"
              >
                {isLoading ? t.processing : `${t.submit} · €${payAmount}`}
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

import { ArrowUpRight } from 'lucide-react'

import type { VoucherContent } from './content'
import { Eyebrow } from './Eyebrow'
import { Reveal } from './Reveal'
import { BuyButton } from './VoucherBuy'
import { VoucherTicket } from './VoucherTicket'

/* ═══════════════════════════════════════════════════════════════
 *  VALUE VOUCHERS — €50 / €30 / €20 as three real tickets, each
 *  with one line and its own buy button.
 * ═══════════════════════════════════════════════════════════════ */

export function ValueVouchersSection({ c }: { c: VoucherContent }) {
  const v = c.values
  return (
    <section id="betraege" className="scroll-mt-24 bg-[#FFFEF9]">
      <div className="container-padding mx-auto max-w-360 py-20 lg:py-28">
        <Reveal className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-end lg:gap-16">
          <div>
            <Eyebrow>{v.eyebrow}</Eyebrow>
            <h2 className="mb-0 mt-4 font-display text-[clamp(2.25rem,4.4vw,4rem)] font-bold leading-[0.98] tracking-[-0.035em] text-[#1A1A1A]">
              {v.headline}
            </h2>
          </div>
          <p className="mb-0 max-w-xl font-sans text-[17px] leading-relaxed text-[#4B4B4B] lg:justify-self-end lg:text-lg">
            {v.text}
          </p>
        </Reveal>

        <ul className="mt-12 grid list-none gap-x-6 gap-y-12 p-0 md:grid-cols-3 lg:mt-16 lg:gap-x-8">
          {v.items.map((item, i) => (
            <li key={item.amount}>
              <Reveal delay={0.08 * i} className="group flex h-full flex-col">
                <BuyButton
                  amount={item.amount}
                  className="block w-full rounded-[2px] text-left drop-shadow-[0_16px_28px_rgba(26,26,26,0.16)] transition duration-500 ease-out group-hover:-translate-y-1.5 group-hover:drop-shadow-[0_26px_40px_rgba(26,26,26,0.22)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1A1A1A]"
                >
                  <VoucherTicket
                    amount={item.amount}
                    variant="value"
                    simple
                    text={{ ...c.ticket.value, footer: c.ticket.footer, stub: c.ticket.stub }}
                    alt={`${v.valueName} €${item.amount}`}
                  />
                </BuyButton>
                <div className="mt-6 flex flex-1 items-start justify-between gap-4 border-t border-[#E8E4D9] pt-5">
                  <div>
                    <p className="mb-0 font-display text-2xl font-bold leading-none tracking-[-0.02em] text-[#1A1A1A]">
                      €{item.amount}
                      <span className="ml-2 font-sans text-[15px] font-normal tracking-normal text-[#6B6B6B]">
                        {v.valueName}
                      </span>
                    </p>
                    <p className="mb-0 mt-2 font-sans text-[15px] leading-snug text-[#4B4B4B]">{item.line}</p>
                  </div>
                  <BuyButton
                    amount={item.amount}
                    className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-[#1A1A1A] px-4 py-2 font-display text-sm font-bold text-[#1A1A1A] transition hover:bg-[#1A1A1A] hover:text-[#FAF2E0]"
                  >
                    {v.button}
                    <ArrowUpRight className="size-3.5" aria-hidden="true" />
                  </BuyButton>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

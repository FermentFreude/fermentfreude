'use client'

import { motion } from 'motion/react'
import Link from 'next/link'
import { useId, useState } from 'react'

import type { VoucherContent } from './content'
import { Eyebrow } from './Eyebrow'
import { Reveal } from './Reveal'

/* ═══════════════════════════════════════════════════════════════
 *  VOUCHER FAQ — same accordion as the workshop pages (LaktoFAQ):
 *  hairline rows, a gold round "+" that turns into "×", one answer
 *  open at a time, "Noch Fragen? Schreib uns" underneath.
 *  The matching FAQPage markup for Google is in page.tsx.
 * ═══════════════════════════════════════════════════════════════ */

const EASE = [0.16, 1, 0.3, 1] as const

export function VoucherFAQ({ f }: { f: VoucherContent['faq'] }) {
  const [open, setOpen] = useState<number | null>(0)
  const baseId = useId()

  return (
    <section className="bg-white">
      <div className="container-padding mx-auto grid max-w-6xl gap-12 py-20 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-20 lg:py-28">
        <Reveal className="lg:sticky lg:top-28 lg:self-start">
          <Eyebrow>{f.eyebrow}</Eyebrow>
          <h2 className="mb-0 mt-4 font-display text-[clamp(2rem,3.6vw,3rem)] font-bold leading-[1.02] tracking-[-0.03em] text-[#1A1A1A]">
            {f.title}
          </h2>
          <p className="mb-0 mt-5 max-w-sm font-sans text-[17px] leading-relaxed text-[#4B4B4B]">{f.description}</p>
          <p className="mb-0 mt-8 font-sans text-[15px] text-[#6B6B6B]">
            {f.more}{' '}
            <Link
              href="/contact"
              className="font-display font-bold text-[#1A1A1A] underline decoration-[#E6BE68] decoration-2 underline-offset-[6px] transition hover:decoration-[#1A1A1A]"
            >
              {f.moreLink}
            </Link>
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <ul className="m-0 list-none border-t border-[#E8E4D9] p-0">
            {f.items.map((item, i) => {
              const isOpen = open === i
              const panelId = `${baseId}-panel-${i}`
              return (
                <li key={item.question} className="border-b border-[#E8E4D9]">
                  <h3 className="m-0">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                    >
                      <span className="font-display text-[17px] font-bold leading-snug text-[#1A1A1A] transition-colors group-hover:text-[#555954] lg:text-lg">
                        {item.question}
                      </span>
                      <span
                        className={`flex size-9 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                          isOpen ? 'bg-[#1A1A1A] text-[#E6BE68]' : 'bg-[#E6BE68] text-[#1A1A1A] group-hover:bg-[#D4A654]'
                        }`}
                        aria-hidden="true"
                      >
                        <svg
                          viewBox="0 0 16 16"
                          className={`size-4 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                        >
                          <path d="M8 3v10M3 8h10" />
                        </svg>
                      </span>
                    </button>
                  </h3>
                  <motion.div
                    id={panelId}
                    role="region"
                    initial={false}
                    animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <p className="mb-0 max-w-2xl pb-7 pr-14 font-sans text-[16px] leading-relaxed text-[#4B4B4B]">
                      {item.answer}
                    </p>
                  </motion.div>
                </li>
              )
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}

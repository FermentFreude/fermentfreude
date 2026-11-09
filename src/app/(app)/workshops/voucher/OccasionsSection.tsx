import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

import { Media } from '@/components/Media'

import type { VoucherContent } from './content'
import { Eyebrow } from './Eyebrow'
import { Reveal, RevealImage } from './Reveal'
import { BuyButton } from './VoucherBuy'

/* ═══════════════════════════════════════════════════════════════
 *  OCCASIONS — one row per way of selling the voucher (Christmas,
 *  companies, plant-based, birthday). Photo and text alternate
 *  sides, in the style of the workshop pages (Vom Feld ins Glas):
 *  gold label, heading, text, gold-line bullets, then one action.
 * ═══════════════════════════════════════════════════════════════ */

const ctaClass =
  'group/cta mt-9 inline-flex min-h-12 items-center gap-2 rounded-full px-6 py-3 font-display text-[15px] font-bold transition'

export function OccasionsSection({ c }: { c: VoucherContent }) {
  const o = c.occasions
  return (
    <section className="bg-white">
      <div className="container-padding mx-auto max-w-6xl pt-20 lg:pt-28">
        <Reveal className="grid gap-6 lg:grid-cols-2 lg:items-end lg:gap-20">
          <div>
            <Eyebrow>{o.eyebrow}</Eyebrow>
            <h2 className="mb-0 mt-4 font-display text-[clamp(2.25rem,4.4vw,4rem)] font-bold leading-[0.98] tracking-[-0.035em] text-[#1A1A1A]">
              {o.headline}
            </h2>
          </div>
          <p className="mb-0 max-w-xl font-sans text-[17px] leading-relaxed text-[#4B4B4B] lg:justify-self-end lg:text-lg">
            {o.intro}
          </p>
        </Reveal>
      </div>

      <div className="container-padding mx-auto max-w-6xl pb-12 pt-6 lg:pb-20 lg:pt-10">
        {o.rows.map((row, i) => {
          const image = row.image
          const reverse = i % 2 === 1
          return (
            <article key={row.key} className="py-12 md:py-10 lg:py-16">
              <div
                className={`grid items-center gap-10 md:grid-cols-2 lg:gap-20 ${
                  reverse ? 'md:[&>*:first-child]:order-2 md:[&>*:last-child]:order-1' : ''
                }`}
              >
                <RevealImage className="relative aspect-4/3 w-full overflow-hidden rounded-2xl bg-[#ECE5DE] md:aspect-4/5 lg:aspect-5/4">
                  {image && (
                    <Media
                      resource={image}
                      fill
                      size="(min-width: 1024px) 560px, (min-width: 768px) 50vw, 100vw"
                      imgClassName="object-cover"
                    />
                  )}
                </RevealImage>

                <Reveal className="max-w-lg" delay={0.1}>
                  <p className="mb-0 flex items-center gap-3 font-display text-[11px] font-bold uppercase tracking-[0.28em] text-[#4B4F4A]">
                    <span className="h-px w-6 bg-[#E6BE68]" aria-hidden="true" />
                    {row.label}
                  </p>
                  <h3 className="mb-0 mt-4 font-display text-[clamp(1.6rem,2.8vw,2.25rem)] font-bold leading-[1.1] tracking-[-0.025em] text-[#1A1A1A]">
                    {row.title}
                  </h3>
                  <p className="mb-0 mt-5 font-sans text-[17px] leading-relaxed text-[#4B4B4B]">{row.text}</p>
                  <ul className="mb-0 mt-7 list-none space-y-3.5 p-0">
                    {row.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-4">
                        <span className="h-px w-6 shrink-0 bg-[#E6BE68]" aria-hidden="true" />
                        <span className="font-sans text-[15px] leading-snug text-[#1A1A1A]">{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  {row.cta.kind === 'buy' ? (
                    <BuyButton
                      amount={row.cta.amount}
                      className={`${ctaClass} bg-[#E6BE68] text-[#1A1A1A] hover:bg-[#D4A654]`}
                    >
                      {row.cta.label}
                      <Arrow />
                    </BuyButton>
                  ) : (
                    <Link
                      href={row.cta.href}
                      className={`${ctaClass} border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-[#FAF2E0]`}
                    >
                      {row.cta.label}
                      <Arrow />
                    </Link>
                  )}
                </Reveal>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function Arrow() {
  return (
    <ArrowUpRight
      className="size-4 transition-transform group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5"
      aria-hidden="true"
    />
  )
}

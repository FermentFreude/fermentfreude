import { PointsRow } from '@/components/PointsRow'

import type { VoucherContent } from './content'
import { DownloadCardButton } from './DownloadCardButton'
import { Eyebrow } from './Eyebrow'
import { Reveal } from './Reveal'
import { GreetingCard } from './VoucherTicket'

/* ═══════════════════════════════════════════════════════════════
 *  PRINT — the greeting card to print and write in (front + back
 *  fanned out), then the four steps as one points row.
 * ═══════════════════════════════════════════════════════════════ */

export function PrintSection({ c }: { c: VoucherContent }) {
  const p = c.print
  return (
    <section className="overflow-hidden bg-[#F9F2E0]">
      <div className="container-padding mx-auto grid max-w-360 items-center gap-14 py-20 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-20 lg:py-28">
        <Reveal className="relative order-2 mx-auto aspect-10/9 w-full max-w-160 lg:order-1">
          <div className="absolute left-0 top-[6%] w-[78%] -rotate-[5deg] drop-shadow-[0_22px_36px_rgba(26,26,26,0.14)]">
            <GreetingCard side="back" text={c.card} />
          </div>
          <div className="absolute bottom-[4%] right-0 w-[70%] rotate-[4deg] drop-shadow-[0_26px_44px_rgba(26,26,26,0.2)]">
            <GreetingCard side="front" text={c.card} alt={p.cardAlt} />
          </div>
        </Reveal>

        <Reveal className="order-1 max-w-xl lg:order-2">
          <Eyebrow>{p.eyebrow}</Eyebrow>
          <h2 className="mb-0 mt-4 font-display text-[clamp(2.25rem,4.4vw,4rem)] font-bold leading-[0.98] tracking-[-0.035em] text-[#1A1A1A]">
            {p.headline}
          </h2>
          <p className="mb-0 mt-6 font-sans text-[17px] leading-relaxed text-[#4B4B4B] lg:text-lg">{p.text}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <DownloadCardButton label={p.button} file={p.file} />
            <span className="font-sans text-[14px] text-[#6B6B6B]">{p.note}</span>
          </div>
        </Reveal>
      </div>

      <div className="container-padding mx-auto max-w-360 pb-20 lg:pb-28">
        <Reveal>
          <div className="mb-6">
            <Eyebrow>{c.how.eyebrow}</Eyebrow>
          </div>
          <PointsRow items={c.how.points} tone="dark" phoneText />
        </Reveal>
      </div>
    </section>
  )
}

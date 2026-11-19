import { Media as MediaComponent } from '@/components/Media'
import type { AppLocale } from '@/utilities/payloadLocaleQuery'
import Link from 'next/link'

import { isResolvedMedia, type Labels } from './shared'
import { ArrowIcon } from './ui'

/* ═══════════════════════════════════════════════════════════════
 *  End of /rezepte, category and recipe pages:
 *  Workshop block — photo + invitation + "Termine ansehen"
 * ═══════════════════════════════════════════════════════════════ */

type WorkshopProps = {
  eyebrow: string
  title: string
  text: string
  button: string
  href: string
  image?: unknown
}

export function WorkshopBlock({ workshop }: { workshop: WorkshopProps; locale?: AppLocale; labels?: Labels }) {
  return (
    <div className="grid overflow-hidden rounded-[2rem] bg-[#2D2F2C] text-[#FFFEF9] lg:grid-cols-[1fr_1.05fr]">
      <Link href={workshop.href} className="group relative block min-h-[16rem] overflow-hidden bg-[#403c39] sm:min-h-[20rem]" tabIndex={-1} aria-hidden>
        {isResolvedMedia(workshop.image) && (
          <div className="absolute inset-0">
            <MediaComponent resource={workshop.image} fill imgClassName="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
          </div>
        )}
      </Link>

      <div className="flex flex-col justify-center gap-8 p-7 md:p-10 lg:p-12">
        <div className="flex flex-col items-start gap-3">
          <span className="rounded-full bg-[#E6BE68] px-3 py-1 font-display text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[#2D2F2C]">
            {workshop.eyebrow}
          </span>
          <h2 className="font-display text-[clamp(1.8rem,3.2vw,2.7rem)] font-bold leading-[1.05] tracking-[-0.03em] text-balance">
            {workshop.title}
          </h2>
          <p className="max-w-[32rem] text-[1.02rem] leading-relaxed text-[#FAF2E0]/75">{workshop.text}</p>
          <Link
            href={workshop.href}
            className="group mt-2 inline-flex items-center gap-2.5 rounded-full bg-[#E6BE68] px-6 py-3.5 font-display text-[0.98rem] font-bold text-[#2D2F2C] transition-colors hover:bg-[#FFFEF9]"
          >
            {workshop.button}
            <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

      </div>
    </div>
  )
}

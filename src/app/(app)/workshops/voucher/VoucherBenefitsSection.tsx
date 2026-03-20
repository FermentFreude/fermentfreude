'use client'

import {
  CalendarDays,
  Package,
  ShieldCheck,
  Users,
  UsersRound,
  Zap,
} from 'lucide-react'

interface BenefitItem {
  text: string
  subtext?: string | null
}

interface VoucherBenefitsSectionProps {
  heading: string
  subtitle?: string | null
  benefits: BenefitItem[]
}

const CARD_ICONS = [
  { Icon: CalendarDays, color: 'text-emerald-600', bg: 'bg-emerald-500/15' },
  { Icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-500/15' },
  { Icon: Users, color: 'text-violet-600', bg: 'bg-violet-500/15' },
  { Icon: UsersRound, color: 'text-sky-600', bg: 'bg-sky-500/15' },
  { Icon: Zap, color: 'text-amber-600', bg: 'bg-amber-500/15' },
  { Icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-500/15' },
] as const

export function VoucherBenefitsSection({
  heading,
  subtitle,
  benefits,
}: VoucherBenefitsSectionProps) {
  const items = benefits.slice(0, 6)

  return (
    <section className="relative w-full overflow-hidden bg-white py-12 md:py-14">
      <div className="mx-auto max-w-[var(--content-wide)] px-[var(--space-container-x)]">
        <header className="mb-10 text-center md:mb-12">
          <h2 className="font-display text-[length:var(--text-heading)] font-bold tracking-tight text-ff-near-black">
            {heading}
          </h2>
          {subtitle?.trim() && (
            <p className="mt-3 font-sans text-[length:var(--text-body)] text-ff-gray-text">
              {subtitle.trim()}
            </p>
          )}
        </header>
        <ul className="grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">
          {items.map((item, i) => {
            const { Icon, color, bg } = CARD_ICONS[i] ?? CARD_ICONS[0]
            return (
              <li
                key={i}
                className="flex flex-col items-center gap-4 rounded-xl bg-ff-warm-gray/60 px-5 py-5 text-center transition-all duration-300 hover:bg-ff-warm-gray/80 hover:-translate-y-0.5 md:px-6 md:py-6 animate-fade-in-up"
                style={{
                  animationDelay: `${i * 100}ms`,
                  animationFillMode: 'both',
                  opacity: 0,
                }}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${bg} ${color} transition-transform duration-300 hover:scale-110`}
                  aria-hidden
                >
                  <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-[length:var(--text-body-lg)] font-bold leading-snug text-ff-near-black">
                    {item.text}
                  </p>
                  {item.subtext?.trim() && (
                    <p className="mt-1.5 font-sans text-[length:var(--text-body-sm)] leading-relaxed text-ff-gray-text">
                      {item.subtext.trim()}
                    </p>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

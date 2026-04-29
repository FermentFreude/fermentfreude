'use client'

import { Media } from '@/components/Media'
import type { Media as MediaType } from '@/payload-types'
import {
  CalendarDays,
  type LucideIcon,
  Package,
  ShieldCheck,
  Users,
  UsersRound,
  Zap,
} from 'lucide-react'

type VoucherBenefitIcon = 'calendar' | 'shield' | 'users' | 'usersRound' | 'zap' | 'package'
type VoucherBenefitIconSource = 'preset' | 'custom'

interface BenefitItem {
  text: string
  subtext?: string | null
  icon?: VoucherBenefitIcon | null
  iconSource?: VoucherBenefitIconSource | null
  customIcon?: MediaType | null
}

interface VoucherBenefitsSectionProps {
  heading: string
  subtitle?: string | null
  benefits: BenefitItem[]
}

const ICON_STYLES: Record<
  VoucherBenefitIcon,
  { Icon: LucideIcon; color: string; bg: string }
> = {
  calendar: { Icon: CalendarDays, color: 'text-emerald-600', bg: 'bg-emerald-500/15' },
  shield: { Icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-500/15' },
  users: { Icon: Users, color: 'text-violet-600', bg: 'bg-violet-500/15' },
  usersRound: { Icon: UsersRound, color: 'text-sky-600', bg: 'bg-sky-500/15' },
  zap: { Icon: Zap, color: 'text-amber-600', bg: 'bg-amber-500/15' },
  package: { Icon: Package, color: 'text-emerald-600', bg: 'bg-emerald-500/15' },
}

const DEFAULT_ICON_ORDER: VoucherBenefitIcon[] = [
  'calendar',
  'shield',
  'users',
  'usersRound',
  'zap',
  'package',
]

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
            const fallbackIcon = DEFAULT_ICON_ORDER[i] ?? DEFAULT_ICON_ORDER[0]
            const selectedIcon = item.icon ?? fallbackIcon
            const { Icon, color, bg } = ICON_STYLES[selectedIcon]
            const customIcon = item.iconSource === 'custom' && item.customIcon ? item.customIcon : null
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
                  {customIcon ? (
                    <Media
                      resource={customIcon}
                      imgClassName="h-5 w-5 object-contain"
                      width={20}
                      height={20}
                      htmlElement={null}
                    />
                  ) : (
                    <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
                  )}
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

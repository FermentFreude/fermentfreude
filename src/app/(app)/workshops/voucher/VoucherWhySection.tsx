'use client'

import type { Media as MediaType } from '@/payload-types'
import { GraduationCap, Heart, Leaf, Sparkles } from 'lucide-react'
import { Media } from '@/components/Media'

export type VoucherWhyBenefitItem = {
  icon: 'sparkle' | 'heart' | 'graduation' | 'leaf'
  title: string
  description: string
}

const DEFAULT_BENEFITS: VoucherWhyBenefitItem[] = [
  {
    icon: 'sparkle',
    title: 'Unforgettable experience',
    description:
      'More than a gift – an experience that inspires and stays long in memory.',
  },
  {
    icon: 'heart',
    title: 'Health & pleasure',
    description:
      'Discover probiotic-rich foods that promote gut health and well-being.',
  },
  {
    icon: 'graduation',
    title: 'Knowledge for life',
    description:
      'Learn traditional techniques that you can always apply – at home and creatively.',
  },
  {
    icon: 'leaf',
    title: 'Sustainable & natural',
    description:
      'Connect with natural food processes and sustainable practices.',
  },
]

const ICON_MAP = {
  sparkle: Sparkles,
  heart: Heart,
  graduation: GraduationCap,
  leaf: Leaf,
}

const ICON_STYLES = {
  sparkle: { bg: 'bg-amber-50', icon: 'text-amber-600' },
  heart: { bg: 'bg-rose-50', icon: 'text-rose-500' },
  graduation: { bg: 'bg-violet-50', icon: 'text-violet-600' },
  leaf: { bg: 'bg-emerald-50', icon: 'text-emerald-600' },
} as const

interface VoucherWhySectionProps {
  heading: string
  body: string
  image?: MediaType | string | null
  benefits?: VoucherWhyBenefitItem[] | null
}

export function VoucherWhySection({
  heading,
  body,
  image,
  benefits,
}: VoucherWhySectionProps) {
  const hasImage = image && typeof image === 'object' && image !== null && 'url' in image
  const paragraphs = body.split(/\n\n+/).filter(Boolean)
  const items = (benefits?.length ?? 0) >= 4 ? benefits! : DEFAULT_BENEFITS

  return (
    <section className="w-full overflow-hidden bg-white py-12 md:py-14">
      <div className="mx-auto max-w-[var(--content-medium)] px-[var(--space-container-x)]">
        {hasImage && (
          <div
            className="relative mx-auto mb-14 max-w-3xl overflow-hidden rounded-[var(--radius-2xl)] bg-ff-warm-gray shadow-[0_8px_30px_rgb(0,0,0,0.08)] animate-fade-in-up"
            style={{ animationDelay: '0ms', animationFillMode: 'both' }}
          >
            <div className="aspect-[3/2] w-full">
              <Media
                resource={image}
                fill
                imgClassName="object-cover transition-transform duration-500 ease-out hover:scale-[1.02]"
                priority
              />
            </div>
          </div>
        )}
        <header className="text-center">
          <h2
            className="whitespace-nowrap font-display font-bold tracking-[var(--tracking-heading)] text-ff-near-black animate-fade-in-up"
            style={{
              fontSize: 'var(--text-heading)',
              lineHeight: 'var(--leading-heading)',
              animationDelay: '80ms',
              animationFillMode: 'both',
            }}
          >
            {heading}
          </h2>
          <div
            className="mx-auto mt-5 h-1 w-20 rounded-full bg-ff-gold-accent animate-fade-in-up"
            style={{ animationDelay: '160ms', animationFillMode: 'both' }}
            aria-hidden
          />
        </header>
        <div
          className="mx-auto mt-8 max-w-[var(--content-narrow)] text-center animate-fade-in-up"
          style={{
            animationDelay: '220ms',
            animationFillMode: 'both',
          }}
        >
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className="font-sans text-ff-gray-text whitespace-pre-line"
              style={{
                fontSize: 'var(--text-body-lg)',
                lineHeight: 1.8,
              }}
            >
              {p}
            </p>
          ))}
        </div>
        <div
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8"
          role="list"
        >
          {items.slice(0, 4).map((item, i) => {
            const IconComponent = ICON_MAP[item.icon]
            const styles = ICON_STYLES[item.icon]
            return (
              <article
                key={i}
                className="group relative flex flex-col rounded-[var(--radius-2xl)] border border-black/[0.04] bg-white text-center shadow-[0_1px_2px_0_rgba(0,0,0,0.03)] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-ff-gold-accent/20 hover:shadow-[0_12px_28px_-8px_rgba(229,183,101,0.15)] animate-fade-in-up"
                style={{
                  animationDelay: `${380 + i * 100}ms`,
                  animationFillMode: 'both',
                }}
                role="listitem"
              >
                <div className="flex flex-col items-center p-8">
                  <div
                    className={`mb-5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${styles.bg} ${styles.icon} transition-transform duration-300 ease-out group-hover:scale-105`}
                    aria-hidden
                  >
                    <IconComponent
                      className="h-6 w-6"
                      strokeWidth={1.75}
                    />
                  </div>
                  <h3
                    className="font-display font-semibold tracking-tight text-ff-near-black"
                    style={{
                      fontSize: 'var(--text-subheading)',
                      lineHeight: 'var(--leading-subheading)',
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="mt-2.5 font-sans text-ff-gray-text"
                    style={{
                      fontSize: 'var(--text-body)',
                      lineHeight: 1.65,
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

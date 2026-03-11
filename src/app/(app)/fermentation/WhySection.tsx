'use client'

import {
  Heart,
  Leaf,
  Sparkles,
  Shield,
  User,
  BookOpen,
  type LucideIcon,
} from 'lucide-react'
import Image from 'next/image'

const WHY_ICONS: LucideIcon[] = [
  Heart,
  Leaf,
  Sparkles,
  Shield,
  User,
  BookOpen,
]

const CARD_ACCENTS = [
  'from-[#FAF2E0] via-[#F9F0DC] to-[#EDD195]/30',
  'from-[#F5F0E8] via-[#FAF2E0] to-[#E6BE68]/20',
  'from-[#F9F0DC] via-[#FAF2E0] to-[#EDD195]/25',
]

function isResolvedMedia(img: unknown): img is { url: string } {
  return typeof img === 'object' && img !== null && 'url' in img && typeof (img as { url?: unknown }).url === 'string'
}

export interface WhyItem {
  id?: string | null
  title: string
  description: string
}

interface WhySectionProps {
  title: string
  items: WhyItem[]
  image?: unknown
}

export function WhySection({ title, items, image }: WhySectionProps) {
  return (
    <div className="relative content-wide mx-auto px-4 sm:px-6">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2 -translate-y-1/2 size-[500px] rounded-full bg-[#E6BE68]/5 blur-[100px]" aria-hidden />
      <div className="pointer-events-none absolute -left-32 top-1/3 -z-10 size-64 rounded-full bg-[#EDD195]/10 blur-[80px]" aria-hidden />
      <div className="pointer-events-none absolute -right-32 bottom-1/4 -z-10 size-80 rounded-full bg-[#E6BE68]/8 blur-[90px]" aria-hidden />

      {/* Floating dots — some with pulse */}
      <div className="pointer-events-none absolute left-[10%] top-20 size-2 animate-pulse rounded-full bg-[#E6BE68]/30" aria-hidden style={{ animationDuration: '2s' }} />
      <div className="pointer-events-none absolute right-[15%] top-32 size-3 rounded-full bg-[#EDD195]/40" aria-hidden />
      <div className="pointer-events-none absolute left-[20%] bottom-24 size-2 animate-pulse rounded-full bg-[#E6BE68]/25" aria-hidden style={{ animationDuration: '2.5s' }} />
      <div className="pointer-events-none absolute right-[8%] bottom-32 size-2.5 rounded-full bg-[#555954]/20" aria-hidden />
      <div className="pointer-events-none absolute left-1/2 top-40 size-1.5 -translate-x-1/2 rounded-full bg-[#EDD195]/30" aria-hidden />

      {/* Dot grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.4]"
        aria-hidden
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #E6BE68 0.5px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="mb-4 text-center">
        <span className="font-display text-caption font-bold uppercase tracking-[0.25em] text-[#E6BE68]">
          Benefits
        </span>
      </div>
      <h2 className="font-display text-section-heading font-bold tracking-tight text-ff-black text-center mb-8 md:mb-10">
        {title}
      </h2>

      <div className="relative rounded-3xl bg-white/30 p-6 sm:p-8 backdrop-blur-[1px]">
        <div className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const Icon = WHY_ICONS[i % WHY_ICONS.length]
            const accent = CARD_ACCENTS[i % CARD_ACCENTS.length]
            const stagger = i % 2 === 1 ? 'sm:mt-6 lg:mt-8' : ''
            const rotate = i % 3 === 0 ? 'hover:rotate-[-0.5deg]' : i % 3 === 1 ? 'hover:rotate-[0.5deg]' : ''
            const num = String(i + 1).padStart(2, '0')
            return (
              <div
                key={item.id ?? i}
                className={`group relative flex flex-col items-center overflow-hidden rounded-3xl bg-gradient-to-br ${accent} p-8 sm:p-9 text-center shadow-lg transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#E6BE68]/15 ${stagger} ${rotate}`}
              >
                {/* Number badge */}
                <div className="absolute left-4 top-4 font-display text-3xl font-bold text-[#E6BE68]/30 transition-colors group-hover:text-[#E6BE68]/50">
                  {num}
                </div>
                {/* Corner glow */}
                <div className="absolute -right-12 -top-12 size-40 rounded-full bg-[#E6BE68]/20 blur-3xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-80" />
                {/* Icon with float animation */}
                <div className="relative mb-5 flex size-16 items-center justify-center rounded-2xl bg-white/70 text-[#555954] shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:bg-white [&>svg]:animate-[gentle-float_3s_ease-in-out_infinite]">
                  <Icon className="size-8" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-title font-bold leading-tight text-ff-black relative">
                  {item.title}
                </h3>
                <p className="mt-4 text-body leading-relaxed text-ff-black/85 sm:text-body-lg relative flex-1 max-w-sm">
                  {item.description}
                </p>
                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-1/2 h-1 w-0 -translate-x-1/2 rounded-full bg-[#E6BE68] transition-all duration-500 group-hover:w-24" />
              </div>
            )
          })}
        </div>
      </div>
      {isResolvedMedia(image) && (
        <>
          <div className="mt-14 flex items-center justify-center gap-4">
            <div className="h-px flex-1 max-w-24 bg-gradient-to-r from-transparent to-[#E6BE68]/40" />
            <span className="font-display text-caption font-bold uppercase tracking-[0.2em] text-[#E6BE68]/60">
              See the magic
            </span>
            <div className="h-px flex-1 max-w-24 bg-gradient-to-l from-transparent to-[#E6BE68]/40" />
          </div>
          <div className="mt-8 flex justify-center">
            <div className="relative aspect-video w-full max-w-2xl overflow-hidden rounded-3xl shadow-xl">
              <Image
                src={image.url}
                alt=""
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, 672px"
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

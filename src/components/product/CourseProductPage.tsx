'use client'

import { AddToCart } from '@/components/Cart/AddToCart'
import { FadeIn } from '@/components/FadeIn'
import { Media as MediaComp } from '@/components/Media'
import { Price } from '@/components/Price'
import type { Media, Product } from '@/payload-types'
import { BookOpen, CheckCircle2, Clock, Download, Globe, PlayCircle, Star, Zap } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

// ─── Hardcoded defaults (EN) — CMS always wins ───────────────────────────────

const DEFAULT_EYEBROW = 'Online Course'
const DEFAULT_TITLE = 'Basic Fermentation Course'
const DEFAULT_SUBTITLE =
  'Everything you need to safely ferment vegetables, drinks, and more at home — at your own pace.'
const DEFAULT_STATS = [
  { icon: BookOpen, label: '45 lessons', value: '45' },
  { icon: Clock, label: '6 hours', value: '6h' },
  { icon: Globe, label: 'Lifetime access' },
  { icon: Download, label: 'Offline materials' },
]
const DEFAULT_LEARN = [
  'Ferment sauerkraut, kimchi, and pickles from scratch',
  'Master safe brine ratios and dry-salting techniques',
  'Brew kombucha, water kefir, and jun tea at home',
  'Understand fermentation science and food safety',
  'Troubleshoot common fermentation problems',
  'Build a sustainable fermentation habit at home',
]
const DEFAULT_TESTIMONIALS = [
  {
    quote:
      'Finally a course that explains the science without making it boring. My sauerkraut is perfect now.',
    name: 'Anna K.',
    city: 'Berlin',
  },
  {
    quote:
      'I tried fermenting before and always failed. After this course I have 8 jars on my shelf.',
    name: 'Thomas M.',
    city: 'Munich',
  },
  {
    quote:
      'The video lessons are short and practical. I watched one lesson and immediately went to the kitchen.',
    name: 'Marie B.',
    city: 'Hamburg',
  },
]
const DEFAULT_MODULE_PREVIEW = [
  {
    title: 'Introduction to Fermentation',
    lesson_count: 5,
    free: true,
    description: 'What fermentation is, why it works, and how to start safely.',
  },
  {
    title: 'Vegetable Fermentation',
    lesson_count: 8,
    free: false,
    description: 'Sauerkraut, kimchi, pickles — classic recipes with modern technique.',
  },
  {
    title: 'Salt, Brine & Technique',
    lesson_count: 6,
    free: false,
    description: 'Dry-salting vs. brine immersion — when and why to use each.',
  },
  {
    title: 'Fermented Beverages',
    lesson_count: 7,
    free: false,
    description: 'Kombucha, water kefir, jun — step-by-step from starter to bottle.',
  },
  {
    title: 'Safety & Science',
    lesson_count: 5,
    free: false,
    description: 'Understanding pH, lacto-bacteria, and why fermented food is safe.',
  },
  {
    title: 'Troubleshooting & Next Steps',
    lesson_count: 4,
    free: false,
    description: 'How to fix common problems and plan your fermentation routine.',
  },
]

function isMedia(v: unknown): v is Media {
  return typeof v === 'object' && v !== null && 'url' in v
}

function StarRating({ rating = 4.9 }: { rating?: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i <= Math.round(rating) ? 'fill-ff-gold-accent text-ff-gold-accent' : 'text-ff-gray-text/30'}`}
        />
      ))}
      <span className="ml-1 text-body-sm font-semibold text-ff-gray-text">{rating.toFixed(1)}</span>
    </div>
  )
}

function CurriculumRow({
  mod,
  index,
}: {
  mod: (typeof DEFAULT_MODULE_PREVIEW)[number]
  index: number
}) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-ff-border-light last:border-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-4 px-5 text-left transition hover:bg-ff-cream/40 focus:outline-none"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-ff-gold-accent/15 font-display text-[11px] font-bold text-ff-gold-accent-dark">
            {index + 1}
          </span>
          <span className="font-display text-body font-semibold text-ff-near-black truncate">
            {mod.title}
          </span>
          {mod.free && (
            <span className="shrink-0 inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-green-700">
              Free Preview
            </span>
          )}
        </div>
        <div className="ml-4 flex shrink-0 items-center gap-3 text-ff-gray-text text-body-sm">
          <span>{mod.lesson_count} lessons</span>
          <svg
            className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-body-sm text-ff-gray-text leading-relaxed">{mod.description}</p>
        </div>
      )}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export function CourseProductPage({ product }: { product: Product }) {
  const price = product.priceInEUR as number | undefined
  const heroImage = isMedia(product.meta?.image) ? product.meta?.image : undefined
  const galleryFirst = product.gallery?.[0]?.image
  const coverImage = heroImage ?? (isMedia(galleryFirst) ? galleryFirst : undefined)

  const title = product.title ?? DEFAULT_TITLE

  return (
    <>
      {/* ─── 1. HERO ───────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)' }}
      >
        {/* Background texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />

        <div className="container relative mx-auto container-padding py-20 md:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left — text */}
            <FadeIn>
              <div className="max-w-xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-ff-gold-accent/40 bg-ff-gold-accent/10 px-4 py-1.5">
                  <PlayCircle className="h-3.5 w-3.5 text-ff-gold-accent" />
                  <span className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-ff-gold-accent">
                    {DEFAULT_EYEBROW}
                  </span>
                </div>
                <h1 className="font-display text-[2.6rem] leading-[1.1] font-bold tracking-tight text-white md:text-5xl">
                  {title}
                </h1>
                <p className="mt-5 text-body-lg leading-relaxed text-white/70">
                  {DEFAULT_SUBTITLE}
                </p>

                {/* Rating */}
                <div className="mt-5 flex items-center gap-3">
                  <StarRating />
                  <span className="text-body-sm text-white/50">· 124 students</span>
                </div>

                {/* Stat pills */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {DEFAULT_STATS.map(({ icon: Icon, label }) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-1.5 text-[12px] font-medium text-white/80"
                    >
                      <Icon className="h-3.5 w-3.5 text-ff-gold-accent/80 shrink-0" />
                      {label}
                    </span>
                  ))}
                </div>

                {/* Price + CTA */}
                <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div>
                    {typeof price === 'number' && (
                      <Price
                        amount={price}
                        className="font-display text-[2.6rem] font-bold text-white leading-none"
                      />
                    )}
                    <p className="mt-1 text-[11px] text-white/40 uppercase tracking-wide font-medium">
                      One-time · Lifetime access
                    </p>
                  </div>
                  <div className="sm:ml-4">
                    <AddToCart product={product} />
                  </div>
                </div>

                {/* Trust line */}
                <p className="mt-4 text-[11px] text-white/40">
                  Already enrolled?{' '}
                  <Link
                    href="/courses/basic-fermentation"
                    className="text-ff-gold-accent/80 underline underline-offset-2 hover:text-ff-gold-accent transition"
                  >
                    Go to your course →
                  </Link>
                </p>
              </div>
            </FadeIn>

            {/* Right — cover image */}
            <FadeIn delay={120}>
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {coverImage ? (
                  <div className="relative overflow-hidden rounded-3xl shadow-2xl ring-1 ring-white/10">
                    <MediaComp
                      resource={coverImage}
                      className="aspect-4/3 w-full object-cover"
                      priority
                    />
                    {/* Play overlay on image */}
                    <Link
                      href="/courses/basic-fermentation"
                      className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity hover:opacity-100 rounded-3xl"
                      aria-label="Preview first lesson"
                    >
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 shadow-lg">
                        <PlayCircle className="h-8 w-8 text-ff-near-black" />
                      </div>
                    </Link>
                  </div>
                ) : (
                  <div className="aspect-4/3 w-full rounded-3xl bg-white/5 ring-1 ring-white/10" />
                )}
                {/* Floating badge */}
                <div className="absolute -bottom-4 -right-4 hidden rounded-2xl bg-ff-gold-accent px-5 py-3 shadow-xl md:block">
                  <p className="font-display text-[11px] font-bold uppercase tracking-widest text-ff-near-black">
                    Free Preview
                  </p>
                  <p className="text-[11px] text-ff-near-black/70">First 2 lessons</p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── 2. WHAT YOU'LL LEARN ───────────────────────────────────── */}
      <section className="bg-white py-20 md:py-24">
        <div className="container mx-auto container-padding">
          <FadeIn>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-ff-gold-accent">
                Your Takeaways
              </p>
              <h2 className="mt-2 font-display text-section-heading font-bold text-ff-near-black">
                What You&apos;ll Learn
              </h2>
              <div className="mx-auto mt-3 h-1 w-14 rounded-full bg-ff-gold-accent" aria-hidden />
            </div>
          </FadeIn>

          <FadeIn delay={80}>
            <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {DEFAULT_LEARN.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-ff-border-light bg-ff-cream/30 p-5 transition hover:border-ff-gold-accent/30 hover:shadow-sm"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-ff-gold-accent" />
                  <span className="text-body text-ff-near-black leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </FadeIn>
        </div>
      </section>

      {/* ─── 3. CURRICULUM PREVIEW ─────────────────────────────────── */}
      <section style={{ backgroundColor: 'var(--ff-cream)' }} className="py-20 md:py-24">
        <div className="container mx-auto container-padding">
          <FadeIn>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-ff-gold-accent">
                Course Structure
              </p>
              <h2 className="mt-2 font-display text-section-heading font-bold text-ff-near-black">
                Course Curriculum
              </h2>
              <p className="mt-3 text-body text-ff-gray-text">
                {DEFAULT_MODULE_PREVIEW.reduce((s, m) => s + m.lesson_count, 0)} lessons across{' '}
                {DEFAULT_MODULE_PREVIEW.length} modules — structured for beginners, complete for
                everyone.
              </p>
              <div className="mx-auto mt-3 h-1 w-14 rounded-full bg-ff-gold-accent" aria-hidden />
            </div>
          </FadeIn>

          <FadeIn delay={80}>
            <div className="mx-auto mt-10 max-w-2xl overflow-hidden rounded-2xl border border-ff-border-light bg-white shadow-sm">
              {DEFAULT_MODULE_PREVIEW.map((mod, i) => (
                <CurriculumRow key={i} mod={mod} index={i} />
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={160}>
            <div className="mt-8 text-center">
              <Link
                href="/courses/basic-fermentation"
                className="inline-flex items-center gap-2 text-body-sm font-semibold text-ff-near-black underline underline-offset-4 hover:text-ff-gold-accent-dark transition"
              >
                Preview the first 2 lessons for free →
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── 4. TESTIMONIALS ──────────────────────────────────────────── */}
      <section className="bg-white py-20 md:py-24">
        <div className="container mx-auto container-padding">
          <FadeIn>
            <div className="mx-auto max-w-2xl text-center">
              <p className="font-display text-[11px] font-bold uppercase tracking-[0.18em] text-ff-gold-accent">
                Student Reviews
              </p>
              <h2 className="mt-2 font-display text-section-heading font-bold text-ff-near-black">
                What Students Say
              </h2>
              <div className="mx-auto mt-3 h-1 w-14 rounded-full bg-ff-gold-accent" aria-hidden />
            </div>
          </FadeIn>

          <FadeIn delay={80}>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {DEFAULT_TESTIMONIALS.map((t, i) => (
                <div
                  key={i}
                  className="flex flex-col rounded-2xl border border-ff-border-light bg-ff-cream/30 p-6"
                >
                  <StarRating />
                  <blockquote className="mt-4 flex-1 text-body text-ff-near-black leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <p className="mt-4 text-body-sm font-semibold text-ff-gray-text">
                    {t.name} · {t.city}
                  </p>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── 5. FINAL CTA ────────────────────────────────────────────── */}
      <section
        className="py-20 md:py-28"
        style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%)' }}
      >
        <div className="container mx-auto container-padding text-center">
          <FadeIn>
            <Zap className="mx-auto mb-4 h-8 w-8 text-ff-gold-accent" />
            <h2 className="font-display text-[2rem] font-bold text-white md:text-[2.6rem] leading-tight">
              Start Fermenting Today
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-body-lg text-white/60 leading-relaxed">
              Lifetime access. Watch at your own pace. Your kitchen will never be the same.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              {typeof price === 'number' && (
                <Price amount={price} className="font-display text-3xl font-bold text-white" />
              )}
              <AddToCart product={product} />
            </div>
            <p className="mt-5 text-[11px] text-white/30">
              First 2 lessons free ·{' '}
              <Link
                href="/courses/basic-fermentation"
                className="text-ff-gold-accent/60 hover:text-ff-gold-accent underline underline-offset-2 transition"
              >
                Preview before you buy
              </Link>
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ─── Sticky bottom bar (mobile) ───────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 z-50 border-t border-ff-border-light bg-white/95 backdrop-blur-sm px-4 py-3 sm:hidden shadow-lg">
        <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
          <div>
            {typeof price === 'number' && (
              <Price amount={price} className="font-display text-xl font-bold text-ff-near-black" />
            )}
            <p className="text-[10px] text-ff-gray-text">Lifetime access</p>
          </div>
          <AddToCart product={product} />
        </div>
      </div>
    </>
  )
}

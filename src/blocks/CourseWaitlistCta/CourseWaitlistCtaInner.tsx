'use client'

import type { ReactNode } from 'react'

import { WaitlistForm } from '@/blocks/CourseWaitlistCta/WaitlistForm'
import { FadeIn } from '@/components/FadeIn'
import Image from 'next/image'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { cn } from '@/utilities/cn'
import { Bell, Mail, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'

type Props = {
  id?: string
  heading: string
  paragraphs: string[]
  emailPlaceholder: string
  submitLabel: string
  successMessage: string
  locale: 'de' | 'en'
  /** Fallback when server <Media /> slot does not cross the RSC/client boundary */
  waitlistImageUrl?: string
  waitlistImageAlt?: string
  /** Optional server-rendered image — pass as children from the server block */
  children?: ReactNode
}

function FloatingAccent({
  className,
  children,
  duration,
}: {
  className?: string
  children: React.ReactNode
  duration: number
}) {
  const reduce = usePrefersReducedMotion()
  return (
    <motion.div
      className={cn('pointer-events-none absolute text-ff-gold-accent/35', className)}
      aria-hidden
      animate={reduce ? undefined : { y: [0, -8, 0], rotate: [0, 4, 0, -4, 0] }}
      transition={reduce ? undefined : { duration, repeat: Infinity, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

export function CourseWaitlistCtaInner({
  id,
  heading,
  paragraphs,
  emailPlaceholder,
  submitLabel,
  successMessage,
  locale,
  waitlistImageUrl,
  waitlistImageAlt = '',
  children: imageSlot,
}: Props) {
  const reduce = usePrefersReducedMotion()

  const urlFallback =
    !imageSlot && waitlistImageUrl ? (
      <div className="relative mx-auto aspect-[496/320] w-full max-w-xl overflow-hidden rounded-2xl border border-ff-border-light/50 bg-[#ECE5DE] shadow-md lg:mx-0 lg:max-w-none">
        <Image
          src={waitlistImageUrl}
          alt={waitlistImageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 50vw"
          unoptimized
        />
      </div>
    ) : null

  const visualImageSlot = imageSlot ?? urlFallback
  const hasImage = Boolean(visualImageSlot)

  const headerBlock = (
    <>
      <FadeIn delay={0} duration={1.1}>
        {!hasImage && (
          <div className="mb-5 flex justify-center lg:justify-start">
            <div
              className="inline-flex items-center gap-2.5 rounded-2xl border border-ff-gold-accent/25 bg-white/80 px-3 py-2.5 shadow-sm backdrop-blur-sm"
              aria-hidden
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-ff-gold-accent/15 ring-1 ring-ff-gold-accent/30">
                <Mail className="size-5 text-ff-olive" strokeWidth={2} aria-hidden />
              </span>
              <Sparkles className="size-5 text-ff-gold-accent-dark" strokeWidth={2} aria-hidden />
            </div>
          </div>
        )}
        <h2
          id={id ? `${id}-heading` : undefined}
          className={cn(
            'font-display text-section-heading font-bold leading-[1.12] tracking-[-0.03em] text-ff-near-black [text-wrap:balance]',
            hasImage && 'mt-0',
          )}
        >
          {heading}
        </h2>
        <motion.div
          className="mx-auto mt-5 h-0.5 w-14 origin-center rounded-full bg-gradient-to-r from-ff-gold-light via-ff-gold-accent to-ff-gold-accent-dark lg:mx-0 lg:origin-left"
          aria-hidden
          initial={reduce ? false : { scaleX: 0, opacity: 0 }}
          whileInView={reduce ? undefined : { scaleX: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        />
      </FadeIn>
    </>
  )

  const bodyBlock = (
    <FadeIn delay={120} duration={1.1} from="bottom">
      <div className="space-y-4 text-body-lg leading-relaxed text-ff-gray-text">
        {paragraphs.map((p, i) => (
          <p key={i} className="whitespace-pre-line [text-wrap:pretty]">
            {p}
          </p>
        ))}
      </div>
    </FadeIn>
  )

  const formBlock = (
    <div className="lg:pt-1">
      <FadeIn delay={220} duration={1.15} from="right">
        <WaitlistForm
          emailPlaceholder={emailPlaceholder}
          submitLabel={submitLabel}
          successMessage={successMessage}
          locale={locale}
        />
      </FadeIn>
    </div>
  )

  return (
    <div className="relative">
      <FloatingAccent className="left-2 top-2 hidden sm:block" duration={5}>
        <Sparkles className="size-7" strokeWidth={1.25} />
      </FloatingAccent>
      <FloatingAccent className="right-4 top-[28%] hidden md:block" duration={6.5}>
        <Bell className="size-6" strokeWidth={1.25} />
      </FloatingAccent>

      {hasImage ? (
        <div className="relative grid gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-12 xl:gap-16">
          {/* Reference layout: image left on desktop; content first on small screens */}
          {/* No FadeIn here — GSAP keeps opacity:0 until ScrollTrigger; image stayed invisible */}
          <div className="order-2 flex w-full justify-center lg:order-1 lg:items-center lg:justify-start">
            {visualImageSlot}
          </div>
          <div className="order-1 flex flex-col text-center lg:order-2 lg:justify-center lg:text-left">
            {headerBlock}
            <div className="mt-6 lg:mt-5">{bodyBlock}</div>
            <div className="mt-8 lg:mt-10">{formBlock}</div>
          </div>
        </div>
      ) : (
        <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,40rem)] lg:items-center lg:gap-16 xl:gap-20">
          <div className="text-center lg:text-left">
            {headerBlock}
            <div className="mt-6">{bodyBlock}</div>
          </div>
          {formBlock}
        </div>
      )}
    </div>
  )
}

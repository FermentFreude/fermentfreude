'use client'

import { ScrollCue } from '@/components/ScrollCue'
import { GiftSlide } from './GiftSlide'
import { SectionHeader } from '@/components/SectionHeader'
import { Media } from '@/components/Media'
import type { Media as MediaType, VoucherCtaBlock as VoucherCtaBlockType } from '@/payload-types'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { EasePack } from 'gsap/EasePack'
import { Flip } from 'gsap/Flip'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useMotionValue } from 'motion/react'
import Link from 'next/link'
import React, { useCallback, useEffect, useRef, useState } from 'react'

gsap.registerPlugin(ScrollTrigger, Flip, EasePack)

const DEFAULTS = {
  eyebrow: '',
  heading: 'Gift a special tasty experience',
  description: 'Share a tasty experience with someone special.',
  buttonLabel: 'Voucher',
  buttonLink: '/workshops/voucher',
}

type Props = VoucherCtaBlockType & {
  id?: string
  backgroundImage?: string | MediaType | null
}

export const VoucherCtaBlock: React.FC<Props> = ({
  visible,
  eyebrow,
  heading,
  description,
  buttonLabel,
  buttonLink,
  galleryImages,
  voucherImage,
  backgroundImage,
  backgroundTheme,
  customBackgroundColor,
  overlayOpacity,
  giftSlide,
  id,
}) => {
  const giftOn = Boolean(giftSlide?.enabled)
  const resolvedEyebrow =
    eyebrow != null && String(eyebrow).trim() !== '' ? String(eyebrow).trim() : DEFAULTS.eyebrow
  const resolvedHeading = heading ?? DEFAULTS.heading
  const resolvedDescription = description ?? DEFAULTS.description
  const resolvedButtonLabel = buttonLabel ?? DEFAULTS.buttonLabel
  const resolvedButtonLink = buttonLink ?? DEFAULTS.buttonLink

  // Background theme — controls panel bg color, text color, and image overlay tint
  const theme = backgroundTheme ?? 'light'
  const isDark = theme === 'dark'
  const isCustom = theme === 'custom'

  // Panel background (used when no image present)
  const panelBgColor = isCustom
    ? customBackgroundColor && customBackgroundColor.trim() !== ''
      ? customBackgroundColor
      : '#F6F0E8'
    : isDark
      ? '#1a1a1a'
      : '#F6F0E8'

  // When a background image is present we always use a dark scrim + white text
  // (matches the Kombucha / Tempeh voucher CTA look). The admin overlayOpacity
  // (0–90%) only controls the strength of that scrim. Defaults to 55%.
  const hasVoucherImage =
    typeof voucherImage === 'object' && voucherImage !== null && 'url' in voucherImage
  const hasBgImage = backgroundImage != null
  const overlayPct = Math.min(90, Math.max(0, overlayOpacity ?? 55))
  const overlayAlpha = overlayPct / 100
  const overlayColor = hasBgImage ? '#000000' : panelBgColor

  // Text colors — white on image, dark on light panel, white on dark panel
  const useWhiteText = hasBgImage || isDark
  const ctaBorderClass = useWhiteText
    ? 'border-white/40 text-white hover:border-white hover:bg-white hover:text-ff-near-black'
    : 'border-ff-charcoal/35 text-ff-near-black hover:border-ff-charcoal hover:bg-ff-charcoal hover:text-white'

  const sectionRef = useRef<HTMLElement>(null)
  const galleryWrapRef = useRef<HTMLDivElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const flipCtxRef = useRef<ReturnType<typeof gsap.context> | null>(null)
  /** Gift slide on: the pin lasts one more screen so the card can slide up over the open gallery */
  const giftOnRef = useRef(giftOn)
  giftOnRef.current = giftOn
  const giftCardRef = useRef<HTMLDivElement>(null)

  /* ── Scroll cue (capsule at the right edge of the gallery) ──
   * Shown while the gallery is on screen and not fully open. The gesture
   * hides while you scroll; once you stop it points the way you last went
   * (down, or up if you scrolled back). At the end the capsule fades out. */
  const cueProgress = useMotionValue(0)
  const [cueInView, setCueInView] = useState(false)
  const [cueEnded, setCueEnded] = useState(false)
  const [cueResting, setCueResting] = useState(true)
  const [cueDirection, setCueDirection] = useState<'down' | 'up'>('down')
  const cueRef = useRef<{ start: number | null; idle?: ReturnType<typeof setTimeout> }>({
    start: null,
  })

  /** Called by the gallery's ScrollTrigger on every update */
  const onGalleryProgress = useCallback(
    (p: number) => {
      const cue = cueRef.current
      cueProgress.set(p)
      setCueEnded(p >= 0.98)
      if (cue.start === null) cue.start = p
      setCueResting(false)
      clearTimeout(cue.idle)
      cue.idle = setTimeout(() => {
        const now = cueProgress.get()
        const net = now - (cue.start ?? now)
        if (now <= 0.01) setCueDirection('down')
        else if (net > 0.01) setCueDirection('down')
        else if (net < -0.01) setCueDirection('up')
        cue.start = null
        setCueResting(true)
      }, 600)
    },
    [cueProgress],
  )
  const onGalleryProgressRef = useRef(onGalleryProgress)
  onGalleryProgressRef.current = onGalleryProgress

  useEffect(() => {
    const wrap = galleryWrapRef.current
    if (!wrap) return
    const observer = new IntersectionObserver(([entry]) => setCueInView(!!entry?.isIntersecting), {
      threshold: 0.5,
    })
    observer.observe(wrap)
    const cue = cueRef.current
    return () => {
      observer.disconnect()
      clearTimeout(cue.idle)
    }
  }, [])

  const createFlip = useCallback(() => {
    const galleryEl = galleryRef.current
    const galleryWrap = galleryWrapRef.current
    if (!galleryEl || !galleryWrap) return

    const items = galleryEl.querySelectorAll('.bento-gallery__item')
    if (items.length === 0) return

    // Revert previous context if resizing
    if (flipCtxRef.current) {
      flipCtxRef.current.revert()
    }
    galleryEl.classList.remove('bento-gallery--final')

    flipCtxRef.current = gsap.context(() => {
      // Temporarily add final class to capture expanded state
      galleryEl.classList.add('bento-gallery--final')
      const flipState = Flip.getState(items)
      galleryEl.classList.remove('bento-gallery--final')

      // Flip from compact bento → full-viewport panels
      const flip = Flip.to(flipState, {
        simple: true,
        ease: 'expoScale(1, 5)',
      })

      /* With the gift slide the pinned scene has three parts (screens of scroll):
       *   1    the gallery opens
       *   1.4  the gift card rises over it — slower than the scroll, easing into place
       *   0.4  it rests a moment before the page scrolls on (soft landing, no hard stop) */
      const giftCard = giftOnRef.current ? giftCardRef.current : null
      const OPEN = 1
      const RISE = 1.4
      const REST = 0.4
      const screens = giftCard ? OPEN + RISE + REST : OPEN
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: galleryEl,
          start: 'center center',
          end: `+=${screens * 100}%`,
          // Number = seconds the animation takes to catch up with the scroll.
          // `true` followed every wheel step exactly, which felt jerky.
          scrub: 0.8,
          pin: galleryWrap,
          // Starts pinning a moment early so a fast scroll doesn't overshoot and snap back
          anticipatePin: 1,
          invalidateOnRefresh: true,
          // The scroll cue only follows the opening part
          onUpdate: (self) =>
            onGalleryProgressRef.current(Math.min(1, (self.progress * screens) / OPEN)),
        },
      })
      tl.add(flip)
      if (giftCard) {
        const unit = flip.duration() / OPEN
        // y: 0 replaces the markup's translateY(100%) (no flash before JS) instead of adding to it
        tl.fromTo(
          giftCard,
          { y: 0, yPercent: 100 },
          { y: 0, yPercent: 0, ease: 'power2.out', duration: RISE * unit },
        )
        tl.to({}, { duration: REST * unit })
      }

      return () => gsap.set(items, { clearProps: 'all' })
    })
  }, [])

  useGSAP(
    () => {
      createFlip()

      // Recreate on resize — debounced, and only when the width changes:
      // a height-only resize is the mobile address bar, and rebuilding the
      // pinned gallery mid-scroll made the page jump.
      let lastWidth = window.innerWidth
      let resizeTimer: ReturnType<typeof setTimeout> | undefined
      const onResize = () => {
        if (window.innerWidth === lastWidth) return
        lastWidth = window.innerWidth
        clearTimeout(resizeTimer)
        resizeTimer = setTimeout(createFlip, 200)
      }
      window.addEventListener('resize', onResize)
      const cleanupResize = () => {
        clearTimeout(resizeTimer)
        window.removeEventListener('resize', onResize)
      }

      /* ── Text reveal animation ── */
      const section = sectionRef.current
      if (!section) return cleanupResize

      const eyebrowEl = section.querySelector('[data-anim="eyebrow"]')
      const headingEl = section.querySelector('[data-anim="heading"]')
      const descEl = section.querySelector('[data-anim="desc"]')
      const ctaEl = section.querySelector('[data-anim="cta"]')
      const contentEl = section.querySelector('[data-anim="content"]')
      // Gift slide replaces the text panel — nothing to reveal here
      if (!contentEl)
        return () => {
          cleanupResize()
          flipCtxRef.current?.revert()
        }

      if (eyebrowEl) gsap.set(eyebrowEl, { y: 28, opacity: 0 })
      gsap.set(headingEl, { y: 50, opacity: 0 })
      gsap.set(descEl, { y: 35, opacity: 0 })
      gsap.set(ctaEl, { y: 25, opacity: 0, scale: 0.92 })

      const textTl = gsap.timeline({
        scrollTrigger: {
          trigger: contentEl,
          start: 'top 88%',
          once: true,
        },
      })

      if (eyebrowEl) {
        textTl.to(eyebrowEl, { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out' })
      }
      textTl
        .to(
          headingEl,
          { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
          eyebrowEl ? '-=0.35' : 0,
        )
        .to(descEl, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.5')
        .to(ctaEl, { y: 0, opacity: 1, scale: 1, duration: 0.65, ease: 'back.out(1.7)' }, '-=0.4')

      return () => {
        cleanupResize()
        flipCtxRef.current?.revert()
      }
    },
    { scope: sectionRef, dependencies: [galleryImages, createFlip, eyebrow, giftOn] },
  )

  if (visible === false) return null

  const images = galleryImages ?? []

  return (
    <section ref={sectionRef} id={id ?? undefined} className="w-full">
      {/* ── Bento Gallery (pinned on scroll) ── */}
      <div ref={galleryWrapRef} className="bento-gallery-wrap">
        {/* Gift slide — part of the pinned scene: starts below the screen and is
            scrolled up over the open gallery by the timeline above */}
        {giftOn && giftSlide ? (
          <div
            ref={giftCardRef}
            className="absolute inset-0 z-20 overflow-clip rounded-t-[2rem] shadow-[0_-24px_60px_-20px_rgba(0,0,0,0.35)] md:rounded-t-[2.5rem]"
            // Paper colour behind the slide, so the strip under the browser bar matches
            style={{ transform: 'translateY(100%)', backgroundColor: '#F5E7D6' }}
          >
            <GiftSlide data={giftSlide} />
          </div>
        ) : null}
        {/* Scroll cue — right edge, vertically centred */}
        {images.length > 0 ? (
          <div className="absolute right-3 top-1/2 z-10 -translate-y-1/2 md:right-6">
            <ScrollCue
              progress={cueProgress}
              visible={cueInView && !cueEnded}
              resting={cueResting}
              direction={cueDirection}
            />
          </div>
        ) : null}
        <div ref={galleryRef} className="bento-gallery bento-gallery--bento">
          {images.slice(0, 8).map((item, i) => {
            const _img = typeof item.image === 'object' ? (item.image as MediaType) : null
            return (
              <div key={item.id ?? i} className="bento-gallery__item" data-flip-id={`bento-${i}`}>
                {item.image ? (
                  <Media
                    resource={item.image}
                    fill
                    imgClassName="object-cover"
                    className="absolute inset-0"
                  />
                ) : (
                  <div className="bento-gallery__placeholder" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {giftOn && giftSlide ? null : (
        <>
          {/* ── Text + Button below gallery ── */}
          <div
            data-anim="content"
            className="relative overflow-hidden section-padding-md"
            style={{ backgroundColor: panelBgColor }}
          >
            {backgroundImage ? (
              <>
                <div className="absolute inset-0">
                  <Media resource={backgroundImage} fill imgClassName="object-cover" />
                </div>
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: overlayColor, opacity: overlayAlpha }}
                  aria-hidden
                />
              </>
            ) : null}

            {/* Shared editorial header, left-aligned; data-anim hooks keep the GSAP text reveal.
              With a voucher picture: text left + picture right on desktop, picture below on mobile. */}
            <div
              className={`container relative z-10 mx-auto container-padding ${
                hasVoucherImage ? 'grid items-center gap-10 lg:grid-cols-2 lg:gap-16' : ''
              }`}
            >
              <div>
                <SectionHeader
                  tone={useWhiteText ? 'light' : 'dark'}
                  eyebrow={resolvedEyebrow}
                  heading={resolvedHeading}
                  intro={resolvedDescription}
                  eyebrowProps={
                    { 'data-anim': 'eyebrow' } as React.HTMLAttributes<HTMLParagraphElement>
                  }
                  headingProps={
                    { 'data-anim': 'heading' } as React.HTMLAttributes<HTMLHeadingElement>
                  }
                  introProps={{ 'data-anim': 'desc' } as React.HTMLAttributes<HTMLParagraphElement>}
                />
                <Link
                  data-anim="cta"
                  href={resolvedButtonLink}
                  className={`mt-8 inline-flex items-center justify-center rounded-full border-2 bg-transparent px-6 py-2.5 font-display text-base font-bold uppercase tracking-widest transition-all hover:scale-[1.03] active:scale-[0.97] ${ctaBorderClass}`}
                >
                  {resolvedButtonLabel}
                </Link>
              </div>
              {hasVoucherImage ? (
                <div data-anim="voucher-image" className="overflow-hidden rounded-3xl">
                  <Media
                    resource={voucherImage}
                    imgClassName="h-auto w-full"
                    size="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </>
      )}
    </section>
  )
}

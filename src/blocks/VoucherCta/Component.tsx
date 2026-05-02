'use client'

import { Media } from '@/components/Media'
import type { Media as MediaType, VoucherCtaBlock as VoucherCtaBlockType } from '@/payload-types'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { EasePack } from 'gsap/EasePack'
import { Flip } from 'gsap/Flip'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import React, { useCallback, useRef } from 'react'

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
  backgroundImage,
  id,
}) => {
  const resolvedEyebrow =
    eyebrow != null && String(eyebrow).trim() !== '' ? String(eyebrow).trim() : DEFAULTS.eyebrow
  const resolvedHeading = heading ?? DEFAULTS.heading
  const resolvedDescription = description ?? DEFAULTS.description
  const resolvedButtonLabel = buttonLabel ?? DEFAULTS.buttonLabel
  const resolvedButtonLink = buttonLink ?? DEFAULTS.buttonLink

  const sectionRef = useRef<HTMLElement>(null)
  const galleryWrapRef = useRef<HTMLDivElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const flipCtxRef = useRef<ReturnType<typeof gsap.context> | null>(null)

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

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: galleryEl,
          start: 'center center',
          end: '+=100%',
          scrub: true,
          pin: galleryWrap,
        },
      })
      tl.add(flip)

      return () => gsap.set(items, { clearProps: 'all' })
    })
  }, [])

  useGSAP(
    () => {
      createFlip()

      // Recreate on resize (same as CodePen)
      const onResize = () => createFlip()
      window.addEventListener('resize', onResize)

      /* ── Text reveal animation ── */
      const section = sectionRef.current
      if (!section) return

      const eyebrowEl = section.querySelector('[data-anim="eyebrow"]')
      const headingEl = section.querySelector('[data-anim="heading"]')
      const descEl = section.querySelector('[data-anim="desc"]')
      const ctaEl = section.querySelector('[data-anim="cta"]')
      const contentEl = section.querySelector('[data-anim="content"]')

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
        .to(headingEl, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' }, eyebrowEl ? '-=0.35' : 0)
        .to(descEl, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.5')
        .to(ctaEl, { y: 0, opacity: 1, scale: 1, duration: 0.65, ease: 'back.out(1.7)' }, '-=0.4')

      return () => {
        window.removeEventListener('resize', onResize)
        flipCtxRef.current?.revert()
      }
    },
    { scope: sectionRef, dependencies: [galleryImages, createFlip, eyebrow] },
  )

  if (visible === false) return null

  const images = galleryImages ?? []

  return (
    <section ref={sectionRef} id={id ?? undefined} className="w-full">
      {/* ── Bento Gallery (pinned on scroll) ── */}
      <div ref={galleryWrapRef} className="bento-gallery-wrap">
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

      {/* ── Text + Button below gallery (soft beige panel) ── */}
      <div
        data-anim="content"
        className="relative flex flex-col items-center overflow-hidden text-center section-padding-md container-padding bg-ff-ivory-mist"
      >
        {backgroundImage ? (
          <>
            <div className="absolute inset-0">
              <Media
                resource={backgroundImage}
                fill
                imgClassName="object-cover"
              />
            </div>
            <div className="absolute inset-0 bg-ff-ivory-mist/82" aria-hidden />
          </>
        ) : null}

        <div className="relative z-10 max-w-2xl flex flex-col items-center gap-3 sm:gap-5">
          {resolvedEyebrow ? (
            <p
              data-anim="eyebrow"
              className="text-eyebrow font-bold uppercase tracking-[0.2em] text-ff-gold-accent"
            >
              {resolvedEyebrow}
            </p>
          ) : null}
          <h2
            data-anim="heading"
            className="font-display font-bold tracking-tight text-ff-near-black text-balance"
          >
            {resolvedHeading}
          </h2>
          <p
            data-anim="desc"
            className="text-body-lg max-w-lg leading-relaxed text-ff-gray-text"
          >
            {resolvedDescription}
          </p>
          <Link
            data-anim="cta"
            href={resolvedButtonLink}
            className="inline-flex items-center justify-center rounded-full border-2 border-ff-charcoal/35 bg-transparent px-6 py-2.5 font-display text-base font-bold uppercase tracking-widest text-ff-near-black transition-all hover:border-ff-charcoal hover:bg-ff-charcoal hover:text-white hover:scale-[1.03] active:scale-[0.97]"
          >
            {resolvedButtonLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}

'use client'

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
  heading: 'Gift a special tasty experience',
  description: 'Share a tasty experience with someone special.',
  buttonLabel: 'Voucher',
  buttonLink: '/voucher',
}

type Props = VoucherCtaBlockType & { id?: string }

export const VoucherCtaBlock: React.FC<Props> = ({
  heading,
  description,
  buttonLabel,
  buttonLink,
  galleryImages,
  id,
}) => {
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

      const headingEl = section.querySelector('[data-anim="heading"]')
      const descEl = section.querySelector('[data-anim="desc"]')
      const ctaEl = section.querySelector('[data-anim="cta"]')
      const contentEl = section.querySelector('[data-anim="content"]')

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

      textTl
        .to(headingEl, { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out' })
        .to(descEl, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.5')
        .to(ctaEl, { y: 0, opacity: 1, scale: 1, duration: 0.65, ease: 'back.out(1.7)' }, '-=0.4')

      return () => {
        window.removeEventListener('resize', onResize)
        flipCtxRef.current?.revert()
      }
    },
    { scope: sectionRef, dependencies: [galleryImages, createFlip] },
  )

  const images = galleryImages ?? []

  return (
    <section ref={sectionRef} id={id ?? undefined} className="w-full">
      {/* ── Bento Gallery (pinned on scroll) ── */}
      <div ref={galleryWrapRef} className="bento-gallery-wrap">
        <div ref={galleryRef} className="bento-gallery bento-gallery--bento">
          {images.slice(0, 8).map((item, i) => {
            const img = typeof item.image === 'object' ? (item.image as MediaType) : null
            const imgUrl = img?.url
              ? img.url.startsWith('http') || img.url.startsWith('/')
                ? img.url
                : `${process.env.NEXT_PUBLIC_SERVER_URL || ''}${img.url}`
              : null
            return (
              <div key={item.id ?? i} className="bento-gallery__item" data-flip-id={`bento-${i}`}>
                {imgUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={imgUrl} alt={img?.alt || ''} />
                ) : (
                  <div className="bento-gallery__placeholder" />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Text + Button below gallery ── */}
      <div
        data-anim="content"
        className="flex flex-col items-center text-center section-padding-md container-padding"
        style={{ backgroundColor: '#E8E6E3' }}
      >
        <div className="max-w-2xl flex flex-col items-center gap-3 sm:gap-5">
          <h2 data-anim="heading" className="text-ff-black">
            {resolvedHeading}
          </h2>
          <p data-anim="desc" className="text-body-lg max-w-lg text-ff-charcoal leading-relaxed">
            {resolvedDescription}
          </p>
          <Link
            data-anim="cta"
            href={resolvedButtonLink}
            className="shadow-[inset_0_0_0_2px_#616467] text-ff-charcoal px-6 py-2.5 rounded-full tracking-widest uppercase font-display font-bold bg-transparent hover:bg-[#616467] hover:text-white hover:scale-[1.03] active:scale-[0.97] transition-all text-base"
          >
            {resolvedButtonLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}

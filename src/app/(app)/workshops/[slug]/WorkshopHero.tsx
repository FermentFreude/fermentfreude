'use client'

import { Media } from '@/components/Media'
import { resolveAnyLocalizedText } from '@/utilities/resolveLocalizedString'
import type { Media as MediaType } from '@/payload-types'
import { useEffect, useRef, useState } from 'react'

export type WorkshopHeroCMS = {
  eyebrow?: string | null
  title?: string | null
  description?: string | null
  attributes?: Array<{ text?: string | null }> | null
  image?: MediaType | string | null
}

function JarSilhouette({ className, delay }: { className?: string; delay: number }) {
  return (
    <div
      className={`relative overflow-hidden rounded-t-4xl rounded-b-lg bg-linear-to-b from-[#d6cfc6]/60 to-[#c4bdb4]/40 shadow-xl backdrop-blur-sm transition-all duration-1000 ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="absolute inset-x-3 top-1/3 h-[30%] rounded-sm bg-white/20 backdrop-blur-sm" />
      <div className="absolute inset-x-0 top-0 h-3 rounded-t-4xl bg-[#555954]/30" />
    </div>
  )
}

/** Generic hero for new workshops created from admin (standard template). */
export function WorkshopHero({ cms }: { cms?: WorkshopHeroCMS }) {
  const eyebrow = cms?.eyebrow ?? 'Workshop Experience'
  const titleRaw =
    typeof cms?.title === 'string' && cms.title.trim()
      ? cms.title
      : 'Discover\nFermentation'
  const titleLines = titleRaw.split('\n')
  const description =
    cms?.description ??
    'Join us for a hands-on fermentation workshop — learn, create, and take home your own ferments.'
  const attributes =
    (cms?.attributes?.length ?? 0) > 0
      ? cms!.attributes!.map((a) => resolveAnyLocalizedText(a.text)).filter(Boolean)
      : ['3 Stunden', 'Hands-on', 'Experience']

  const heroImage =
    cms?.image && typeof cms.image === 'object' && 'url' in cms.image
      ? (cms.image as MediaType)
      : null

  const [isVisible, setIsVisible] = useState(false)
  const heroRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-svh w-full overflow-hidden"
      style={{ backgroundColor: '#F6F0E8' }}
    >
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center select-none"
        aria-hidden="true"
      >
        <span
          className={`font-display text-[18vw] font-black uppercase tracking-[-0.04em] transition-opacity duration-1000 ${
            isVisible ? 'opacity-[0.04]' : 'opacity-0'
          }`}
          style={{ color: '#555954' }}
        >
          Workshop
        </span>
      </div>

      <div className="flex w-full flex-col lg:hidden">
        <div className="relative h-[58vh] min-h-56 w-full overflow-hidden">
          {heroImage ? (
            <>
              <Media
                resource={heroImage}
                fill
                imgClassName={`object-cover transition-all duration-1000 ${
                  isVisible ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
                }`}
                priority
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-linear-to-b from-transparent to-[#555954]/50" />
            </>
          ) : (
            <div className="flex h-full items-end justify-center pb-8 pt-28">
              <div
                className={`flex items-end gap-3 transition-all duration-1000 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
              >
                <JarSilhouette className="h-32 w-16 -rotate-6" delay={200} />
                <JarSilhouette className="h-40 w-18 rotate-2" delay={350} />
                <JarSilhouette className="h-28 w-14 rotate-6" delay={500} />
              </div>
            </div>
          )}
        </div>

        <div
          className="flex flex-col items-center px-6 pb-20 pt-4 text-center"
          style={{ backgroundColor: '#555954' }}
        >
          <p
            className={`mb-3 font-display text-[10px] font-bold uppercase tracking-[0.25em] text-white/70 transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            {eyebrow}
          </p>
          <h1
            className={`font-display text-2xl font-black leading-[1.08] tracking-tight text-white sm:text-3xl transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
            style={{ transitionDelay: '500ms' }}
          >
            {titleLines.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </h1>
          <p
            className={`mx-auto mt-4 max-w-sm text-sm leading-relaxed text-white/80 transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: '600ms' }}
          >
            {description}
          </p>
          <div
            className={`mt-3 flex flex-wrap items-center justify-center gap-4 transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: '750ms' }}
          >
            {attributes.map((attr, i) => (
              <span key={`hero-attr-${i}`} className="flex items-center gap-4">
                <span className="font-display text-[9px] font-semibold uppercase tracking-widest text-white/90">
                  {attr}
                </span>
                {i < attributes.length - 1 && (
                  <span className="h-3 w-px bg-white/25" aria-hidden="true" />
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="hidden h-full min-h-svh w-full lg:flex">
        <div className="relative w-1/2 overflow-hidden">
          {heroImage ? (
            <Media
              resource={heroImage}
              fill
              imgClassName={`object-cover transition-all duration-1000 ${
                isVisible ? 'scale-100 opacity-100' : 'scale-105 opacity-0'
              }`}
              priority
            />
          ) : (
            <div className="flex h-full items-end justify-center pb-16 pt-32">
              <div
                className={`flex items-end gap-4 transition-all duration-1000 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                }`}
              >
                <JarSilhouette className="h-48 w-24 -rotate-6" delay={200} />
                <JarSilhouette className="h-64 w-28 rotate-2" delay={350} />
                <JarSilhouette className="h-40 w-20 rotate-6" delay={500} />
              </div>
            </div>
          )}
        </div>

        <div
          className="flex w-1/2 flex-col justify-center px-12 xl:px-20"
          style={{ backgroundColor: '#555954' }}
        >
          <p
            className={`mb-4 font-display text-[10px] font-bold uppercase tracking-[0.25em] text-white/70 transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            {eyebrow}
          </p>
          <h1
            className={`font-display text-4xl font-black leading-[1.06] tracking-tight text-white xl:text-5xl transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            {titleLines.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </h1>
          <p
            className={`mt-6 max-w-md text-base leading-relaxed text-white/80 transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: '500ms' }}
          >
            {description}
          </p>
          <div
            className={`mt-8 flex items-center gap-4 transition-all duration-700 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
            style={{ transitionDelay: '600ms' }}
          >
            {attributes.map((attr, i) => (
              <span key={`hero-attr-${i}`} className="flex items-center gap-4">
                <span className="font-display text-[9px] font-semibold uppercase tracking-widest text-white/90">
                  {attr}
                </span>
                {i < attributes.length - 1 && (
                  <span className="h-3 w-px bg-white/25" aria-hidden="true" />
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

'use client'

import { Media } from '@/components/Media'
import type { Media as MediaType, TeamCardsBlock as TeamCardsBlockType } from '@/payload-types'
import { useEffect, useRef, useState } from 'react'

/* ── Static fallback images — same as Home/About, no R2 dependency ── */
const STATIC_TEAM_IMAGES: Record<string, string> = {
  'marcel rauminger': '/assets/images/team/marcel-rauminger.png',
  'david heider': '/assets/images/team/david-heider.png',
}

const DEFAULTS = {
  label: 'Our Team',
  heading: 'Meet the Experts Behind FermentFreude',
  members: [
    {
      name: 'Marcel Rauminger',
      role: 'Fermentation Specialist & Chef',
      description:
        'With over 17 years as a passionate chef and certificate in vegan cooking enriched by months in a Thai monastery, Marcel discovered the keys to fermentation and has become a specialist in creative fermented cuisine.',
    },
    {
      name: 'David Heider',
      role: 'Nutrition Specialist & Food Developer',
      description:
        'With a background in food science and economics, David is passionate about making complex scientific concepts digestible for everyone.',
    },
  ],
}

type Props = TeamCardsBlockType & { id?: string }

export const TeamCardsBlock: React.FC<Props> = ({ label, heading, members, id }) => {
  const resolvedLabel = label ?? DEFAULTS.label
  const resolvedHeading = heading ?? DEFAULTS.heading
  const resolvedMembers =
    members && members.length > 0
      ? members
      : DEFAULTS.members.map((m) => ({ ...m, image: null, id: null }))

  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.08 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      ref={sectionRef}
      id={id ?? undefined}
      className={`block-team-cards pt-0 pb-0 bg-white transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
      }`}
    >
      <div className="container mx-auto container-padding">
        <div className="flex flex-col items-center gap-1 content-wide mx-auto">
          <span className="text-eyebrow text-ff-gold-accent font-display font-semibold tracking-[0.2em]">
            {resolvedLabel}
          </span>
          <h2 className="mt-1 mb-[70px] text-section-heading font-display font-bold tracking-tight text-ff-near-black text-center">
            {resolvedHeading}
          </h2>
          <div className="grid w-full gap-2 md:gap-4 lg:grid-cols-2 content-wide mx-auto items-stretch">
            {resolvedMembers.map((member, idx) => {
              const staticSrc = member.name
                ? STATIC_TEAM_IMAGES[(member.name as string).toLowerCase()]
                : undefined
              const hasCmsImage =
                !staticSrc &&
                member.image &&
                typeof member.image === 'object' &&
                'url' in member.image

              return (
                <div
                  key={idx}
                  className="transition-all duration-500 ease-out flex"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? 'translateY(0)' : 'translateY(24px)',
                    transitionDelay: `${idx * 150}ms`,
                  }}
                >
                <article className="group flex flex-col h-full w-full overflow-hidden rounded-(--radius-xl) border-2 border-ff-border-light bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:border-ff-charcoal/20 hover:-translate-y-1">
                  <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-ff-warm-gray">
                    {staticSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={staticSrc}
                        alt={member.name || 'Team member'}
                        className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : hasCmsImage ? (
                      <Media
                        resource={member.image as MediaType}
                        fill
                        imgClassName="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 size-full bg-ff-warm-gray" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 px-4 pb-3 pt-3 min-h-[9rem]">
                    <h3 className="font-display text-subheading font-bold text-ff-near-black">
                      {member.name}
                    </h3>
                    <div className="w-12 h-0.5 bg-ff-gold-accent/60 rounded-full shrink-0" aria-hidden />
                    <p className="font-sans text-body font-semibold text-ff-gray-text shrink-0">
                      {member.role}
                    </p>
                    <p className="font-sans text-body leading-relaxed text-ff-gray-15 line-clamp-5">
                      {member.description}
                    </p>
                  </div>
                </article>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

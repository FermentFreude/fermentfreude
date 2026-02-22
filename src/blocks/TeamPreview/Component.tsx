import { FadeIn } from '@/components/FadeIn'
import { Media } from '@/components/Media'
import type { Media as MediaType, TeamPreviewBlock as TeamPreviewBlockType } from '@/payload-types'
import Link from 'next/link'

const DEFAULTS = {
  eyebrow: 'Our Team',
  heading: 'Only The Best Instructors',
  description:
    'Our founders David and Marcel bring years of experience in fermentation, food science, and culinary education. Every workshop is personally led by them.',
  buttonLabel: 'About us',
  buttonLink: '/about',
  members: [
    { name: 'David Heider', role: 'Founder & Instructor' },
    { name: 'Marcel Rauminger', role: 'Founder & Instructor' },
  ],
}

type Props = TeamPreviewBlockType & { id?: string }

export const TeamPreviewBlock: React.FC<Props> = ({
  eyebrow,
  heading,
  description,
  buttonLabel,
  buttonLink,
  members,
  id,
}) => {
  const resolvedEyebrow = eyebrow ?? DEFAULTS.eyebrow
  const resolvedHeading = heading ?? DEFAULTS.heading
  const resolvedDescription = description ?? DEFAULTS.description
  const resolvedButtonLabel = buttonLabel ?? DEFAULTS.buttonLabel
  const resolvedButtonLink = buttonLink ?? DEFAULTS.buttonLink
  const resolvedMembers = members && members.length > 0 ? members : DEFAULTS.members

  return (
    <section id={id ?? undefined} className="section-padding-md">
      <div className="container mx-auto px-6">
        {/* Mobile: text on top, Desktop: side by side */}
        <div className="flex flex-col lg:flex-row items-start gap-(--space-content-xl)">
          {/* Text side — appears first on mobile (natural DOM order), pushed right on desktop */}
          <FadeIn
            from="right"
            delay={200}
            className="flex flex-col gap-(--space-content-sm) w-full lg:max-w-sm lg:order-2 lg:pt-4"
          >
            {resolvedEyebrow && (
              <span className="text-eyebrow font-bold text-ff-gold-accent">{resolvedEyebrow}</span>
            )}
            <h2 className="text-ff-black">{resolvedHeading}</h2>
            <p className="text-body-sm text-ff-olive mt-1">{resolvedDescription}</p>
            {resolvedButtonLabel && (
              <Link
                href={resolvedButtonLink}
                className="inline-flex items-center justify-center rounded-full bg-ff-black text-white font-display font-bold text-base px-6 py-2.5 transition-all hover:bg-transparent hover:shadow-[inset_0_0_0_2px_var(--ff-black)] hover:text-ff-black hover:scale-[1.03] active:scale-[0.97] mt-4 w-fit"
              >
                {resolvedButtonLabel}
              </Link>
            )}
          </FadeIn>

          {/* Photos — below text on mobile (stacked), left side on desktop */}
          <div className="flex flex-col sm:flex-row gap-(--space-content-lg) lg:order-1 lg:flex-1 w-full">
            {resolvedMembers.map((member, index) => (
              <FadeIn
                key={index}
                delay={index * 150}
                className="flex flex-col items-center gap-(--space-content-sm) flex-1"
              >
                <div className="relative w-full aspect-3/4 rounded-2xl overflow-hidden">
                  {'image' in member && member.image && typeof member.image === 'object' ? (
                    <Media
                      resource={member.image as MediaType}
                      fill
                      imgClassName="object-cover hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-ff-warm-gray" />
                  )}
                </div>
                <div className="text-center mt-3">
                  <p className="font-display font-bold text-base text-ff-dark leading-tight">
                    {'name' in member ? member.name : DEFAULTS.members[index]?.name}
                  </p>
                  {'role' in member && member.role && (
                    <p className="text-sm text-ff-olive leading-tight">{member.role}</p>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

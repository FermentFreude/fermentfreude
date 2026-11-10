import { SectionHeader } from '@/components/SectionHeader'
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
  visible,
  eyebrow,
  heading,
  description,
  buttonLabel,
  buttonLink,
  members,
  id,
}) => {
  if (visible === false) return null
  const resolvedEyebrow = eyebrow ?? DEFAULTS.eyebrow
  const resolvedHeading = heading ?? DEFAULTS.heading
  const resolvedDescription = description ?? DEFAULTS.description
  const resolvedButtonLabel = buttonLabel ?? DEFAULTS.buttonLabel
  const resolvedButtonLink = buttonLink ?? DEFAULTS.buttonLink
  const resolvedMembers = members && members.length > 0 ? members : DEFAULTS.members

  return (
    <section id={id ?? undefined} className="section-padding-md">
      <div className="container mx-auto container-padding">
        {/* Header — shared editorial pattern; the button sits on the right on desktop */}
        <FadeIn>
          <SectionHeader
            eyebrow={resolvedEyebrow}
            heading={resolvedHeading}
            intro={resolvedDescription}
            introProps={{ className: 'whitespace-pre-line' }}
            aside={
              resolvedButtonLabel ? (
                <Link
                  href={resolvedButtonLink}
                  className="inline-flex w-fit items-center justify-center rounded-full bg-ff-black px-6 py-2.5 font-display text-base font-bold text-white transition-all hover:scale-[1.03] hover:bg-transparent hover:text-ff-black hover:shadow-[inset_0_0_0_2px_var(--ff-black)] active:scale-[0.97]"
                >
                  {resolvedButtonLabel}
                </Link>
              ) : null
            }
          />
        </FadeIn>

        <div className="mt-(--space-content-xl) flex flex-col items-start gap-(--space-content-xl)">
          {/* Photos — below text on mobile (stacked), left side on desktop */}
          <div className="flex w-full flex-col gap-(--space-content-lg) sm:flex-row">
            {resolvedMembers.map((member, index) => (
              <FadeIn
                key={index}
                delay={index * 150}
                className="flex flex-col items-center gap-(--space-content-sm) flex-1"
              >
                <div className="relative w-full max-w-xs mx-auto aspect-3/4 rounded-2xl overflow-hidden">
                  {'image' in member && member.image && typeof member.image === 'object' ? (
                    <Media
                      resource={member.image as MediaType}
                      fill
                      imgClassName="object-contain hover:scale-105 transition-transform duration-500"
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

import { FadeIn } from '@/components/FadeIn'
import { Media } from '@/components/Media'
import type { Media as MediaType, TeamPreviewBlock as TeamPreviewBlockType } from '@/payload-types'
import Link from 'next/link'

const DEFAULTS = {
  eyebrow: 'Our Team',
  heading: 'Only The Best Instructors',
  description:
    "Founded by passionate Nutritionist's & Chefs — you will be learning from the best. Our background brings you a wealth of experience, knowledge, and genuine care to every class we offer. Allow us to introduce you to the incredible individuals who make up our Fermentfreude team.",
  buttonLabel: 'About us',
  buttonLink: '/about',
  members: [
    { name: 'Marcel Haider', role: 'Instructor' },
    { name: 'Marcel Raunnigger', role: 'Instructor' },
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
      <div className="container mx-auto px-6 flex flex-col lg:flex-row items-start gap-(--space-content-xl)">
        {/* Photos */}
        <div className="flex gap-(--space-content-lg) flex-1">
          {resolvedMembers.map((member, index) => (
            <FadeIn
              key={index}
              delay={index * 150}
              className="flex flex-col items-center gap-(--space-content-sm)"
            >
              <div className="w-36 md:w-44 lg:w-52 aspect-3/4 rounded-2xl overflow-hidden">
                {'image' in member && member.image && typeof member.image === 'object' ? (
                  <Media
                    resource={member.image as MediaType}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full bg-ff-warm-gray" />
                )}
              </div>
              <div className="text-center">
                <p className="font-display font-medium text-base text-ff-dark">
                  {'name' in member ? member.name : DEFAULTS.members[index]?.name}
                </p>
                {'role' in member && member.role && (
                  <p className="text-caption text-ff-olive">{member.role}</p>
                )}
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Text side */}
        <FadeIn
          from="right"
          delay={200}
          className="flex flex-col gap-(--space-content-sm) max-w-xs lg:max-w-sm lg:pt-4"
        >
          {resolvedEyebrow && (
            <span className="text-eyebrow text-ff-gold-accent">{resolvedEyebrow}</span>
          )}
          <h2 className="text-ff-gold-accent">{resolvedHeading}</h2>
          <p className="text-body-sm text-ff-olive mt-1">{resolvedDescription}</p>
          {resolvedButtonLabel && (
            <Link
              href={resolvedButtonLink}
              className="inline-flex items-center justify-center rounded-full bg-ff-olive hover:bg-ff-olive-dark hover:scale-[1.03] active:scale-[0.97] transition-all text-ff-ivory-mist font-display font-bold text-base px-6 py-2.5 mt-4 w-fit"
            >
              {resolvedButtonLabel}
            </Link>
          )}
        </FadeIn>
      </div>
    </section>
  )
}

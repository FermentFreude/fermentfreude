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
    <section id={id ?? undefined} className="py-16 md:py-24 lg:py-25">
      <div className="container mx-auto px-6 flex flex-col lg:flex-row items-start gap-10 lg:gap-16">
        {/* Photos */}
        <div className="flex gap-6 md:gap-8 lg:gap-10 flex-1">
          {resolvedMembers.map((member, index) => (
            <div key={index} className="flex flex-col items-center gap-3">
              <div className="w-50 md:w-70 lg:w-95 xl:w-110 aspect-474/726 rounded-[40px] md:rounded-[60px] lg:rounded-[85px] overflow-hidden">
                {'image' in member && member.image && typeof member.image === 'object' ? (
                  <Media
                    resource={member.image as MediaType}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#ECE5DE]" />
                )}
              </div>
              <div className="text-center">
                <p className="font-display font-medium text-lg md:text-xl lg:text-2xl text-[#1e1e1e]">
                  {'name' in member ? member.name : DEFAULTS.members[index]?.name}
                </p>
                {'role' in member && member.role && (
                  <p className="font-display font-light text-sm md:text-base text-[#4b4f4a]">
                    {member.role}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Text side */}
        <div className="flex flex-col gap-3 lg:gap-4 max-w-105 lg:pt-6">
          {resolvedEyebrow && (
            <span className="font-display font-medium text-lg md:text-xl lg:text-2xl text-[#626160] tracking-[2px] capitalize">
              {resolvedEyebrow}
            </span>
          )}
          <h2 className="font-display font-bold text-3xl md:text-4xl lg:text-[50px] leading-[0.95] text-[#e5b765]">
            {resolvedHeading}
          </h2>
          <p className="font-display font-bold text-sm md:text-base leading-relaxed text-[#4b4f4a] tracking-tight mt-2">
            {resolvedDescription}
          </p>
          {resolvedButtonLabel && (
            <Link
              href={resolvedButtonLink}
              className="inline-flex items-center justify-center rounded-4xl bg-[#4b4f4a] hover:bg-[#3a3e3a] transition-colors text-[#faf2e0] font-display font-bold text-lg md:text-xl lg:text-2xl px-10 py-4 lg:px-14 lg:py-5 mt-6 w-fit"
            >
              {resolvedButtonLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}

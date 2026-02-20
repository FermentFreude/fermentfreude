import { Media } from '@/components/Media'
import type { Media as MediaType, TeamCardsBlock as TeamCardsBlockType } from '@/payload-types'

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

  return (
    <section id={id ?? undefined} className="w-full pt-4 pb-24 md:py-24">
      <div className="mx-auto max-w-350 px-3 md:px-6">
        <div className="flex flex-col items-center gap-12 md:gap-16">
          <h2 className="font-display text-3xl font-bold text-[#E5B765] animate-fade-in">
            {resolvedLabel}
          </h2>
          <h3 className="font-display text-center text-5xl font-bold text-[#1D1D1D] animate-fade-in-up animate-delay-200">
            {resolvedHeading}
          </h3>
          <div className="grid w-full gap-12 md:grid-cols-2">
            {resolvedMembers.map((member, idx) => {
              const hasImage = member.image && typeof member.image === 'object'

              return (
                <div
                  key={idx}
                  className="flex aspect-1/2 flex-col overflow-hidden rounded-3xl bg-white shadow-lg animate-fade-in-up hover:scale-[1.02] transition-transform duration-300"
                  style={{ animationDelay: `${(idx + 1) * 200}ms` }}
                >
                  <div className="relative aspect-3/4 w-full overflow-hidden">
                    {hasImage ? (
                      <Media
                        resource={member.image as MediaType}
                        fill
                        imgClassName="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 size-full bg-[#ECE5DE]" />
                    )}
                  </div>
                  <div className="flex flex-col gap-4 px-8 pb-8 pt-6 text-center">
                    <h3 className="font-display text-3xl font-bold text-[#1D1D1D]">
                      {member.name}
                    </h3>
                    <p className="font-sans text-base font-normal text-[#E5B765]">{member.role}</p>
                    <p className="font-sans text-base leading-relaxed text-[#1D1D1D]">
                      {member.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

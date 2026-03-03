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

export const TeamCardsBlock: React.FC<Props> = ({ label, heading, members }) => {
  const resolvedLabel = label ?? DEFAULTS.label
  const resolvedHeading = heading ?? DEFAULTS.heading
  const resolvedMembers =
    members && members.length > 0
      ? members
      : DEFAULTS.members.map((m) => ({ ...m, image: null, id: null }))

  return (
    <section id="team" className="section-padding-lg bg-ff-ivory">
      <div className="container mx-auto container-padding">
        <div className="mx-auto max-w-[var(--content-wide)]">
          <div className="text-center">
            <span className="text-eyebrow text-ff-olive">{resolvedLabel}</span>
            <h2 className="mt-2 text-ff-black">{resolvedHeading}</h2>
            <div className="mx-auto mt-4 h-px w-16 bg-ff-gold-accent" />
          </div>
          <div className="mt-12 grid grid-cols-1 items-stretch gap-8 md:grid-cols-2 md:gap-12 lg:gap-16">
            {resolvedMembers.map((member, idx) => {
              const hasImage = member.image && typeof member.image === 'object'

              return (
                <div
                  key={idx}
                  className="flex h-full flex-col overflow-hidden rounded-[var(--radius-xl)] border border-ff-border-light bg-white shadow-md transition-shadow duration-300 hover:shadow-lg"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden">
                    {hasImage ? (
                      <Media
                        resource={member.image as MediaType}
                        fill
                        imgClassName="object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 size-full bg-ff-warm-gray" />
                    )}
                    {/* Light gradient overlay at bottom */}
                    <div
                      className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent"
                      aria-hidden
                    />
                  </div>
                  <div className="flex min-h-0 flex-1 flex-col gap-3 px-6 pb-6 pt-5">
                    <span
                      className="font-display text-caption font-bold uppercase tracking-widest text-ff-gold-accent"
                      aria-hidden
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-display text-subheading text-ff-black">{member.name}</h3>
                    <p className="font-sans text-body-sm font-bold uppercase tracking-wide text-ff-olive">
                      {member.role}
                    </p>
                    <p className="font-sans text-body leading-relaxed text-ff-black/80">
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

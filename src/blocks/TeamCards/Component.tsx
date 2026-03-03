import { FadeIn } from '@/components/FadeIn'
import { Media } from '@/components/Media'
import type { Media as MediaType, TeamCardsBlock as TeamCardsBlockType } from '@/payload-types'
import { cn } from '@/utilities/cn'

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
    <section id={id ?? undefined} className="section-padding-lg bg-ff-ivory overflow-hidden bg-dot-pattern-light">
      <div className="container mx-auto container-padding">
        <FadeIn>
          <div className="flex flex-col items-center gap-12 md:gap-16 content-wide mx-auto">
            <span className="text-eyebrow text-ff-gold-accent tracking-widest">{resolvedLabel}</span>
            <h2 className="text-center text-ff-black">{resolvedHeading}</h2>
          </div>
        </FadeIn>

        {/* Staggered creative grid */}
        <div className="grid w-full gap-8 md:grid-cols-2 md:gap-12 lg:gap-16 items-stretch mt-12 md:mt-16">
          {resolvedMembers.map((member, idx) => {
            const hasImage = member.image && typeof member.image === 'object'
            const isEven = idx % 2 === 0

            return (
              <FadeIn key={idx} delay={idx * 150} from="bottom" className="h-full">
                <div
                  className={cn(
                    'group relative flex h-full flex-col overflow-hidden rounded-(--radius-2xl) bg-white shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-ff-border-light transition-all duration-500 hover:shadow-[0_16px_56px_rgba(0,0,0,0.12)]',
                    isEven ? 'md:mt-0' : 'md:-mt-8 lg:-mt-12',
                  )}
                >
                  {/* Gold accent bar — visible, brightens on hover */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-ff-gold-accent/60 group-hover:bg-ff-gold-accent z-10 transition-colors duration-300" aria-hidden />

                  {/* Display numeral */}
                  <div className="absolute top-4 right-4 z-10 font-display text-6xl md:text-7xl font-bold text-ff-gold-accent/15 select-none" aria-hidden>
                    {String(idx + 1).padStart(2, '0')}
                  </div>

                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-(--radius-2xl)">
                    {hasImage ? (
                      <Media
                        resource={member.image as MediaType}
                        fill
                        imgClassName="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 size-full bg-ff-warm-gray" />
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-linear-to-t from-ff-black/30 via-transparent to-transparent pointer-events-none" />
                  </div>
                  <div className="relative flex min-h-0 flex-1 flex-col gap-3 px-8 pb-8 pt-6">
                    <h3 className="font-display text-subheading text-ff-black">
                      {member.name}
                    </h3>
                    <p className="font-sans text-body-sm font-medium text-ff-gold-accent uppercase tracking-widest">
                      {member.role}
                    </p>
                    <p className="font-sans text-body leading-relaxed text-ff-olive">
                      {member.description}
                    </p>
                  </div>
                </div>
              </FadeIn>
            )
          })}
        </div>
      </div>
    </section>
  )
}

import { FadeIn } from '@/components/FadeIn'
import { Media } from '@/components/Media'
import type { Media as MediaType, SponsorsBarBlock as SponsorsBarBlockType } from '@/payload-types'

const DEFAULTS = {
  heading: 'This project is supported by:',
}

type Props = SponsorsBarBlockType & { id?: string }

export const SponsorsBarBlock: React.FC<Props> = ({ heading, sponsors, id }) => {
  const resolvedHeading = heading ?? DEFAULTS.heading
  const resolvedSponsors = sponsors ?? []

  return (
    <section id={id ?? undefined} className="bg-ff-warm-gray section-padding-md container-padding border-t border-ff-border-light bg-dot-pattern">
      <div className="container mx-auto flex flex-col items-center gap-(--space-content-lg)">
        <FadeIn>
          <p className="text-body-sm text-ff-olive text-center uppercase tracking-widest font-medium">
            {resolvedHeading}
          </p>
        </FadeIn>

        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 w-full content-wide mx-auto">
          {resolvedSponsors.map((sponsor, index) => {
            const logo = sponsor.logo
            const content = (
              <FadeIn
                key={index}
                delay={index * 100}
                className="flex items-center justify-center h-12 md:h-14 w-28 md:w-32 rounded-(--radius-lg) bg-white/80 backdrop-blur-sm border border-ff-border-light/60 p-4 grayscale hover:grayscale-0 opacity-90 hover:opacity-100 transition-all duration-500 hover:shadow-md hover:border-ff-gold-accent/30"
              >
                {logo && typeof logo === 'object' ? (
                  <Media
                    resource={logo as MediaType}
                    className="h-full w-auto object-contain max-w-24 md:max-w-28"
                  />
                ) : (
                  <div className="h-full w-20 bg-ff-sponsor-placeholder rounded-(--radius-md)" />
                )}
              </FadeIn>
            )

            if (sponsor.url) {
              return (
                <a
                  key={index}
                  href={sponsor.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center"
                >
                  {content}
                </a>
              )
            }

            return content
          })}
        </div>
      </div>
    </section>
  )
}
